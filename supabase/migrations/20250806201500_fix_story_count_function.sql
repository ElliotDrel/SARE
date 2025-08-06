-- Fix the join condition in get_user_story_count function
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