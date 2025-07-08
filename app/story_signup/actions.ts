"use server";

import { createClient } from "@/lib/supabase/server";
import { getStorytellerByToken, updateStoryteller } from "@/lib/supabase/database";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signup(prevState: { message?: string }, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;

  if (!token) {
    return { message: "Invalid invitation: No token provided." };
  }
  
  const origin = headers().get("origin");

  const supabase = await createClient();

  // 1. Validate the token
  const { data: storyteller, error: tokenError } = await getStorytellerByToken(token);
  if (tokenError || !storyteller) {
    return { message: "This invitation link is invalid or has expired." };
  }

  // Check if storyteller already has a storyteller_user_id (invite has been used)
  if (storyteller.storyteller_user_id) {
    return { message: "This invitation has already been used." };
  }

  // 2. Create the new auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (signUpError) {
    return { message: `Could not authenticate user: ${signUpError.message}` };
  }
  
  if (!authData.user) {
    return { message: "User was not created. Please try again." };
  }

  // 3. Link the new user to the storyteller record
  const { error: updateError } = await updateStoryteller(storyteller.id, {
    storyteller_user_id: authData.user.id,
    invite_token: null, // Clear the token so it can't be reused
  });

  if (updateError) {
    // This is a tricky state. The user is created in auth, but not linked.
    // For now, we'll return an error. A more robust solution might involve cleanup.
    return { message: `Could not link account: ${updateError.message}` };
  }

  // 4. Redirect to the story submission page
  return redirect("/story_submit");
} 