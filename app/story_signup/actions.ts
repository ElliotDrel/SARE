"use server";

import { createClient } from "@/lib/supabase/server";
import { getStorytellerByToken, updateStoryteller } from "@/lib/supabase/database";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { storytellerSignupSchema, validateAndSanitize } from "@/lib/validations";

export async function signup(
  prevState: { message?: string }, 
  token: string,
  formData: FormData
) {
  // Validate token
  if (!token) {
    return { message: "Invalid invitation: No token provided." };
  }

  // Validate and sanitize form data
  const formDataObj = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = validateAndSanitize(storytellerSignupSchema, formDataObj);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0];
    return { message: firstError || "Invalid form data." };
  }

  const { email, password } = validation.data;
  
  const headersList = await headers();
  const origin = headersList.get("origin");

  const supabase = await createClient();

  // 1. Validate the token
  const { data: storyteller, error: tokenError } = await getStorytellerByToken(token);
  if (tokenError) {
    console.error("Token validation error:", tokenError);
    return { message: "There was an issue validating your invitation. Please try again or contact support." };
  }
  
  if (!storyteller) {
    return { message: "This invitation link is invalid or has expired. Please check your invitation email or contact the person who invited you." };
  }

  // Check if storyteller already has a storyteller_user_id (invite has been used)
  if (storyteller.storyteller_user_id) {
    return { message: "This invitation has already been used. If you already have an account, please log in instead." };
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
    console.error("Signup error:", signUpError);
    if (signUpError.message.includes("already registered")) {
      return { message: "An account with this email already exists. Please log in instead or use a different email address." };
    }
    return { message: `Account creation failed: ${signUpError.message}. Please try again or contact support.` };
  }
  
  if (!authData.user) {
    return { message: "Account creation was unsuccessful. Please try again or contact support if the issue persists." };
  }

  // 3. Link the new user to the storyteller record
  console.log("Before token update - storyteller.invite_token:", storyteller.invite_token);
  const updateData = {
    storyteller_user_id: authData.user.id,
    invite_token: undefined, // Clear the token so it can't be reused
  };
  console.log("Update data being sent:", updateData);
  
  const { data: updatedStoryteller, error: updateError } = await updateStoryteller(storyteller.id, updateData);
  
  if (updatedStoryteller) {
    console.log("After token update - updated storyteller invite_token:", updatedStoryteller.invite_token);
  }

  if (updateError) {
    console.error("Account linking error:", updateError);
    // This is a tricky state. The user is created in auth, but not linked.
    // For now, we'll return an error. A more robust solution might involve cleanup.
    return { message: `Account was created but couldn't be linked to your invitation. Please contact support with this error message: ${updateError.message}` };
  }

  // 4. Redirect to the story submission page
  return redirect("/story_submit");
} 