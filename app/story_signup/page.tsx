"use client";

import { useSearchParams } from "next/navigation";
import { StorytellerSignUpForm } from "./form";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function StorytellerSignUpPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>
              Create an account to share your story.
            </CardDescription>
          </CardHeader>
          <StorytellerSignUpForm token={token} />
        </Card>
      </div>
    </div>
  );
} 