import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible } from "@/components/ui/collapsible";
import { 
  FileText,
  Users,
  MessageSquare,
  Calendar,
  ArrowLeft,
  CheckCircle,
  BookOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStoriesForUser, getSelfReflection } from "@/lib/supabase/database";
import PDFDownloadButton from "@/components/pdf-download-button";
import type { Story, SelfReflection } from "@/lib/supabase/types";

interface StoryWithStoryteller extends Story {
  storyteller: {
    name: string;
    email: string;
  };
}

async function getReportData(userId: string) {
  const [storiesResult, reflectionResult] = await Promise.all([
    getStoriesForUser(userId),
    getSelfReflection(userId)
  ]);

  if (storiesResult.error) {
    throw new Error(storiesResult.error.message);
  }

  const stories = storiesResult.data || [];
  
  let selfReflection = null;
  if (reflectionResult.error && reflectionResult.error.code !== 'PGRST116') {
    throw new Error(reflectionResult.error.message);
  } else if (!reflectionResult.error) {
    selfReflection = reflectionResult.data;
  }

  return { stories, selfReflection };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getReflectionCompletion(selfReflection: SelfReflection | null) {
  if (!selfReflection) return { completed: 0, total: 3 };
  const completed = [
    selfReflection.reflection_1,
    selfReflection.reflection_2,
    selfReflection.reflection_3
  ].filter(r => r && r.trim().length > 0).length;
  return { completed, total: 3 };
}

export default async function ReportPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const userEmail = user.email || "";

  let stories: StoryWithStoryteller[] = [];
  let selfReflection: SelfReflection | null = null;
  let error: string | null = null;

  try {
    const data = await getReportData(user.id);
    stories = data.stories;
    selfReflection = data.selfReflection;
  } catch (err) {
    console.error("Error loading report data:", err);
    error = err instanceof Error ? err.message : "Failed to load report data";
  }

  if (error) {
    return (
      <div className="container-sare section-spacing">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Error Loading Report</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/protected/onboarding/self_reflection">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Self Reflection
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reflectionStatus = getReflectionCompletion(selfReflection);
  const canGenerateReport = stories.length > 0 && reflectionStatus.completed === 3;

  return (
    <div className="container-sare section-spacing">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/protected/onboarding/self_reflection">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        
        <h1 className="heading-xl text-primary-teal mb-2">
          Your SARE Report
        </h1>
        <p className="body-lg text-muted-foreground">
          Your personalized strengths report based on collected stories and self-reflections.
        </p>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <Users className="h-5 w-5" />
              Stories Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-1">
              {stories.length}
            </div>
            <p className="text-sm text-muted-foreground">
              {stories.length === 1 ? 'story' : 'stories'} from your network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <MessageSquare className="h-5 w-5" />
              Self-Reflections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-1">
              {reflectionStatus.completed} / {reflectionStatus.total}
            </div>
            <p className="text-sm text-muted-foreground">
              reflections completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <FileText className="h-5 w-5" />
              Report Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {canGenerateReport ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-700">Ready</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-700">In Progress</span>
                </>
              )}
            </div>
            {canGenerateReport ? (
              <PDFDownloadButton
                userEmail={userEmail}
                stories={stories}
                selfReflection={selfReflection}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete all reflections to generate
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stories Section */}
      {stories.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <Users className="h-5 w-5" />
              Stories About You ({stories.length})
            </CardTitle>
            <CardDescription>
              Stories collected from people who know you well, showing you at your best.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stories.map((story, index) => (
              <Collapsible
                key={story.id}
                title={`Story ${index + 1}: From ${story.storyteller.name}`}
                className="border-primary-teal/20"
              >
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{story.storyteller.email}</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(story.submitted_at)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-accent-coral mb-2">Story Part 1</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {story.story_part_1}
                      </p>
                    </div>
                    
                    {story.story_part_2 && (
                      <div>
                        <h4 className="font-medium text-accent-coral mb-2">Story Part 2</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {story.story_part_2}
                        </p>
                      </div>
                    )}
                    
                    {story.story_part_3 && (
                      <div>
                        <h4 className="font-medium text-accent-coral mb-2">Story Part 3</h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {story.story_part_3}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-700">No Stories Yet</CardTitle>
            <CardDescription className="text-amber-600">
              You haven&apos;t collected any stories yet. Add storytellers and send invites to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/protected/onboarding/storytellers">
                <Users className="h-4 w-4 mr-2" />
                Add Storytellers
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Self Reflection Section */}
      {selfReflection ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <MessageSquare className="h-5 w-5" />
              Your Self-Reflections
            </CardTitle>
            <CardDescription>
              Your personal insights about your strengths and peak performance moments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                title: "Peak Performance Moments",
                content: selfReflection.reflection_1,
                question: "When you felt you were performing at your absolute best:"
              },
              {
                title: "Natural Talents & Energy",
                content: selfReflection.reflection_2,
                question: "Activities that come naturally and give you energy:"
              },
              {
                title: "Impact & Contribution",
                content: selfReflection.reflection_3,
                question: "How you contribute to teams and relationships:"
              }
            ].map((reflection, index) => (
              <div key={index} className="border-l-4 border-accent-coral pl-4">
                <h4 className="font-medium text-accent-coral mb-1">
                  {reflection.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {reflection.question}
                </p>
                {reflection.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {reflection.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Not completed yet
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-700">Self-Reflections Needed</CardTitle>
            <CardDescription className="text-amber-600">
              Complete your self-reflections to include personal insights in your report.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/protected/onboarding/self_reflection">
                <MessageSquare className="h-4 w-4 mr-2" />
                Complete Reflections
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-12 flex justify-between">
        <Button asChild variant="outline">
          <Link href="/protected/onboarding/self_reflection">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous: Self Reflection
          </Link>
        </Button>
        
        <Button asChild>
          <Link href="/protected">
            Dashboard
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Link>
        </Button>
      </div>
    </div>
  );
} 