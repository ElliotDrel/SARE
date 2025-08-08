-- Normalize data: ensure at most one SUBMITTED story per storyteller
-- Strategy: keep the most recent submitted story per storyteller; demote others to draft

WITH submitted AS (
  SELECT
    id,
    storyteller_id,
    submitted_at,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY storyteller_id
      ORDER BY submitted_at DESC NULLS LAST, created_at DESC
    ) AS rn
  FROM public.stories
  WHERE status = 'submitted'
),
to_demote AS (
  SELECT id
  FROM submitted
  WHERE rn > 1
)
UPDATE public.stories s
SET status = 'draft',
    submitted_at = NULL,
    updated_at = NOW()
WHERE s.id IN (SELECT id FROM to_demote);

-- Enforce: at most one SUBMITTED per storyteller
CREATE UNIQUE INDEX IF NOT EXISTS unique_submitted_story_per_storyteller
ON public.stories (storyteller_id)
WHERE status = 'submitted';


