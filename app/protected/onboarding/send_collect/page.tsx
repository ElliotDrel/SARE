"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail,
  Phone,
  Send,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Users,
  BarChart3
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getStoryCount } from "@/lib/supabase/database";
import type { Storyteller } from "@/lib/supabase/types";

// Metadata for this page
// Note: This is a client component, so metadata should be handled by parent layout

export default function SendCollectPage() {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [storyCount, setStoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClient();
  const STORY_GOAL = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      const count = await getStoryCount(user.id);
      setStoryCount(count);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvite = async (storyteller: Storyteller) => {
    if (!userId) return;

    setSendingInvites(prev => new Set(prev).add(storyteller.id));
    
    try {
      // Update invite_sent_at timestamp
      const { error } = await supabase
        .from("storytellers")
        .update({ invite_sent_at: new Date().toISOString() })
        .eq("id", storyteller.id);

      if (error) throw error;

      // TODO: Implement actual email sending via Supabase Edge Functions
      // For now, we'll just simulate the email sending
      console.log(`Sending invite to ${storyteller.email} with token: ${storyteller.invite_token}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data to show updated status
      await fetchData();
      
    } catch (error) {
      console.error("Error sending invite:", error);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-teal mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading story collection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sare section-spacing">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-xl text-primary-teal mb-2">
          Send and Collect Stories
        </h1>
        <p className="body-lg text-muted-foreground">
          Send invitations to your storytellers and track their progress as they share stories about your strengths.
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-primary-teal/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <BarChart3 className="h-5 w-5" />
              Stories Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-2">
              {storyCount} / {STORY_GOAL}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-primary-teal h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progressPercentage.toFixed(0)}% of goal reached
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary-teal/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <Send className="h-5 w-5" />
              Invites Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-2">
              {invitesSent}
            </div>
            <p className="text-sm text-muted-foreground">
              out of {storytellers.length} storytellers
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary-teal/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary-teal">
              <CheckCircle className="h-5 w-5" />
              Stories Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-teal mb-2">
              {storiesReceived}
            </div>
            <p className="text-sm text-muted-foreground">
              responses received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storytellers List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary-teal">
            <Users className="h-5 w-5" />
            Your Storytellers ({storytellers.length})
          </CardTitle>
          <CardDescription>
            Send invitations and track the progress of your story collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          {storytellers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No storytellers added yet
              </h3>
              <p className="text-gray-500 mb-4">
                You need to add storytellers before you can send invitations.
              </p>
              <Button asChild className="bg-primary-teal hover:bg-primary-teal/90">
                <Link href="/protected/onboarding/storytellers">
                  Add Storytellers
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {storytellers.map((storyteller) => {
                const statusInfo = getStatusInfo(storyteller);
                const StatusIcon = statusInfo.icon;
                const isSending = sendingInvites.has(storyteller.id);
                
                return (
                  <div
                    key={storyteller.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{storyteller.name}</h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.iconColor}`} />
                          {statusInfo.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {storyteller.email}
                        </div>
                        {storyteller.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {storyteller.phone}
                          </div>
                        )}
                      </div>
                      {storyteller.invite_sent_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Invited on {new Date(storyteller.invite_sent_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!storyteller.story_submitted_at && (
                        <Button
                          size="sm"
                          variant={storyteller.invite_sent_at ? "outline" : "default"}
                          onClick={() => sendInvite(storyteller)}
                          disabled={isSending}
                          className={!storyteller.invite_sent_at ? "bg-primary-teal hover:bg-primary-teal/90" : ""}
                        >
                          {isSending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              {storyteller.invite_sent_at ? "Resend" : "Send Invite"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {storyCount >= 1 && (
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Great progress! You have {storyCount} stor{storyCount === 1 ? 'y' : 'ies'} collected
            </h3>
            <p className="text-green-700">
              You can continue collecting more stories in the background, or proceed to complete your self-reflection.
            </p>
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
      )}

      {/* Instructions */}
      {storytellers.length > 0 && storyCount === 0 && (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Waiting for Stories
          </h3>
          <p className="text-blue-700 mb-4">
            Your storytellers will receive an email invitation with a link to share their stories. 
            Stories typically arrive within 1-2 weeks.
          </p>
          <p className="text-sm text-blue-600">
            You can continue to the next step once you have at least 1 story, or wait to collect more stories first.
          </p>
        </div>
      )}
    </div>
  );
}