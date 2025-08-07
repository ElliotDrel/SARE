-- Migration: Fix storyteller token access for return users
-- Created: 2025-01-07
-- Purpose: Allow token-based access for storytellers with 'return_user' access_method

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "storytellers_access" ON storytellers;

-- Create updated policy that includes 'return_user' access_method
CREATE POLICY "storytellers_access" ON storytellers
    FOR SELECT USING (
        auth.uid() = auth_user_id OR  -- Storyteller themselves (authenticated)
        auth.uid() = user_id OR       -- Story requester (owner)
        (
            -- Allow token-based access for valid, non-expired invitation tokens
            invitation_token IS NOT NULL 
            AND token_expires_at > now()
            AND access_method IN ('pending', 'magic_link', 'return_user')
        )
    );