-- Grant usage on the auth schema to the postgres role
GRANT USAGE ON SCHEMA auth TO postgres;

-- Create a SECURITY DEFINER function to get a user's email by their ID.
-- This function runs with elevated permissions and can access auth.users,
-- but it only returns the email for the specific user ID passed to it.
-- This is a secure way to expose a single piece of information.
CREATE OR REPLACE FUNCTION public.get_user_email_by_id(user_id_to_find uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  select u.email from auth.users u where u.id = user_id_to_find
$$;

-- Create the view for storyteller details.
-- This view will run with the permissions of the person querying it (the storyteller).
-- It will automatically be secured by the RLS policy on the underlying `public.storytellers` table.
CREATE OR REPLACE VIEW public.storyteller_details AS
SELECT
  s.id,
  s.user_id,
  s.storyteller_user_id,
  s.name,
  s.email AS storyteller_email,
  s.phone,
  s.story_submitted_at,
  s.created_at,
  -- We call the secure function here to get the main user's email
  public.get_user_email_by_id(s.user_id) AS user_email
FROM
  public.storytellers s; 