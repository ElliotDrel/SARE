-- Migration: Add safe storyteller email RPCs and supporting index
-- Purpose: Replace removed get_storyteller_by_email with minimal, secure alternatives
-- - is_storyteller_email(email) -> boolean (anon+authenticated)
-- - get_storyteller_id_for_email(email) -> uuid (anon+authenticated)
-- - get_invitation_token_for_current_user() -> uuid (authenticated only)

-- 0) Clean up deprecated function if it still exists
DROP FUNCTION IF EXISTS public.get_storyteller_by_email(text);

-- 1) Case-insensitive email index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_storytellers_email_lower
  ON public.storytellers (lower(email));

-- 2) Minimal boolean check to avoid leaking PII/token
CREATE OR REPLACE FUNCTION public.is_storyteller_email(target_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.storytellers s
    WHERE lower(s.email) = lower(trim(target_email))
  );
$$;

REVOKE ALL ON FUNCTION public.is_storyteller_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_storyteller_email(text) TO anon, authenticated;

-- 3) Fetch storyteller id by email (used to pass metadata in OTP flow)
--    Returns NULL if not found. Does not expose any other fields.
CREATE OR REPLACE FUNCTION public.get_storyteller_id_for_email(target_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT s.id
  FROM public.storytellers s
  WHERE lower(s.email) = lower(trim(target_email))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_storyteller_id_for_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_storyteller_id_for_email(text) TO anon, authenticated;

-- 4) Resolve invitation token post-auth using current user id
--    Requires the callback to associate auth_user_id via update_storyteller_access first
CREATE OR REPLACE FUNCTION public.get_invitation_token_for_current_user()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT s.invitation_token
  FROM public.storytellers s
  WHERE s.auth_user_id = auth.uid()
    AND (s.token_expires_at IS NULL OR s.token_expires_at > now())
  ORDER BY s.updated_at DESC NULLS LAST,
           s.invited_at DESC NULLS LAST,
           s.created_at DESC
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_invitation_token_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_token_for_current_user() TO authenticated;


