-- Create enum types
CREATE TYPE public.story_status AS ENUM ('draft', 'submitted');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'sent', 'opened', 'submitted', 'reminded');
CREATE TYPE public.collection_status AS ENUM ('preparing', 'collecting', 'reflecting', 'completed');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  collection_goal INTEGER DEFAULT 10 CHECK (collection_goal >= 5 AND collection_goal <= 20),
  collection_status collection_status DEFAULT 'preparing',
  reflection_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storytellers table (people invited to submit stories)
CREATE TABLE public.storytellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  invitation_status invitation_status DEFAULT 'pending',
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storyteller_id UUID NOT NULL REFERENCES public.storytellers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_one TEXT NOT NULL,
  story_two TEXT,
  story_three TEXT,
  status story_status DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create self_reflections table
CREATE TABLE public.self_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  strengths_response TEXT,
  evidence_response TEXT,
  growth_themes_response TEXT,
  personal_narrative TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ai_insights JSONB,
  themes_summary TEXT,
  strengths_digest TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storytellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for storytellers
CREATE POLICY "Users can view their own storytellers" 
ON public.storytellers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own storytellers" 
ON public.storytellers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storytellers" 
ON public.storytellers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storytellers" 
ON public.storytellers FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for stories
CREATE POLICY "Users can view stories submitted to them" 
ON public.stories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Storytellers can insert stories" 
ON public.stories FOR INSERT 
WITH CHECK (TRUE); -- Anyone can submit a story if they have the storyteller_id

CREATE POLICY "Storytellers can update their own stories" 
ON public.stories FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.storytellers s 
  WHERE s.id = storyteller_id 
  AND s.email = (auth.jwt() ->> 'email')
));

-- Create RLS policies for self_reflections
CREATE POLICY "Users can view their own reflection" 
ON public.self_reflections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflection" 
ON public.self_reflections FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflection" 
ON public.self_reflections FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for reports
CREATE POLICY "Users can view their own report" 
ON public.reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own report" 
ON public.reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own report" 
ON public.reports FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_storytellers_updated_at
  BEFORE UPDATE ON public.storytellers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_self_reflections_updated_at
  BEFORE UPDATE ON public.self_reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get story count for a user
CREATE OR REPLACE FUNCTION public.get_user_story_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.stories s
    JOIN public.storytellers st ON s.storyteller_id = st.id
    WHERE st.user_id = target_user_id AND s.status = 'submitted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can view stories (has completed reflection and met goal)
CREATE OR REPLACE FUNCTION public.can_view_stories(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  profile_record RECORD;
  story_count INTEGER;
BEGIN
  SELECT p.collection_goal, p.reflection_completed
  INTO profile_record
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  SELECT public.get_user_story_count(target_user_id) INTO story_count;
  
  RETURN (story_count >= profile_record.collection_goal AND profile_record.reflection_completed = TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;