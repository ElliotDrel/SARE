-- Restrict RLS policies: remove public access and enforce owner-scoped access
-- We ENABLE RLS but DO NOT FORCE it so SECURITY DEFINER RPCs can function

-- Enable RLS
ALTER TABLE public.storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop permissive public policies if present
-- Drop permissive public policies if they exist
DROP POLICY IF EXISTS "storytellers_public_read" ON public.storytellers;
DROP POLICY IF EXISTS "stories_public_read" ON public.stories;
DROP POLICY IF EXISTS "stories_public_update" ON public.stories;
DROP POLICY IF EXISTS "story_drafts_public_access" ON public.story_drafts;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
-- Also remove any legacy wide policies that might re-grant broad access
DROP POLICY IF EXISTS "storytellers_access" ON public.storytellers;
DROP POLICY IF EXISTS "stories_access" ON public.stories;

-- Storytellers: owner-only access
-- Drop owner policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "storytellers_owner_select" ON public.storytellers;
DROP POLICY IF EXISTS "storytellers_owner_write" ON public.storytellers;

-- Stories: owner-only read when allowed; owner write
DROP POLICY IF EXISTS "stories_owner_read_when_allowed" ON public.stories;
DROP POLICY IF EXISTS "stories_owner_write" ON public.stories;

-- Profiles: owner-only
DROP POLICY IF EXISTS "profiles_owner_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_write" ON public.profiles;

-- Create owner-scoped policies
CREATE POLICY "storytellers_owner_select" ON public.storytellers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "storytellers_owner_write" ON public.storytellers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stories_owner_read_when_allowed" ON public.stories
  FOR SELECT USING (auth.uid() = user_id AND can_view_stories(auth.uid()));

CREATE POLICY "stories_owner_write" ON public.stories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_owner_select" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_owner_write" ON public.profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Story drafts: no public access; managed via SECURITY DEFINER RPCs.
-- Optionally, do not add owner policies here to avoid accidental exposure.


