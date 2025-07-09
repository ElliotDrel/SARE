"use server";

import { createClient } from "@/lib/supabase/server";
import { getStorytellerByToken } from "@/lib/supabase/database";
import { storytellerSignupTransaction } from "@/lib/supabase/transactions";
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

  // 2. Execute atomic signup transaction
  const { data: transactionResult, error: transactionError } = await storytellerSignupTransaction(
    email,
    password,
    storyteller.id,
    origin!
  );

  if (transactionError) {
    console.error("Signup transaction error:", transactionError);
    
    // Provide user-friendly error messages based on error type
    if (transactionError.message.includes("already registered")) {
      return { message: "An account with this email already exists. Please log in instead or use a different email address." };
    }
    
    if (transactionError.message.includes("User creation failed")) {
      return { message: "Account creation was unsuccessful. Please try again or contact support if the issue persists." };
    }
    
    return { message: `Account creation failed: ${transactionError.message}. Please try again or contact support.` };
  }

  if (!transactionResult) {
    return { message: "Signup process failed. Please try again or contact support if the issue persists." };
  }

  // 3. Redirect to the story submission page
  return redirect("/story_submit");
} 