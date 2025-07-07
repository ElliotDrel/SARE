-- Create SARE Platform Tables
-- This migration creates all necessary tables for the SARE platform

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storytellers table
CREATE TABLE IF NOT EXISTS public.storytellers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  invite_token TEXT UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 0, 25),
  invite_sent_at TIMESTAMP WITH TIME ZONE,
  story_submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_part_1 TEXT NOT NULL,
  story_part_2 TEXT,
  story_part_3 TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create self_reflections table
CREATE TABLE IF NOT EXISTS public.self_reflections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_1 TEXT,
  reflection_2 TEXT,
  reflection_3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Ensure one reflection per user
);

-- Create certification_leads table
CREATE TABLE IF NOT EXISTS public.certification_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storytellers_user_id ON public.storytellers(user_id);
CREATE INDEX IF NOT EXISTS idx_storytellers_invite_token ON public.storytellers(invite_token);
CREATE INDEX IF NOT EXISTS idx_stories_storyteller_id ON public.stories(storyteller_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_self_reflections_user_id ON public.self_reflections(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storytellers table
-- Users can only see and manage their own storytellers
CREATE POLICY "Users can view own storytellers" ON public.storytellers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storytellers" ON public.storytellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storytellers" ON public.storytellers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storytellers" ON public.storytellers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for stories table
-- Users can view stories submitted for them
-- Storytellers can insert stories for their linked user
CREATE POLICY "Users can view stories submitted for them" ON public.stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Storytellers can submit stories" ON public.stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.storytellers
      WHERE storytellers.id = stories.storyteller_id
      AND storytellers.email = auth.email()
    )
  );

-- RLS Policies for self_reflections table
-- Users can only see and manage their own reflections
CREATE POLICY "Users can view own reflections" ON public.self_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.self_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.self_reflections
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for certification_leads table
-- Anyone can insert (public form), only admins can view
CREATE POLICY "Anyone can submit certification leads" ON public.certification_leads
  FOR INSERT WITH CHECK (true);

-- RLS Policies for contact_messages table
-- Anyone can insert (public form), only admins can view
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for self_reflections updated_at
CREATE TRIGGER update_self_reflections_updated_at 
  BEFORE UPDATE ON public.self_reflections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to mark story as submitted in storytellers table
CREATE OR REPLACE FUNCTION mark_story_submitted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.storytellers
  SET story_submitted_at = NOW()
  WHERE id = NEW.storyteller_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update storyteller when story is submitted
CREATE TRIGGER update_storyteller_on_story_submit
  AFTER INSERT ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION mark_story_submitted(); 