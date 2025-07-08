-- Alter storytellers table to add a column for the storyteller's own user ID
ALTER TABLE public.storytellers
ADD COLUMN storyteller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create an index on the new column for performance
CREATE INDEX IF NOT EXISTS idx_storytellers_storyteller_user_id ON public.storytellers(storyteller_user_id);

-- Update the RLS policy for inserting stories.
-- This is more secure as it checks for the storyteller's actual user_id,
-- rather than relying on a potentially non-unique or spoofable email.
-- It also allows a storyteller to submit a story if they are logged in.

-- First, drop the old policy
DROP POLICY "Storytellers can submit stories" ON public.stories;

-- Create the new, more secure policy
CREATE POLICY "Storytellers can submit stories" ON public.stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.storytellers
      WHERE storytellers.id = stories.storyteller_id
      AND storytellers.storyteller_user_id = auth.uid()
    )
  );

-- Also, let's allow a storyteller to see their own storyteller record
CREATE POLICY "Storytellers can view their own record" ON public.storytellers
  FOR SELECT USING (storyteller_user_id = auth.uid()); 