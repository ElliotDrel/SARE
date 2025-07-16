"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfirmSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const nextUrl = searchParams.get("next") || "/protected";

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          router.push(nextUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUrl, router]);

  const handleContinue = () => {
    setIsRedirecting(true);
    router.push(nextUrl);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Email Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  Your email address has been successfully verified.
                </p>
                <p className="text-sm text-muted-foreground">
                  Welcome to SARE! Your account is now active and ready to use.
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ Email verified<br />
                  ✅ Account activated<br />
                  ✅ Ready to explore SARE
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleContinue}
                  disabled={isRedirecting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isRedirecting ? (
                    "Redirecting..."
                  ) : (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
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
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                  >
                    <Link href="/protected">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {isRedirecting ? (
                    "Redirecting now..."
                  ) : (
                    <>Auto-redirecting in {countdown} seconds</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble? <Link href="/contact" className="text-green-600 hover:text-green-700 underline">Contact support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}