"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Get the current origin safely
      const origin = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/update-password`,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address");
        } else if (error.message.includes("not found")) {
          // For security reasons, we don't want to reveal if an email exists or not
          // So we'll show success even if the email doesn't exist
          setSuccess(true);
        } else if (error.message.includes("rate limit")) {
          setError("Too many requests. Please wait a few minutes before trying again");
        } else {
          setError(error.message);
        }
        
        if (!error.message.includes("not found")) {
          setIsLoading(false);
          return;
        }
      }

      setSuccess(true);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Check Your Email
            </CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  If an account with the email <strong>{email}</strong> exists, you will receive 
                  password reset instructions shortly. Please check your inbox and follow the link 
                  to reset your password.
                </AlertDescription>
              </Alert>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Important:</strong> The reset link will expire in 1 hour for security reasons.</p>
                <p>Didn't receive the email? Check your spam folder or try again with a different email address.</p>
                <p>Make sure to use the same email address you used to create your account.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}>
                  Try Again
                </Button>
                <Button asChild>
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="text-sm text-gray-600">
                    Enter the email address associated with your account
                  </div>
                </div>
                
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : "Send Reset Link"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
