-- Helpful indexes and optional uniqueness constraint for stability/perf

CREATE UNIQUE INDEX IF NOT EXISTS storytellers_invitation_token_idx
ON public.storytellers (invitation_token)
WHERE invitation_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS stories_user_id_idx
ON public.stories (user_id);

CREATE INDEX IF NOT EXISTS story_drafts_storyteller_id_idx
ON public.story_drafts (storyteller_id);

-- Prefer a partial unique index: at most one SUBMITTED story per storyteller
-- This avoids blocking due to legacy duplicates (e.g., drafts or multiple submissions in the past)
CREATE UNIQUE INDEX IF NOT EXISTS unique_submitted_story_per_storyteller
ON public.stories (storyteller_id)
WHERE status = 'submitted';


