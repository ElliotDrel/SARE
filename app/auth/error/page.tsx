import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  // Determine error type and provide appropriate guidance
  const getErrorInfo = (errorMessage: string) => {
    if (errorMessage.includes("Invalid or missing authentication parameters")) {
      return {
        title: "Invalid Authentication Link",
        description: "The link you clicked is invalid or has expired.",
        suggestions: [
          "Check that you clicked the complete link from your email",
          "Make sure the link hasn't expired (links expire after 1 hour)",
          "Try requesting a new password reset if this was a password reset link"
        ]
      };
    }
    
    if (errorMessage.includes("Token has expired")) {
      return {
        title: "Link Expired",
        description: "This authentication link has expired for security reasons.",
        suggestions: [
          "Authentication links expire after 1 hour",
          "Request a new password reset or sign-up confirmation",
          "Check your email for a more recent link"
        ]
      };
    }

    if (errorMessage.includes("Invalid token")) {
      return {
        title: "Invalid Token",
        description: "The authentication token is invalid or has already been used.",
        suggestions: [
          "Make sure you're using the latest link from your email",
          "Check that the link hasn't been used already",
          "Request a new authentication link"
        ]
      };
    }

    return {
      title: "Authentication Error",
      description: "Something went wrong with the authentication process.",
      suggestions: [
        "Try the process again from the beginning",
        "Check your internet connection",
        "Contact support if the problem persists"
      ]
    };
  };

  const errorInfo = error ? getErrorInfo(error) : {
    title: "Unknown Error",
    description: "An unspecified error occurred.",
    suggestions: ["Please try again or contact support"]
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                {errorInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorInfo.description}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">What you can try:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">
                    Technical details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {error}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/auth/forgot-password">Reset Password</Link>
                </Button>
              </div>
              
              <div className="text-center">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">← Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
