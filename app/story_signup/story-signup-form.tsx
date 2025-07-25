"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StorySignupFormProps {
  token: string;
}

export default function StorySignupForm({ token }: StorySignupFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("token", token);

      await signUp(formData);
      
      router.push(`/story_submit?token=${token}`);
      
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="heading-xl text-primary-teal mb-4">Create Your Account</h1>
        <p className="body-md text-neutral-600">
          Create an account to securely submit your story for the SARE exercise.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border-2 border-primary-teal/20 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 8 characters)"
              required
              minLength={8}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={8}
              className="w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent-coral hover:bg-accent-coral/90 text-white font-medium py-3"
          >
            {isLoading ? "Creating Account..." : "Create Account & Continue"}
          </Button>

          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600 text-center">
              By creating an account, you&apos;re agreeing to securely submit your story as part of the SARE exercise.
            </p>
          </div>
        </form>
      </div>

      <div className="text-center mt-6">
        <Link
          href={`/story_invite?token=${token}`}
          className="text-primary-teal hover:text-primary-teal/80 text-sm font-medium"
        >
          ← Back to Invitation
        </Link>
      </div>
    </div>
  );
} 