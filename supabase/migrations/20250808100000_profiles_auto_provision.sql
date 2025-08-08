-- Migration: Auto-provision profiles on new auth users and enforce one profile per user

-- 1) Ensure one profile per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'profiles' AND constraint_name = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2) Create trigger function to auto-create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_provision_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, created_at, updated_at, user_type)
  VALUES (NEW.id, now(), now(), 'requester')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3) Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_provision_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_provision_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_provision_profile();


