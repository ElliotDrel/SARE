-- Migration: Fix storyteller token-based access for magic links
-- Created: 2025-01-06
-- Purpose: Allow unauthenticated users to read storyteller data using valid invitation tokens

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "storytellers_access" ON storytellers;

-- Create new policy that allows token-based access
CREATE POLICY "storytellers_access" ON storytellers
    FOR SELECT USING (
        auth.uid() = auth_user_id OR  -- Storyteller themselves (authenticated)
        auth.uid() = user_id OR       -- Story requester (owner)
        (
            -- Allow token-based access for valid, non-expired invitation tokens
            invitation_token IS NOT NULL 
            AND token_expires_at > now()
            AND access_method IN ('pending', 'magic_link')
        )
    );

-- Also need to allow INSERT/UPDATE for storytellers through their auth_user_id
CREATE POLICY "storytellers_modify" ON storytellers
    FOR INSERT WITH CHECK (
        auth.uid() = user_id  -- Only story requester can create storytellers
    );

CREATE POLICY "storytellers_update" ON storytellers
    FOR UPDATE USING (
        auth.uid() = auth_user_id OR  -- Storyteller themselves
        auth.uid() = user_id          -- Story requester
    );

-- Allow authenticated users to read profiles (needed for story requester info)
DROP POLICY IF EXISTS "profiles_read" ON profiles;
CREATE POLICY "profiles_read" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id OR           -- User themselves
        EXISTS (                          -- Or storytellers reading about their story requester
            SELECT 1 FROM storytellers 
            WHERE storytellers.user_id = profiles.user_id 
            AND storytellers.auth_user_id = auth.uid()
        )
    );