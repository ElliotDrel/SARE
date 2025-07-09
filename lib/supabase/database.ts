// Database utility functions for SARE Platform

import { createClient } from "@/lib/supabase/server";
import type {
  Storyteller,
  // The following types are currently unused. Uncomment them when you are ready to use them:
  // Story,
  // SelfReflection,
  // CertificationLead,
  // ContactMessage,
  StorytellerInsert,
  StoryInsert,
  SelfReflectionInsert,
  CertificationLeadInsert,
  ContactMessageInsert,
} from "./types";

// Storytellers functions
export async function getStorytellers(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("storytellers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createStoryteller(data: StorytellerInsert) {
  const supabase = await createClient();
  return supabase.from("storytellers").insert(data).select().single();
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

export async function updateStorytellerByToken(token: string, data: Partial<Storyteller>) {
  const supabase = await createClient();
  return supabase
    .from("storytellers")
    .update(data)
    .eq("invite_token", token)
    .select()
    .single();
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

export async function createStory(data: StoryInsert) {
  const supabase = await createClient();
  return supabase.from("stories").insert(data).select().single();
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