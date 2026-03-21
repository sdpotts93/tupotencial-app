-- =============================================================================
-- Push notification tokens — stores device tokens per user
-- =============================================================================

BEGIN;

-- push_tokens ----------------------------------------------------------------
CREATE TABLE public.push_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text NOT NULL,
  platform   text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

-- Index: lookup tokens by user for sending
CREATE INDEX idx_push_tokens_user ON public.push_tokens (user_id);

-- Index: lookup by token for dedup/cleanup
CREATE INDEX idx_push_tokens_token ON public.push_tokens (token);

-- Trigger: updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can read their own tokens
DROP POLICY IF EXISTS "push_tokens_select_own" ON public.push_tokens;
CREATE POLICY "push_tokens_select_own" ON public.push_tokens
  FOR SELECT USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

-- Users can insert their own tokens
DROP POLICY IF EXISTS "push_tokens_insert_own" ON public.push_tokens;
CREATE POLICY "push_tokens_insert_own" ON public.push_tokens
  FOR INSERT WITH CHECK (
    user_id = (select auth.uid())
  );

-- Users can update their own tokens (refresh)
DROP POLICY IF EXISTS "push_tokens_update_own" ON public.push_tokens;
CREATE POLICY "push_tokens_update_own" ON public.push_tokens
  FOR UPDATE USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Users can delete their own tokens (logout cleanup)
DROP POLICY IF EXISTS "push_tokens_delete_own" ON public.push_tokens;
CREATE POLICY "push_tokens_delete_own" ON public.push_tokens
  FOR DELETE USING (
    user_id = (select auth.uid())
    OR public.is_admin()
  );

COMMIT;
