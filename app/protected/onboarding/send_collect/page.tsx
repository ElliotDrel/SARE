"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail,
  Phone,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  BarChart3,
  Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Storyteller } from "@/lib/supabase/types";

// Metadata for this page
// Note: This is a client component, so metadata should be handled by parent layout

export default function SendCollectPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [storyCount, setStoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailServiceError, setEmailServiceError] = useState<string | null>(null);
  
  const supabase = createClient();
  const STORY_GOAL = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch storytellers
      const { data: storytellersData, error: storytellersError } = await supabase
        .from("storytellers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (storytellersError) throw storytellersError;
      setStorytellers(storytellersData || []);

      // Fetch story count
      const { count } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setStoryCount(count || 0);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Could not fetch storyteller data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sendInvite = async (storyteller: Storyteller) => {
    if (!userId) return;

    setSendingInvites(prev => new Set(prev).add(storyteller.id));
    setError(null);
    setEmailServiceError(null);
    
    try {
      // Update invite_sent_at timestamp
      const { error: updateError } = await supabase
        .from("storytellers")
        .update({ invite_sent_at: new Date().toISOString() })
        .eq("id", storyteller.id);

      if (updateError) throw updateError;

      // Try to invoke the Supabase Edge Function to send the invite email
      try {
        const { error: invokeError } = await supabase.functions.invoke('send-story-invite', {
          body: { 
            email: storyteller.email,
            invite_token: storyteller.invite_token,
            storyteller_name: storyteller.name,
          },
        });

        if (invokeError) throw invokeError;
      } catch (emailError) {
        console.error("Email service error:", emailError);
        setEmailServiceError("Email service is not configured. Please contact support to set up email functionality.");
        // Don't throw the error - we still want to mark the invite as sent in the database
      }

      // Refresh data to show updated status
      await fetchData();
      
    } catch (error) {
      console.error("Error sending invite:", error);
      setError(`Failed to send invite to ${storyteller.name}. Please try again.`);
    } finally {
      setSendingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(storyteller.id);
        return newSet;
      });
    }
  };

  const getStatusInfo = (storyteller: Storyteller) => {
    if (storyteller.story_submitted_at) {
      return {
        status: "completed",
        icon: CheckCircle,
        text: "Story received",
        color: "bg-green-100 text-green-800",
        iconColor: "text-green-600"
      };
    } else if (storyteller.invite_sent_at) {
      return {
        status: "sent",
        icon: Clock,
        text: "Invite sent",
        color: "bg-amber-100 text-amber-800",
        iconColor: "text-amber-600"
      };
    } else {
      return {
        status: "pending",
        icon: AlertCircle,
        text: "Not invited",
        color: "bg-gray-100 text-gray-800",
        iconColor: "text-gray-600"
      };
    }
  };

  const storiesReceived = storytellers.filter(s => s.story_submitted_at).length;
  const invitesSent = storytellers.filter(s => s.invite_sent_at).length;
  const progressPercentage = Math.min((storyCount / STORY_GOAL) * 100, 100);

  if (isLoading) {
    return (
      <div className="container-sare section-spacing">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your storytellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sare section-spacing">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/protected/onboarding/storytellers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Storytellers
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send & Collect Stories</h1>
            <p className="text-gray-600 mt-2">
              Send invitations to your storytellers and track story collection progress
            </p>
          </div>
        </div>
      </div>

      {/* Email Service Warning */}
      {emailServiceError && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Email Service Not Configured:</strong> {emailServiceError}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storytellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storytellers.length}</div>
            <p className="text-xs text-muted-foreground">
              People in your network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invites Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitesSent}</div>
            <p className="text-xs text-muted-foreground">
              Out of {storytellers.length} storytellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories Collected</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storyCount}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {STORY_GOAL} stories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Collection Progress
          </CardTitle>
          <CardDescription>
            Track your progress toward collecting {STORY_GOAL} stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{storyCount} stories collected</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storytellers List */}
      {storytellers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Storytellers Added</h3>
            <p className="text-gray-600 mb-4">
              You need to add storytellers before you can send invitations.
            </p>
            <Button asChild>
              <Link href="/protected/onboarding/storytellers">
                Add Storytellers
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Storytellers</h2>
            <Button variant="outline" asChild>
              <Link href="/protected/onboarding/storytellers">
                Add More Storytellers
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4">
            {storytellers.map((storyteller) => {
              const statusInfo = getStatusInfo(storyteller);
              const StatusIcon = statusInfo.icon;
              const isLoading = sendingInvites.has(storyteller.id);

              return (
                <Card key={storyteller.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className={`h-6 w-6 ${statusInfo.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {storyteller.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-1" />
                              {storyteller.email}
                            </div>
                            {storyteller.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-4 w-4 mr-1" />
                                {storyteller.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={statusInfo.color}>
                          {statusInfo.text}
                        </Badge>
                        
                        {statusInfo.status === "pending" && (
                          <Button
                            onClick={() => sendInvite(storyteller)}
                            disabled={isLoading}
                            size="sm"
                            className="bg-primary-teal hover:bg-primary-teal/90"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Invite
                              </>
                            )}
                          </Button>
                        )}
                        
                        {statusInfo.status === "sent" && (
                          <Button
                            onClick={() => sendInvite(storyteller)}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Resending...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion Status */}
      {storyCount >= 1 && (
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Great progress! You have {storyCount} stor{storyCount === 1 ? 'y' : 'ies'} collected
                </h3>
                <p className="text-green-700">
                  You can continue collecting more stories in the background, or proceed to complete your self-reflection.
                </p>
              </div>
            </div>
            
            <Button 
              asChild 
              size="lg" 
              className="bg-accent-coral hover:bg-accent-coral/90 px-8"
            >
              <Link href="/protected/onboarding/self_reflection">
                Continue to Self Reflection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {storytellers.length > 0 && storyCount === 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Waiting for Stories
              </h3>
              <p className="text-blue-700 mb-4">
                Your storytellers will receive an email invitation with a link to share their stories. 
                Stories typically arrive within 1-2 weeks.
              </p>
              <div className="bg-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Next Steps:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• You can continue to the next step once you have at least 1 story</li>
                  <li>• Or wait to collect more stories for a richer self-reflection</li>
                  <li>• You can always come back to send more invites later</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
        <Button variant="outline" asChild>
          <Link href="/protected/onboarding/storytellers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Storytellers
          </Link>
        </Button>
        
        {storyCount >= 1 ? (
          <Button asChild className="bg-primary-teal hover:bg-primary-teal/90">
            <Link href="/protected/onboarding/self_reflection">
              Continue to Self Reflection
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <Button disabled className="bg-gray-300">
            Continue to Self Reflection
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}