import { createClient } from "@/lib/supabase/server";
import { getStorytellerByToken } from "@/lib/supabase/database";
import { redirect } from "next/navigation";
import StorySubmitForm from "./StorySubmitForm";
import { Metadata } from "next";

type StorySubmitPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StorySubmitPage({ searchParams }: StorySubmitPageProps) {
  const resolvedSearchParams = await searchParams;
  const token =
    typeof resolvedSearchParams.token === "string"
      ? resolvedSearchParams.token
      : undefined;

  // Redirect if no token provided
  if (!token) {
    redirect("/");
  }

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to signup if not authenticated
  if (authError || !user) {
    redirect(`/story_signup?token=${token}`);
  }

  // Validate token and get storyteller information
  let storyteller;
  let storytellerError;
  try {
    const { data, error } = await getStorytellerByToken(token);
    if (error) throw error;
    storyteller = data;
  } catch (e) {
    console.error("Error fetching storyteller for story submission:", e);
    storytellerError = e;
  }

  if (storytellerError || !storyteller) {
    redirect("/");
  }

  // Check if this user is linked to this storyteller
  if (storyteller.user_id !== user.id) {
    redirect(`/story_signup?token=${token}`);
  }

  // Check if story already submitted
  if (storyteller.story_submitted_at) {
    redirect("/story_thank_you");
  }

  return (
    <div className="container-sare py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-xl text-primary-teal mb-4">
            Share Your Story
          </h1>
          <p className="body-lg text-neutral-600 mb-2">
            Tell us about a time when you saw someone at their absolute best.
          </p>
          <p className="body-md text-neutral-500">
            Your story will help create a powerful report for the SARE exercise.
          </p>
        </div>

        {/* Storyteller Info */}
        <div className="bg-primary-teal/5 border-2 border-primary-teal/20 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="heading-md text-primary-teal mb-2">
              Welcome, {storyteller.name}!
            </h2>
            <p className="body-md text-neutral-600">
              Thank you for contributing to this important exercise.
            </p>
          </div>
        </div>

        {/* Story Form */}
        <StorySubmitForm storyteller={storyteller} token={token} />
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Submit Your Story - SARE",
    description: "Share your story for the SARE exercise.",
  };
} 