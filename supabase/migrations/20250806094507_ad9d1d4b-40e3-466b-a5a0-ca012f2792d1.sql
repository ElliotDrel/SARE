-- Fix function search path security warnings by setting security definer and search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_user_story_count(UUID);
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
    JOIN public.storytellers st ON s.id = st.storyteller_id
    WHERE st.user_id = target_user_id AND s.status = 'submitted'
  );
END;
$$;

DROP FUNCTION IF EXISTS public.can_view_stories(UUID);
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
  
  RETURN (story_count >= profile_record.collection_goal AND profile_record.reflection_completed = TRUE);
END;
$$;