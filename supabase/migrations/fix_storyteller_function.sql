-- Fix get_storyteller_by_email function
-- Copy and paste this into Supabase SQL editor

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_storyteller_by_email(TEXT);

-- Create the corrected function
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
        s.invitation_status::TEXT,
        s.access_method,
        EXISTS(SELECT 1 FROM stories WHERE storyteller_id = s.id AND status = 'submitted') as has_submitted,
        EXISTS(SELECT 1 FROM story_drafts WHERE storyteller_id = s.id) as has_draft
    FROM storytellers s
    WHERE s.email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_storyteller_by_email(TEXT) TO authenticated;