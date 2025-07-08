import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle } from 'lucide-react';

export default function StoryThankYouPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gray-50 p-6 md:p-10">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl">Thank You!</CardTitle>
          <CardDescription>
            Your story has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your contribution is greatly appreciated and will help the recipient gain valuable insights into their strengths. You may now safely close this window.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 