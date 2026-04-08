-- Add summary column to ai_sessions for conversation context compression
ALTER TABLE public.ai_sessions
  ADD COLUMN IF NOT EXISTS summary text;

COMMENT ON COLUMN public.ai_sessions.summary IS
  'AI-generated summary of older messages, used to compress context window';
