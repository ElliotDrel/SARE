-- Enforce story visibility gate via RLS and normalize helper functions

-- Ensure helper functions are correct, secure, and have stable search_path
CREATE OR REPLACE FUNCTION public.get_user_story_count(target_user_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.stories s
    JOIN public.storytellers st ON s.storyteller_id = st.id
    WHERE st.user_id = target_user_id AND s.status = 'submitted'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_stories(target_user_id UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  profile_record RECORD;
  story_count INTEGER;
BEGIN
  SELECT p.collection_goal, p.reflection_completed
  INTO profile_record
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  SELECT public.get_user_story_count(target_user_id) INTO story_count;
  
  RETURN (
    COALESCE(story_count, 0) >= COALESCE(profile_record.collection_goal, 0)
    AND COALESCE(profile_record.reflection_completed, FALSE) = TRUE
  );
END;
$$;

-- Remove permissive public SELECT policy on stories if present
DROP POLICY IF EXISTS "stories_public_read" ON public.stories;

-- Replace existing owner read policy with gated policy
DROP POLICY IF EXISTS "Users can view stories submitted to them" ON public.stories;
DROP POLICY IF EXISTS "stories_owner_read_when_allowed" ON public.stories;

CREATE POLICY "stories_owner_read_when_allowed" ON public.stories
  FOR SELECT USING (auth.uid() = user_id AND public.can_view_stories(auth.uid()));

-- Optional: explicit grants to allow client to call RPCs
GRANT EXECUTE ON FUNCTION public.can_view_stories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_story_count(UUID) TO authenticated;


