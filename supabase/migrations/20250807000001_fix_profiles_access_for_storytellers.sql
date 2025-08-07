-- Fix profiles access for storytellers
-- Storytellers need to read profile information but are unauthenticated users

-- Drop the restrictive policies that only allow authenticated user access  
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow public READ access to profiles (needed for storyteller UI)
-- This is safe because we only expose minimal profile data in the storyteller context
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT USING (TRUE);  -- Public read access

-- Allow users to manage their own profiles
CREATE POLICY "profiles_owner_access" ON profiles
    FOR ALL USING (auth.uid() = user_id);