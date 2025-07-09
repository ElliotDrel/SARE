// Database utility functions for SARE Platform

import { createClient } from "@/lib/supabase/server";
import type {
  Storyteller,
  Story,
  // The following types are currently unused. Uncomment them when you are ready to use them:
  // SelfReflection,
  // CertificationLead,
  // ContactMessage,
  StorytellerInsert,
  StoryInsert,
  SelfReflectionInsert,
  CertificationLeadInsert,
  ContactMessageInsert,
} from "./types";

// Database error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

// Enhanced database response type
export interface DatabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

// Utility function to handle database errors
function handleDatabaseError(error: unknown): DatabaseError | null {
  if (!error) return null;
  
  // Common PostgreSQL error codes
  const errorMappings: Record<string, string> = {
    '23505': 'A record with this information already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '42501': 'Insufficient permissions',
    'PGRST116': 'No records found',
    'PGRST301': 'Row Level Security policy violated',
  };

  const errorObj = error as Record<string, unknown>;
  const code = (errorObj.code as string) || 'UNKNOWN';
  
  return {
    code,
    message: errorMappings[code] || (errorObj.message as string) || 'Database operation failed',
    details: errorObj.details as string,
    hint: errorObj.hint as string,
  };
}

// Utility function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Storytellers functions
export async function getStorytellers(userId: string): Promise<DatabaseResponse<Storyteller[]>> {
  if (!userId || !isValidUUID(userId)) {
    return { data: null, error: { code: 'INVALID_UUID', message: 'Invalid user ID format' } };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storytellers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error: handleDatabaseError(error) };
}

export async function createStoryteller(data: StorytellerInsert): Promise<DatabaseResponse<Storyteller>> {
  if (!data.user_id || !isValidUUID(data.user_id)) {
    return { data: null, error: { code: 'INVALID_UUID', message: 'Invalid user ID format' } };
  }

  if (!data.email || !data.name) {
    return { data: null, error: { code: 'MISSING_REQUIRED_FIELDS', message: 'Email and name are required' } };
  }

  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("storytellers")
    .insert(data)
    .select()
    .single();

  return { data: result, error: handleDatabaseError(error) };
}

export async function updateStoryteller(id: string, data: Partial<Storyteller>) {
  const supabase = await createClient();
  return supabase.from("storytellers").update(data).eq("id", id).select().single();
}

export async function deleteStoryteller(id: string) {
  const supabase = await createClient();
  return supabase.from("storytellers").delete().eq("id", id);
}

export async function getStorytellerByToken(token: string) {
  const supabase = await createClient();
  return supabase
    .from("storytellers")
    .select("*")
    .eq("invite_token", token)
    .single();
}

export async function getStorytellerDetails() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("storyteller_details")
    .select("*")
    .eq("storyteller_user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching storyteller details:", error);
    return null;
  }
  return data;
}

export async function getStorytellerByEmail(email: string) {
  if (!email) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storytellers")
    .select("*")
    .eq("email", email)
    .single();
  
  if (error) {
    // It's okay if no rows are found
    if (error.code !== 'PGRST116') {
      console.error("Error fetching storyteller by email:", error);
    }
    return null;
  }
  return data;
}

// Stories functions
export async function getStoriesForUser(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("stories")
    .select(`
      *,
      storyteller:storytellers(name, email)
    `)
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });
}

export async function createStory(data: StoryInsert): Promise<DatabaseResponse<Story>> {
  if (!data.storyteller_id || !isValidUUID(data.storyteller_id)) {
    return { data: null, error: { code: 'INVALID_UUID', message: 'Invalid storyteller ID format' } };
  }

  if (!data.user_id || !isValidUUID(data.user_id)) {
    return { data: null, error: { code: 'INVALID_UUID', message: 'Invalid user ID format' } };
  }

  if (!data.story_part_1 || data.story_part_1.trim().length === 0) {
    return { data: null, error: { code: 'MISSING_REQUIRED_FIELDS', message: 'Story part 1 is required' } };
  }

  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("stories")
    .insert(data)
    .select()
    .single();

  return { data: result, error: handleDatabaseError(error) };
}

export async function getStoryCount(userId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count || 0;
}

// Self Reflections functions
export async function getSelfReflection(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("self_reflections")
    .select("*")
    .eq("user_id", userId)
    .single();
}

export async function upsertSelfReflection(data: SelfReflectionInsert) {
  const supabase = await createClient();
  return supabase
    .from("self_reflections")
    .upsert(data, { onConflict: "user_id" })
    .select()
    .single();
}

// Certification Leads functions
export async function createCertificationLead(data: CertificationLeadInsert) {
  const supabase = await createClient();
  return supabase.from("certification_leads").insert(data).select().single();
}

// Contact Messages functions
export async function createContactMessage(data: ContactMessageInsert) {
  const supabase = await createClient();
  return supabase.from("contact_messages").insert(data).select().single();
}

// General User functions
export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper function to check if user has completed onboarding
export async function checkOnboardingStatus(userId: string) {
  const supabase = await createClient();
  
  const [{ count: storyCount }, { data: reflection }] = await Promise.all([
    supabase
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("self_reflections")
      .select("*")
      .eq("user_id", userId)
      .single(),
  ]);

  return {
    storiesCollected: storyCount || 0,
    hasCompletedReflection: !!(
      reflection &&
      reflection.reflection_1 &&
      reflection.reflection_2 &&
      reflection.reflection_3
    ),
    canGenerateReport: (storyCount || 0) >= 1 && !!(
      reflection &&
      reflection.reflection_1 &&
      reflection.reflection_2 &&
      reflection.reflection_3
    ),
  };
} 