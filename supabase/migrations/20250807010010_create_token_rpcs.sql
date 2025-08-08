-- Token-scoped RPCs for storyteller flows
-- SECURITY DEFINER functions validate invitation token + expiry
-- and limit operations to the resolved storyteller only.

-- storyteller_by_token: return minimal storyteller info + inviter profile names
CREATE OR REPLACE FUNCTION public.storyteller_by_token(token text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  invitation_status text,
  access_method text,
  auth_user_id uuid,
  token_expires_at timestamptz,
  profiles jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id,
         s.user_id,
         s.name,
         s.email,
         s.invitation_status::text,
         s.access_method::text,
         s.auth_user_id,
         s.token_expires_at,
         to_jsonb(json_build_object(
           'display_name', p.display_name,
           'first_name', p.first_name,
           'last_name', p.last_name
         ))::jsonb AS profiles
  FROM public.storytellers s
  LEFT JOIN public.profiles p ON p.user_id = s.user_id
  WHERE s.invitation_token = token
    AND (s.token_expires_at IS NULL OR s.token_expires_at > now())
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.storyteller_by_token(text) TO anon, authenticated;

-- get_story_draft_by_token: fetch draft for storyteller resolved by token
CREATE OR REPLACE FUNCTION public.get_story_draft_by_token(token text)
RETURNS public.story_drafts AS $$
DECLARE
  v_storyteller_id uuid;
  v_row public.story_drafts;
BEGIN
  SELECT id INTO v_storyteller_id
  FROM public.storytellers
  WHERE invitation_token = token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF v_storyteller_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT sd.* INTO v_row
  FROM public.story_drafts sd
  WHERE sd.storyteller_id = v_storyteller_id
  ORDER BY sd.created_at DESC
  LIMIT 1;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_story_draft_by_token(text) TO anon, authenticated;

-- upsert_story_draft_by_token: insert or update draft for resolved storyteller
CREATE OR REPLACE FUNCTION public.upsert_story_draft_by_token(
  token text,
  p_story_one text,
  p_story_two text,
  p_story_three text,
  p_notes text DEFAULT NULL
) RETURNS public.story_drafts AS $$
DECLARE
  v_storyteller_id uuid;
  v_existing_id uuid;
  v_row public.story_drafts;
BEGIN
  SELECT id INTO v_storyteller_id
  FROM public.storytellers
  WHERE invitation_token = token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF v_storyteller_id IS NULL THEN
    RAISE EXCEPTION 'invalid_or_expired_token';
  END IF;

  SELECT id INTO v_existing_id
  FROM public.story_drafts
  WHERE storyteller_id = v_storyteller_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_id IS NULL THEN
    INSERT INTO public.story_drafts (
      storyteller_id, story_one, story_two, story_three, notes, created_at, updated_at
    ) VALUES (
      v_storyteller_id, p_story_one, p_story_two, p_story_three, p_notes, now(), now()
    ) RETURNING * INTO v_row;
  ELSE
    UPDATE public.story_drafts
    SET story_one = p_story_one,
        story_two = p_story_two,
        story_three = p_story_three,
        notes = p_notes,
        updated_at = now()
    WHERE id = v_existing_id
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.upsert_story_draft_by_token(text, text, text, text, text) TO anon, authenticated;

-- get_submitted_story_by_token: fetch final submitted story if any
CREATE OR REPLACE FUNCTION public.get_submitted_story_by_token(token text)
RETURNS public.stories AS $$
DECLARE
  v_storyteller_id uuid;
  v_row public.stories;
BEGIN
  SELECT id INTO v_storyteller_id
  FROM public.storytellers
  WHERE invitation_token = token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF v_storyteller_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT s.* INTO v_row
  FROM public.stories s
  WHERE s.storyteller_id = v_storyteller_id
  ORDER BY s.submitted_at DESC NULLS LAST, s.created_at DESC
  LIMIT 1;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_submitted_story_by_token(text) TO anon, authenticated;

-- submit_story_by_token: create final story, mark submitted, delete draft
CREATE OR REPLACE FUNCTION public.submit_story_by_token(
  token text,
  p_story_one text,
  p_story_two text DEFAULT NULL,
  p_story_three text DEFAULT NULL
) RETURNS public.stories AS $$
DECLARE
  v_storyteller public.storytellers%ROWTYPE;
  v_row public.stories;
BEGIN
  SELECT * INTO v_storyteller
  FROM public.storytellers
  WHERE invitation_token = token
    AND (token_expires_at IS NULL OR token_expires_at > now());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_token';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.stories WHERE storyteller_id = v_storyteller.id
  ) THEN
    RAISE EXCEPTION 'story_already_submitted';
  END IF;

  INSERT INTO public.stories (
    user_id, storyteller_id, story_one, story_two, story_three, status, submitted_at, created_at, updated_at
  ) VALUES (
    v_storyteller.user_id, v_storyteller.id, p_story_one, p_story_two, p_story_three, 'submitted', now(), now(), now()
  ) RETURNING * INTO v_row;

  UPDATE public.storytellers
  SET invitation_status = 'submitted', updated_at = now()
  WHERE id = v_storyteller.id;

  DELETE FROM public.story_drafts WHERE storyteller_id = v_storyteller.id;

  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.submit_story_by_token(text, text, text, text) TO anon, authenticated;


