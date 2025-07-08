// Database Types for SARE Platform

export interface Storyteller {
  id: string;
  user_id: string; // This is the main user who created the storyteller
  storyteller_user_id?: string | null; // This is the storyteller's own user id after they sign up
  name: string;
  email: string;
  phone?: string | null;
  invite_token: string;
  invite_sent_at?: string | null;
  story_submitted_at?: string | null;
  created_at: string;
}

export interface Story {
  id: string;
  storyteller_id: string;
  user_id: string;
  story_part_1: string;
  story_part_2?: string | null;
  story_part_3?: string | null;
  submitted_at: string;
}

export interface SelfReflection {
  id: string;
  user_id: string;
  reflection_1?: string | null;
  reflection_2?: string | null;
  reflection_3?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificationLead {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  message?: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

// Type for creating new records (without auto-generated fields)
export interface StorytellerInsert {
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface StoryInsert {
  storyteller_id: string;
  user_id: string;
  story_part_1: string;
  story_part_2?: string | null;
  story_part_3?: string | null;
}

export interface SelfReflectionInsert {
  user_id: string;
  reflection_1?: string | null;
  reflection_2?: string | null;
  reflection_3?: string | null;
}

export interface CertificationLeadInsert {
  name: string;
  email: string;
  organization?: string | null;
  message?: string | null;
}

export interface ContactMessageInsert {
  name: string;
  email: string;
  message: string;
} 