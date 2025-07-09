"use server";

import { createClient } from "@/lib/supabase/server";
import { getStorytellerDetails } from "@/lib/supabase/database";
import { storyCreationTransaction } from "@/lib/supabase/transactions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { storySubmissionSchema, validateAndSanitize, sanitizeHtml } from "@/lib/validations";

export async function submitStory(prevState: { message?: string }, formData: FormData) {
  const supabase = await createClient();

  // 1. Get Logged In User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to submit a story." };
  }

  // 2. Get Storyteller Details
  const storytellerDetails = await getStorytellerDetails();
  if (!storytellerDetails) {
    return { message: "We couldn't find your storyteller profile. This might mean you haven't been invited to share a story yet, or there was an issue with your account setup. Please contact the person who invited you or our support team." };
  }

  // 3. Validate and sanitize story data
  const rawStoryData = {
    story_part_1: formData.get("story_part_1") as string,
    story_part_2: formData.get("story_part_2") as string,
    story_part_3: formData.get("story_part_3") as string,
  };

  const validation = validateAndSanitize(storySubmissionSchema, rawStoryData);
  if (!validation.success) {
    const firstError = Object.values(validation.errors)[0]?.[0];
    return { message: firstError || "Invalid story data." };
  }

  // 4. Prepare Story Data with sanitization
  const storyData = {
    storyteller_id: storytellerDetails.id,
    user_id: storytellerDetails.user_id, // The ID of the main user this story is about
    story_part_1: sanitizeHtml(validation.data.story_part_1),
    story_part_2: validation.data.story_part_2 ? sanitizeHtml(validation.data.story_part_2) : null,
    story_part_3: validation.data.story_part_3 ? sanitizeHtml(validation.data.story_part_3) : null,
  };

  // 5. Create the story using transaction
  const { data: story, error } = await storyCreationTransaction(storyData);

  if (error) {
    console.error("Story submission error:", error);
    if (error.message.includes("duplicate") || error.message.includes("already exists")) {
      return { message: "It looks like you've already submitted a story. Each storyteller can only submit one story per invitation." };
    }
    return { message: `Failed to submit your story: ${error.message}. Please try again or contact support if the issue persists.` };
  }

  // 6. Revalidate and Redirect
  revalidatePath("/protected/onboarding/send_collect"); // To update the dashboard for the main user
  revalidatePath("/protected/onboarding/report"); // To update the report for the main user
  redirect("/story_thank_you");
} 