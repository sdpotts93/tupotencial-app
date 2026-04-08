import OpenAI from 'openai'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getSystemPrompt, MAX_MESSAGES_PER_DAY, MAX_TOKENS_PER_MONTH, MAX_MESSAGE_LENGTH, RECENT_MESSAGES_WINDOW, SUMMARY_PROMPT, buildContextMessages } from '~~/server/utils/ai-prompts'

// Per-user rate limit: 1 request every 3 seconds
const lastRequestByUser = new Map<string, number>()
const RATE_LIMIT_MS = 3_000

export default defineEventHandler(async (event) => {
  // 1. Auth check
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })
  const userId = user.id ?? (user as any).sub as string
  if (!userId) throw createError({ statusCode: 401, message: 'No se pudo obtener el ID del usuario' })

  // 1b. Per-user rate limit
  const now = Date.now()
  const lastReq = lastRequestByUser.get(userId)
  if (lastReq && now - lastReq < RATE_LIMIT_MS) {
    throw createError({ statusCode: 429, message: 'Espera unos segundos antes de enviar otro mensaje' })
  }
  lastRequestByUser.set(userId, now)

  const client = serverSupabaseServiceRole(event)
  const body = await readBody<{
    sessionId: string
    message: string
    tone?: 'carlotta' | 'gabriel'
  }>(event)

  const { sessionId, tone } = body
  const message = body.message?.trim().slice(0, MAX_MESSAGE_LENGTH)
  if (!message) throw createError({ statusCode: 400, message: 'Mensaje vacío' })

  // 2. Check daily quota (Mexico City timezone)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const { data: quota } = await client.from('ai_quotas')
    .select('*')
    .eq('user_id', userId)
    .eq('day', today)
    .maybeSingle()

  if (quota && quota.messages_used >= MAX_MESSAGES_PER_DAY) {
    throw createError({ statusCode: 429, message: 'Límite diario alcanzado' })
  }

  // 2b. Check global monthly token cap
  const currentMonth = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }).slice(0, 7) // YYYY-MM
  const { data: globalUsage } = await client.from('ai_global_usage')
    .select('tokens_used')
    .eq('month', currentMonth)
    .maybeSingle()

  if (globalUsage && globalUsage.tokens_used >= MAX_TOKENS_PER_MONTH) {
    throw createError({ statusCode: 429, message: 'Servicio temporalmente no disponible. Intenta más tarde.' })
  }

  // 3. Get or create session
  let activeSessionId = sessionId
  if (sessionId === 'new') {
    const { data: session, error } = await client.from('ai_sessions')
      .insert({ user_id: userId, tone: tone ?? 'carlotta', status: 'active' })
      .select('id')
      .single()
    if (error || !session) throw createError({ statusCode: 500, message: `Error al crear sesión: ${error?.message}` })
    activeSessionId = session.id
  }

  // 4. Insert user message
  await client.from('ai_messages').insert({
    session_id: activeSessionId,
    user_id: userId,
    role: 'user',
    content: message,
  })

  // 5. Load conversation history, session summary, and user profile in parallel
  const [{ data: history }, { data: profile }, { data: sessionRow }] = await Promise.all([
    client.from('ai_messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: true })
      .limit(50),
    client.from('profiles')
      .select('display_name, onboarding_motivation, onboarding_focus, onboarding_time')
      .eq('id', userId)
      .single(),
    client.from('ai_sessions')
      .select('tone, summary')
      .eq('id', activeSessionId)
      .single(),
  ])

  const filteredHistory = (history ?? []).filter(m => m.role === 'user' || m.role === 'assistant')

  // 5b. Generate summary of older messages if conversation is long and no summary exists yet
  const apiKey = useRuntimeConfig().openaiApiKey as string
  if (!apiKey) throw createError({ statusCode: 500, message: 'OpenAI API key no configurada' })
  const openai = new OpenAI({ apiKey })

  let sessionSummary: string | null = sessionRow?.summary ?? null

  const olderCount = filteredHistory.length - RECENT_MESSAGES_WINDOW
  // Generate summary at 20, 30, 40… total messages (every 10 after the recent window)
  const totalMessages = filteredHistory.length
  const shouldGenerateSummary = olderCount > 0 && (!sessionSummary || totalMessages % RECENT_MESSAGES_WINDOW === 0)
  if (shouldGenerateSummary) {
    const olderMessages = filteredHistory.slice(0, -RECENT_MESSAGES_WINDOW)
    // Cap input to ~5k tokens (~20k chars for Spanish text)
    const MAX_SUMMARY_INPUT_CHARS = 20_000
    let conversationText = ''
    for (const m of olderMessages) {
      const line = `${m.role === 'user' ? 'Usuario' : 'Coach'}: ${m.content.slice(0, 300)}\n`
      if (conversationText.length + line.length > MAX_SUMMARY_INPUT_CHARS) break
      conversationText += line
    }

    // Fire-and-forget: don't block the main response
    openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: SUMMARY_PROMPT },
        { role: 'user', content: conversationText },
      ],
    }).then(async (summaryResponse) => {
      const usage = summaryResponse.usage
      console.log(`[AI Summary] Tokens — prompt: ${usage?.prompt_tokens}, completion: ${usage?.completion_tokens}, total: ${usage?.total_tokens}`)
      console.log(`[AI Summary] Finish reason: ${summaryResponse.choices[0]?.finish_reason}`)
      const raw = summaryResponse.choices[0]?.message?.content?.trim()
      if (raw) {
        const { error: updateErr } = await client.from('ai_sessions')
          .update({ summary: raw })
          .eq('id', activeSessionId)
        if (updateErr) console.warn('[AI Summary] Failed to save:', updateErr.message)
        else console.log(`[AI Summary] Saved: ${raw.slice(0, 80)}...`)
      } else {
        console.warn(`[AI Summary] Empty response`)
      }
    }).catch((err) => {
      console.warn('[AI Summary] Failed:', err instanceof Error ? err.message : err)
    })
  }

  // 6. Resolve tone for system prompt
  const sessionTone = sessionRow?.tone as 'carlotta' | 'gabriel' ?? tone ?? 'carlotta'

  // 7. Build OpenAI messages with token-budgeted context
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'developer', content: getSystemPrompt(sessionTone, {
      displayName: profile?.display_name,
      motivation: profile?.onboarding_motivation,
      focus: profile?.onboarding_focus,
      time: profile?.onboarding_time,
    }) },
    ...buildContextMessages(filteredHistory, sessionSummary),
  ]

  // 8. Create OpenAI streaming completion
  const stream = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: openaiMessages,
    stream: true,
    stream_options: { include_usage: true },
    max_completion_tokens: 500,
  })

  // 9. Set up SSE response
  setResponseHeader(event, 'Content-Type', 'text/event-stream')
  setResponseHeader(event, 'Cache-Control', 'no-cache')
  setResponseHeader(event, 'Connection', 'keep-alive')

  const res = event.node.res
  let fullContent = ''
  let tokensIn = 0
  let tokensOut = 0

  // 10. Stream chunks to client
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      fullContent += delta
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: delta })}\n\n`)
    }
    // Usage comes in the final chunk when stream_options.include_usage is true
    if (chunk.usage) {
      tokensIn = chunk.usage.prompt_tokens ?? 0
      tokensOut = chunk.usage.completion_tokens ?? 0
    }
  }

  // 11. Insert assistant message into DB
  const { data: assistantMsg } = await client.from('ai_messages')
    .insert({
      session_id: activeSessionId,
      user_id: userId,
      role: 'assistant',
      content: fullContent,
      tokens_in: tokensIn || null,
      tokens_out: tokensOut || null,
    })
    .select('id')
    .single()

  // 12. Upsert daily quota + global monthly usage
  const totalRequestTokens = tokensIn + tokensOut
  await Promise.all([
    client.from('ai_quotas').upsert({
      user_id: userId,
      day: today,
      messages_used: (quota?.messages_used ?? 0) + 1,
      tokens_used: (quota?.tokens_used ?? 0) + totalRequestTokens,
    }),
    client.from('ai_global_usage').upsert({
      month: currentMonth,
      tokens_used: (globalUsage?.tokens_used ?? 0) + totalRequestTokens,
    }),
  ])

  // 13. Send completion event (include remaining quota) and close
  const messagesUsed = (quota?.messages_used ?? 0) + 1
  res.write(`data: ${JSON.stringify({
    type: 'done',
    sessionId: activeSessionId,
    messageId: assistantMsg?.id,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    messages_remaining: MAX_MESSAGES_PER_DAY - messagesUsed,
  })}\n\n`)
  res.end()
})
