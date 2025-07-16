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
import { AlertCircle, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = createClient();

  // Check if user has a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setError("Invalid or expired reset link. Please request a new password reset.");
          setSessionChecked(true);
          return;
        }

        if (session?.user) {
          setHasValidSession(true);
          console.log("Valid session found for password reset");
        } else {
          setError("Invalid or expired reset link. Please request a new password reset.");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setError("An error occurred while validating your reset link.");
      } finally {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, [supabase.auth]);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setHasValidSession(true);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setHasValidSession(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (error) {
        if (error.message.includes("session_not_found")) {
          setError("Your reset session has expired. Please request a new password reset.");
        } else if (error.message.includes("same_password")) {
          setError("New password must be different from your current password.");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login?message=password_updated");
      }, 3000);

    } catch (error: unknown) {
      console.error("Password update error:", error);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (!sessionChecked) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-gray-600">Validating reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Password Updated Successfully
            </CardTitle>
            <CardDescription>Your password has been changed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your password has been successfully updated. You can now sign in with your new password.
                </AlertDescription>
              </Alert>
              <div className="text-sm text-gray-600 text-center">
                <p>Redirecting you to the login page...</p>
              </div>
              <div className="flex gap-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid session state
  if (!hasValidSession) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              Invalid Reset Link
            </CardTitle>
            <CardDescription>This password reset link is invalid or has expired</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error || "This password reset link is invalid or has expired. Please request a new password reset."}
                </AlertDescription>
              </Alert>
              <div className="text-sm text-gray-600 space-y-2">
                <p>Password reset links expire after 1 hour for security reasons.</p>
                <p>Please request a new password reset to continue.</p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/forgot-password">Request New Reset</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main password update form
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Set New Password
          </CardTitle>
          <CardDescription>
            Please enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
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
                {isLoading ? "Updating password..." : "Update Password"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800 underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
