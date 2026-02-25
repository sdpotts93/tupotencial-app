# Feature: Mobile — AI Coach

## Goal
Provide users with a conversational AI coaching experience with two tone variants and daily limits.

## User stories
- As a user, I can choose a coach tone (Carlotta/Gabriel)
- As a user, I can start a new conversation or continue an existing one
- As a user, I can chat with the AI coach and receive guidance
- As a user, I see my daily message limit

## Screens (routes)
- `/ai` — AI Home (tone selector, quick prompts, session history)
- `/ai/chat/[sessionId]` — Chat interface (message bubbles, composer, typing indicator)

## Data model
- Tables: `ai_sessions`, `ai_messages`, `ai_quotas`
- Optional: `ai_global_usage`

## RLS rules
- ai_sessions: user read/insert own
- ai_messages: user read/insert own
- ai_quotas: user read/upsert own

## Analytics events
- `ai_session_started`, `ai_message_sent`, `ai_message_failed`, `ai_limit_reached`, `ai_session_closed`

## Edge cases
- Daily limit reached → "Límite alcanzado" state with reset time
- Server call failure → "Reintentar" action
- Safety category triggered → de-escalation message + crisis resources (Mexico)
- Self-harm intent → safe response with emergency contacts

## Done criteria
- [ ] Tone selection persists
- [ ] Chat sends user message and receives AI response
- [ ] Typing indicator shows during generation
- [ ] Quick prompts work
- [ ] Session history navigable
- [ ] Daily limit enforced
- [ ] Safety disclaimer shown
- [ ] Crisis response implemented

## Tests
- [ ] Message flow (send → receive)
- [ ] Limit enforcement
- [ ] Session creation and continuation
- [ ] Safety category handling
