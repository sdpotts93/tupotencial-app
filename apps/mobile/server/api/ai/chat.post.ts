import OpenAI from 'openai'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getSystemPrompt, MAX_MESSAGES_PER_DAY } from '~~/server/utils/ai-prompts'

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

  const { sessionId, message, tone } = body
  if (!message?.trim()) throw createError({ statusCode: 400, message: 'Mensaje vacío' })

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
    content: message.trim(),
  })

  // 5. Load conversation history + user profile in parallel
  const [{ data: history }, { data: profile }] = await Promise.all([
    client.from('ai_messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .order('created_at', { ascending: true })
      .limit(50),
    client.from('profiles')
      .select('display_name, onboarding_motivation, onboarding_focus, onboarding_time')
      .eq('id', userId)
      .single(),
  ])

  // 6. Resolve tone for system prompt
  let sessionTone = tone
  if (!sessionTone) {
    const { data: sessionData } = await client.from('ai_sessions')
      .select('tone')
      .eq('id', activeSessionId)
      .single()
    sessionTone = (sessionData?.tone as 'carlotta' | 'gabriel') ?? 'carlotta'
  }

  // 7. Build OpenAI messages
  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'developer', content: getSystemPrompt(sessionTone, {
      displayName: profile?.display_name,
      motivation: profile?.onboarding_motivation,
      focus: profile?.onboarding_focus,
      time: profile?.onboarding_time,
    }) },
    ...(history ?? [])
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
  ]

  // 8. Create OpenAI streaming completion
  const apiKey = useRuntimeConfig().openaiApiKey as string
  if (!apiKey) throw createError({ statusCode: 500, message: 'OpenAI API key no configurada' })

  const openai = new OpenAI({ apiKey })
  const stream = await openai.chat.completions.create({
    model: 'gpt-5.2',
    messages: openaiMessages,
    stream: true,
    stream_options: { include_usage: true },
    max_completion_tokens: 500,
    temperature: 0.8,
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

  // 12. Upsert daily quota
  await client.from('ai_quotas').upsert({
    user_id: userId,
    day: today,
    messages_used: (quota?.messages_used ?? 0) + 1,
    tokens_used: (quota?.tokens_used ?? 0) + tokensIn + tokensOut,
  })

  // 13. Send completion event and close
  res.write(`data: ${JSON.stringify({
    type: 'done',
    sessionId: activeSessionId,
    messageId: assistantMsg?.id,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
  })}\n\n`)
  res.end()
})
