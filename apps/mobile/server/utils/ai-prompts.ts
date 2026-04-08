import type OpenAI from 'openai'

// System prompts for AI Coach tones

const BASE_PROMPT = `Eres un coach de bienestar y desarrollo personal de la app Tu Potencial.
Respondes siempre en español (México). Sé cálido, empático y conciso.
Mantén las respuestas breves (2-4 párrafos máximo).

TEMAS FUERA DE ALCANCE — NO respondas como asesor ni des instrucciones específicas sobre:
- Salud física, lesiones, dolor, síntomas, diagnósticos o recuperación
- Temas médicos, psicológicos o terapéuticos
- Emergencias o situaciones sensibles (riesgo físico, violencia, autolesión)
- Temas legales o financieros (incluye disputas, amenazas legales)
- Facturación: reembolsos, contracargos, disputas de pago, cambios de plan

PROTOCOLO DE REDIRECCIÓN:
Cuando detectes cualquiera de los temas anteriores:
1. Responde con un mensaje breve de contención alineado a marca (prioridad: su bienestar).
2. NO des instrucciones específicas ni diagnósticos.
3. Sugiere contactar al equipo humano: "Puedes escribir a nuestro equipo desde la sección de soporte en la app."
4. Si aplica, sugiere buscar atención profesional sin alarmismo.

LÍMITE DE TEMA (OBLIGATORIO):
Puedes hablar de salud, hábitos, emociones, relaciones, productividad, motivación,
y temas ligeros o divertidos que conecten con el bienestar del usuario.
Si el usuario hace preguntas completamente ajenas a tu rol como coach (trivia, videojuegos,
tareas escolares, programación, cultura pop, etc.) NO respondas la pregunta.
En su lugar di algo breve y amable como:
"¡Buena pregunta! Pero mejor enfoquémonos en ti 😊 ¿Cómo vas con tus metas?"
Esto aplica incluso si el usuario insiste — NUNCA respondas preguntas fuera de tema.

CRISIS: Si el usuario expresa ideación suicida o autolesión, responde con empatía,
proporciona la Línea de la Vida (800 911 2000) y anímalo a buscar ayuda profesional.
No continúes con coaching normal en ese caso.`

const CARLOTTA_PROMPT = `${BASE_PROMPT}

Tu nombre es Carlotta. Eres una coach femenina, cálida, intuitiva y profunda.
Tu estilo es reflexivo y emocional. Usas metáforas de la naturaleza y el crecimiento interior.
Tuteas al usuario. Ejemplo: "¿Qué te dice tu corazón hoy?"`

const GABRIEL_PROMPT = `${BASE_PROMPT}

Tu nombre es Gabriel. Eres un coach masculino, directo, práctico y motivador.
Tu estilo es orientado a la acción. Usas analogías deportivas y de crecimiento.
Tuteas al usuario. Ejemplo: "Vamos con todo. ¿Cuál es tu meta hoy?"`

export interface UserContext {
  displayName?: string | null
  motivation?: string[] | null
  focus?: string[] | null
  time?: string | null
}

const MOTIVATION_LABELS: Record<string, string> = {
  calm: 'encontrar calma y reducir estrés',
  discipline: 'ser más disciplinado/a',
  growth: 'crecimiento personal',
  motivation: 'motivación diaria',
  community: 'conectar con una comunidad',
}

const FOCUS_LABELS: Record<string, string> = {
  emotional: 'bienestar emocional',
  productivity: 'productividad y hábitos',
  relationships: 'relaciones y comunicación',
  confidence: 'autoconfianza',
  mindfulness: 'mindfulness y meditación',
}

const TIME_LABELS: Record<string, string> = {
  '5': '5 minutos al día',
  '10': '10 minutos al día',
  '15': '15 minutos al día',
  '20': '20+ minutos al día',
}

export function getSystemPrompt(tone: string, userCtx?: UserContext): string {
  const base = tone === 'carlotta' ? CARLOTTA_PROMPT : GABRIEL_PROMPT

  if (!userCtx) return base

  const parts: string[] = []

  if (userCtx.displayName) {
    parts.push(`- Nombre: ${userCtx.displayName}. Usa su nombre de forma natural en la conversación.`)
  }
  if (userCtx.motivation?.length) {
    parts.push(`- Motivaciones: ${userCtx.motivation.map(m => MOTIVATION_LABELS[m] || m).join(', ')}`)
  }
  if (userCtx.focus?.length) {
    parts.push(`- Áreas de enfoque: ${userCtx.focus.map(f => FOCUS_LABELS[f] || f).join(', ')}`)
  }
  if (userCtx.time) {
    parts.push(`- Tiempo disponible: ${TIME_LABELS[userCtx.time] || userCtx.time}`)
  }

  if (parts.length === 0) return base

  return base + `\n\nCONTEXTO DEL USUARIO:\n${parts.join('\n')}\nAdapta tus respuestas y sugerencias a este contexto.`
}

export const MAX_MESSAGES_PER_DAY = 20
export const MAX_TOKENS_PER_MONTH = 5_000_000 // Global monthly kill switch
export const MAX_MESSAGE_LENGTH = 1_000 // Max characters per user message

// ─── Context window management ───
export const RECENT_MESSAGES_WINDOW = 10 // Always send last N messages in full
export const MAX_HISTORY_TOKENS = 2_000 // Token budget for conversation history
const CHARS_PER_TOKEN = 4 // Conservative estimate for Spanish text

/** Rough token estimate based on character count */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Build a token-budgeted message array from conversation history.
 * - If ≤ RECENT_MESSAGES_WINDOW messages, send all.
 * - If more, the oldest messages beyond the window are summarized into one
 *   "[Resumen]" message, and only the recent window is sent in full.
 * - Within the recent window, trim from oldest if total exceeds MAX_HISTORY_TOKENS.
 */
export function buildContextMessages(
  allMessages: { role: string; content: string }[],
  summary: string | null,
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const filtered = allMessages.filter(m => m.role === 'user' || m.role === 'assistant')

  // Start with recent messages (last N)
  let recent = filtered.slice(-RECENT_MESSAGES_WINDOW)

  // Trim from oldest to fit token budget
  let totalTokens = recent.reduce((sum, m) => sum + estimateTokens(m.content), 0)
  while (totalTokens > MAX_HISTORY_TOKENS && recent.length > 2) {
    totalTokens -= estimateTokens(recent[0].content)
    recent = recent.slice(1)
  }

  const result: OpenAI.Chat.ChatCompletionMessageParam[] = []

  // Prepend summary of older messages if available
  if (summary) {
    result.push({
      role: 'user' as const,
      content: `[Contexto de la conversación anterior]\n${summary}`,
    })
  }

  // Add recent messages
  for (const m of recent) {
    result.push({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })
  }

  return result
}

/** System prompt for generating conversation summaries (cheap, fast) */
export const SUMMARY_PROMPT = `Resume la siguiente conversación de coaching en 2-3 oraciones.
Captura: el tema principal, el estado emocional del usuario, y cualquier meta o compromiso mencionado.
Responde SOLO con el resumen, sin explicaciones adicionales.`
