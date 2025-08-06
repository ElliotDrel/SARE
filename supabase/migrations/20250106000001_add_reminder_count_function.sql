-- Migration: Add reminder count increment function
-- Created: 2025-01-06
-- Purpose: Add function to safely increment reminder count for storytellers

-- Function to increment reminder count
CREATE OR REPLACE FUNCTION public.increment_reminder_count(storyteller_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE public.storytellers 
    SET reminder_count = COALESCE(reminder_count, 0) + 1
    WHERE id = storyteller_id
    RETURNING reminder_count INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.increment_reminder_count(UUID) TO authenticated;