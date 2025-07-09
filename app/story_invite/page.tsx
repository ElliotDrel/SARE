import Link from "next/link";
import { redirect } from "next/navigation";
import { getStorytellerByToken } from "@/lib/supabase/database";

interface StoryInvitePageProps {
  searchParams: { token?: string };
}

export default async function StoryInvitePage({ searchParams }: StoryInvitePageProps) {
  const { token } = searchParams;

  // Redirect if no token provided
  if (!token) {
    redirect("/");
  }

  // Validate token and get storyteller information
  const { data: storyteller, error } = await getStorytellerByToken(token);

  // Handle invalid or expired token
  if (error || !storyteller) {
    return (
      <div className="container-sare py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-8">
            <h1 className="heading-xl text-red-600 mb-4">Invalid Invitation</h1>
            <p className="body-lg text-neutral-600 mb-6">
              This invitation link is invalid or has expired. Please contact the person who sent you this invitation for a new link.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors font-medium"
            >
              Return to SARE Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if storyteller has already submitted their story
  const hasSubmittedStory = !!storyteller.story_submitted_at;

  return (
    <div className="container-sare py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="heading-xl text-primary-teal mb-4">
            You're Invited to Share Your Story
          </h1>
          <p className="body-lg text-neutral-600">
            You've been invited to participate in the SARE exercise by sharing a story about someone at their best.
          </p>
        </div>

        {/* Storyteller Information Card */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-primary-teal/20 p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="heading-lg text-neutral-800 mb-2">
              Hello, {storyteller.name}!
            </h2>
            <p className="body-md text-neutral-600">
              You were invited to share a story using the email: <strong>{storyteller.email}</strong>
            </p>
          </div>

          {hasSubmittedStory ? (
            /* Already submitted story */
            <div className="text-center">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                <h3 className="heading-md text-green-800 mb-2">Story Already Submitted</h3>
                <p className="body-md text-green-700">
                  Thank you! You've already submitted your story on{" "}
                  {new Date(storyteller.story_submitted_at!).toLocaleDateString()}.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors font-medium"
              >
                Return to SARE Home
              </Link>
            </div>
          ) : (
            /* Need to create account and submit story */
            <div className="text-center">
              <div className="bg-accent-coral/10 border-2 border-accent-coral/30 rounded-lg p-6 mb-6">
                <h3 className="heading-md text-accent-coral mb-2">Ready to Get Started?</h3>
                <p className="body-md text-neutral-700 mb-4">
                  To submit your story, you'll need to create a quick account. This helps us keep your story secure and connected to the right person.
                </p>
                <p className="body-sm text-neutral-600">
                  Don't worry - the process is simple and only takes a minute!
                </p>
              </div>
              
              <Link
                href={`/story_signup?token=${token}`}
                className="inline-flex items-center px-8 py-4 bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 transition-colors font-medium text-lg"
              >
                Create Account & Share Story
              </Link>
            </div>
          )}
        </div>

        {/* What to Expect Section */}
        {!hasSubmittedStory && (
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="heading-md text-neutral-800 mb-4">What to Expect</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <p className="body-md text-neutral-700">Create your account with email and password</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <p className="body-md text-neutral-700">Share your story about someone at their best</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-teal text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <p className="body-md text-neutral-700">Submit and you're done!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "Story Invitation - SARE",
  description: "Accept your invitation to share a story for the SARE exercise."
}; 