-- Migration: Add storyteller authentication integration and cross-device support
-- Created: 2025-01-06
-- Purpose: Enable magic link auth for storytellers with cross-device continuation

-- 1. Add auth integration columns to storytellers table
ALTER TABLE storytellers 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS magic_link_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_access_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_access_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS access_method TEXT DEFAULT 'pending' 
  CHECK (access_method IN ('pending', 'magic_link', 'return_user', 'direct_access'));

-- 2. Add user type tracking to profiles for unified auth
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'requester' 
  CHECK (user_type IN ('requester', 'storyteller'));

-- 3. Create story_drafts table for cross-device progress saving
CREATE TABLE IF NOT EXISTS story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storyteller_id UUID NOT NULL REFERENCES storytellers(id) ON DELETE CASCADE,
  story_one TEXT,
  story_two TEXT, 
  story_three TEXT,
  notes TEXT,
  progress_metadata JSONB DEFAULT '{}',
  auto_saved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storytellers_auth_user_id ON storytellers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_email ON storytellers(email);
CREATE INDEX IF NOT EXISTS idx_storytellers_invitation_token ON storytellers(invitation_token);
CREATE INDEX IF NOT EXISTS idx_storytellers_token_expires_at ON storytellers(token_expires_at);
CREATE INDEX IF NOT EXISTS idx_story_drafts_storyteller_id ON story_drafts(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_story_drafts_updated_at ON story_drafts(updated_at);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- 5. Create function to automatically update story_drafts updated_at
CREATE OR REPLACE FUNCTION update_story_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for story_drafts updated_at
DROP TRIGGER IF EXISTS update_story_drafts_updated_at_trigger ON story_drafts;
CREATE TRIGGER update_story_drafts_updated_at_trigger
    BEFORE UPDATE ON story_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_story_drafts_updated_at();

-- 7. Create function to clean up expired invitation tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    UPDATE storytellers 
    SET invitation_token = gen_random_uuid(),
        token_expires_at = now() + interval '7 days'
    WHERE token_expires_at < now() 
    AND access_method = 'pending';
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to get storyteller by email (for unified sign-in)
CREATE OR REPLACE FUNCTION get_storyteller_by_email(target_email TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    auth_user_id UUID,
    invitation_status TEXT,
    access_method TEXT,
    has_submitted BOOLEAN,
    has_draft BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.email,
        s.auth_user_id,
        s.invitation_status,
        s.access_method,
        EXISTS(SELECT 1 FROM stories WHERE storyteller_id = s.id AND status = 'submitted') as has_submitted,
        EXISTS(SELECT 1 FROM story_drafts WHERE storyteller_id = s.id) as has_draft
    FROM storytellers s
    WHERE s.email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to update storyteller access tracking
CREATE OR REPLACE FUNCTION update_storyteller_access(
    storyteller_id UUID,
    auth_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE storytellers 
    SET 
        last_access_at = now(),
        first_access_at = COALESCE(first_access_at, now()),
        auth_user_id = COALESCE(update_storyteller_access.auth_user_id, storytellers.auth_user_id),
        access_method = CASE 
            WHEN first_access_at IS NULL THEN 'magic_link'
            ELSE 'return_user'
        END
    WHERE id = storyteller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create comprehensive RLS policies

-- Enable RLS on new table
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;

-- Story drafts: Only accessible by the storyteller who owns them
CREATE POLICY "story_drafts_storyteller_access" ON story_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = story_drafts.storyteller_id 
            AND storytellers.auth_user_id = auth.uid()
        )
    );

-- Enhanced storytellers policy: Access by storyteller or story owner
DROP POLICY IF EXISTS "storytellers_access" ON storytellers;
CREATE POLICY "storytellers_access" ON storytellers
    FOR ALL USING (
        auth.uid() = auth_user_id OR  -- Storyteller themselves
        auth.uid() = user_id          -- Story requester (owner)
    );

-- Enhanced stories policy: Access by storyteller or story owner  
DROP POLICY IF EXISTS "stories_access" ON stories;
CREATE POLICY "stories_access" ON stories
    FOR ALL USING (
        auth.uid() = user_id OR -- Story requester (owner)
        EXISTS (
            SELECT 1 FROM storytellers 
            WHERE storytellers.id = stories.storyteller_id 
            AND storytellers.auth_user_id = auth.uid() -- Storyteller themselves
        )
    );

-- 11. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON story_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION get_storyteller_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_storyteller_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens() TO authenticated;

-- Migration complete
-- Next steps: 
-- 1. Create storyteller portal pages
-- 2. Implement magic link invitation system
-- 3. Add unified sign-in logic