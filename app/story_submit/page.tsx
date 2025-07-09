
import { createClient } from "@/lib/supabase/server";
import { getStorytellerDetails } from "@/lib/supabase/database";
import { redirect } from "next/navigation";
import { StorySubmitForm } from "./form";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function StorySubmitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?message=You must be logged in to submit a story.");
  }

  const storytellerDetails = await getStorytellerDetails();

  if (!storytellerDetails) {
    return (
       <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertTitle>Storyteller Account Not Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find your storyteller profile. This could mean:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You haven&apos;t been invited to share a story yet</li>
              <li>Your invitation link may have expired</li>
              <li>There was an issue linking your account to the invitation</li>
            </ul>
            <p className="mt-2 font-medium">
              Please contact the person who invited you or reach out to our support team for assistance.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (storytellerDetails.story_submitted_at) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Alert className="w-full max-w-lg">
          <AlertTitle>Story Already Submitted</AlertTitle>
          <AlertDescription>
            Thank you! It looks like you have already submitted a story for {storytellerDetails.user_email}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Share Your Story</CardTitle>
            <CardDescription className="text-lg">
              You are sharing a story about <strong className="text-primary">{storytellerDetails.user_email}</strong>.
            </CardDescription>
          </CardHeader>
          <StorySubmitForm />
        </Card>
      </div>
    </div>
  );
} 