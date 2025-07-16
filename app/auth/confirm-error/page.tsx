"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Mail, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmErrorPage() {
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  
  const error = searchParams.get("error") || "An unknown error occurred during email confirmation.";

  const handleResendConfirmation = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      // This would typically require the user's email, but since we don't have it,
      // we'll redirect them to a page where they can request a new confirmation
      window.location.href = "/auth/resend-confirmation";
    } catch (error) {
      setResendError("Failed to resend confirmation email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getErrorMessage = (error: string) => {
    if (error.includes("expired")) {
      return {
        title: "Confirmation Link Expired",
        message: "Your email confirmation link has expired. Please request a new one.",
        canResend: true
      };
    } else if (error.includes("invalid") || error.includes("token")) {
      return {
        title: "Invalid Confirmation Link",
        message: "The confirmation link is invalid or has already been used.",
        canResend: true
      };
    } else {
      return {
        title: "Confirmation Failed",
        message: error,
        canResend: true
      };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">
                {errorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-red-700 font-medium">
                  {errorInfo.message}
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't worry, this can be easily resolved.
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-800 space-y-1">
                  <p><strong>What to do next:</strong></p>
                  <p>• Check your spam/junk folder</p>
                  <p>• Request a new confirmation email</p>
                  <p>• Contact support if the issue persists</p>
                </div>
              </div>

              {resendSuccess && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ New confirmation email sent! Please check your inbox.
                  </p>
                </div>
              )}

              {resendError && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">
                    {resendError}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {errorInfo.canResend && (
                  <Button 
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Request New Confirmation Email
                      </>
                    )}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href="/auth/sign-up">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign Up
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Already confirmed your email? <Link href="/auth/login" className="text-red-600 hover:text-red-700 underline">Sign in here</Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? <Link href="/contact" className="text-red-600 hover:text-red-700 underline">Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}