import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { checkOnboardingStatus } from "@/lib/supabase/database";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Users, 
  MessageSquare, 
  FileText, 
  ArrowRight 
} from "lucide-react";

export default async function ProtectedPage() {
  const STORY_GOAL = 10;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const onboardingStatus = await checkOnboardingStatus(user.id);
  
  // Ensure storiesCollected is a valid number
  const storiesCollected = Number(onboardingStatus.storiesCollected) || 0;

  return (
    <div className="container-sare section-spacing">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="heading-xl text-primary-teal mb-2">
          Welcome back, {user.email}
        </h1>
        <p className="body-lg text-muted-foreground">
          Track your progress and manage your SARE journey
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Stories Collected Card */}
        <Card className="border-primary-teal/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <Users className="h-5 w-5" />
              Stories Collected
            </CardTitle>
            <CardDescription>
              Progress toward your goal of {STORY_GOAL} stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-2">
              {storiesCollected}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-primary-teal h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((storiesCollected / STORY_GOAL) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.max(0, STORY_GOAL - storiesCollected)} stories remaining
            </p>
          </CardContent>
        </Card>

        {/* Self Reflection Status Card */}
        <Card className="border-primary-teal/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <MessageSquare className="h-5 w-5" />
              Self Reflection
            </CardTitle>
            <CardDescription>
              Complete your personal reflections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {onboardingStatus.hasCompletedReflection ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
              <span className="text-lg font-semibold">
                {onboardingStatus.hasCompletedReflection ? "Completed" : "Pending"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {onboardingStatus.hasCompletedReflection
                ? "Your reflections are complete and ready for report generation."
                : "Complete your self-reflection to prepare for your report."}
            </p>
          </CardContent>
        </Card>

        {/* Report Generation Status Card */}
        <Card className="border-primary-teal/20 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <FileText className="h-5 w-5" />
              Report Generation
            </CardTitle>
            <CardDescription>
              Generate your comprehensive SARE report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {onboardingStatus.canGenerateReport ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
              <span className="text-lg font-semibold">
                {onboardingStatus.canGenerateReport ? "Ready" : "Not Ready"}
              </span>
            </div>
            {onboardingStatus.canGenerateReport ? (
              <Button 
                asChild 
                className="w-full bg-accent-coral hover:bg-accent-coral/90"
              >
                <Link href="/protected/onboarding/report">
                  View Report
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete at least 1 story and your self-reflection to generate your report.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="heading-lg text-primary-teal mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Button 
            asChild 
            variant="outline" 
            className="h-auto p-4 flex-col items-start border-primary-teal/20 hover:border-primary-teal/40"
          >
            <Link href="/protected/onboarding/intro">
              <Users className="h-6 w-6 mb-2 text-primary-teal" />
              <span className="font-semibold">Getting Started</span>
              <span className="text-xs text-muted-foreground mt-1">
                Introduction to SARE
              </span>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="h-auto p-4 flex-col items-start border-primary-teal/20 hover:border-primary-teal/40"
          >
            <Link href="/protected/onboarding/storytellers">
              <Users className="h-6 w-6 mb-2 text-primary-teal" />
              <span className="font-semibold">Manage Storytellers</span>
              <span className="text-xs text-muted-foreground mt-1">
                Add and invite storytellers
              </span>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="h-auto p-4 flex-col items-start border-primary-teal/20 hover:border-primary-teal/40"
          >
            <Link href="/protected/onboarding/send_collect">
              <MessageSquare className="h-6 w-6 mb-2 text-primary-teal" />
              <span className="font-semibold">Collect Stories</span>
              <span className="text-xs text-muted-foreground mt-1">
                Send invites and track progress
              </span>
            </Link>
          </Button>

          <Button 
            asChild 
            variant="outline" 
            className="h-auto p-4 flex-col items-start border-primary-teal/20 hover:border-primary-teal/40"
          >
            <Link href="/protected/onboarding/self_reflection">
              <FileText className="h-6 w-6 mb-2 text-primary-teal" />
              <span className="font-semibold">Self Reflection</span>
              <span className="text-xs text-muted-foreground mt-1">
                Complete your personal reflections
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
