"use server";

import { createClient } from "@/lib/supabase/server";
import { createStory, getStorytellerDetails } from "@/lib/supabase/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitStory(prevState: any, formData: FormData) {
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
    return { message: "Could not find your storyteller details. Please contact support." };
  }

  // 3. Prepare Story Data
  const storyData = {
    storyteller_id: storytellerDetails.id,
    user_id: storytellerDetails.user_id, // The ID of the main user this story is about
    story_part_1: formData.get("story_part_1") as string,
    story_part_2: formData.get("story_part_2") as string,
    story_part_3: formData.get("story_part_3") as string,
  };

  if (!storyData.story_part_1) {
    return { message: "The first part of the story cannot be empty." };
  }

  // 4. Create the story
  const { error } = await createStory(storyData);

  if (error) {
    return { message: `Error submitting story: ${error.message}` };
  }

  // 5. Revalidate and Redirect
  revalidatePath("/protected/onboarding/send_collect"); // To update the dashboard for the main user
  redirect("/story_thank_you");
} 