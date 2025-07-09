"use server";

import { createClient } from "@/lib/supabase/server";
import { getStorytellerByToken } from "@/lib/supabase/database";
import { redirect } from "next/navigation";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string | null; // Optional token for storytellers

  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: token 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/story_submit?token=${token}`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/protected`,
      },
    });

    if (authError) {
      throw authError;
    }

    // If this is a storyteller signup (has token), link the user to the storyteller record
    if (token && authData.user) {
      // Validate the token and get storyteller
      const { data: storyteller, error: storytellerError } = await getStorytellerByToken(token);
      
      if (storytellerError || !storyteller) {
        throw new Error("Invalid invitation token");
      }

      // Update the storyteller record with the new user_id
      // Note: We'll create a new function for this since updateStoryteller expects the storyteller's user_id
      const { error: updateError } = await supabase
        .from("storytellers")
        .update({ user_id: authData.user.id })
        .eq("invite_token", token);

      if (updateError) {
        throw updateError;
      }
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  redirect("/protected");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
} 