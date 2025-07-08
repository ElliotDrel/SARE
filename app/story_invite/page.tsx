import { getStorytellerByToken } from "@/lib/supabase/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StoryInvitePage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              The invitation link is missing a token. Please check the URL and try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: storyteller, error } = await getStorytellerByToken(token);

  if (error || !storyteller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link is either invalid or has expired. Please contact the person who invited you for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            You have been invited by a SARE user to share a story about them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-4">
            Hi, <strong>{storyteller.name}</strong>!
          </p>
          <p className="text-muted-foreground">
            Your story will help them discover their best self. Please sign up to continue.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link href={`/story_signup?token=${token}`}>
              Accept Invitation & Sign Up
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 