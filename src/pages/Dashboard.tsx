import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  FileText, 
  Plus,
  Send,
  Clock,
  CheckCircle2,
  ArrowRight,
  Target,
  Lightbulb
} from "lucide-react";
import { useProfile, useStoryCount, useCanViewStories } from "@/hooks/useProfile";
import { useRecentActivity } from "@/hooks/useStory";
import { useStorytellers } from "@/hooks/useStorytellers";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: storyCount = 0, isLoading: storyCountLoading } = useStoryCount();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: storytellers = [], isLoading: storytellersLoading } = useStorytellers();
  const { data: canViewStories } = useCanViewStories();

  const isLoading = profileLoading || storyCountLoading || activityLoading || storytellersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const collectionGoal = profile?.collection_goal ?? 10;
  const progressPercentage = Math.min((storyCount / collectionGoal) * 100, 100);
  const pendingInvites = storytellers.filter(s => s.invitation_status === 'pending').length;
  const submittedStories = storytellers.filter(s => s.invitation_status === 'submitted').length;
  
  const canReflect = storyCount >= collectionGoal;
  const hasCompletedReflection = profile?.reflection_completed ?? false;

  // Determine next step
  const getNextStep = () => {
    // Check if user needs to complete Learn & Prepare first
    if (profile?.collection_status === 'preparing') {
      return { text: "Start with Learn & Prepare to understand who to ask", action: "/app/learn_prepare" };
    }
    if (storytellers.length === 0) {
      return { text: "Start by inviting people to share stories about your strengths", action: "/app/invite_track" };
    }
    if (pendingInvites > 0) {
      return { text: "Send invitations to your storytellers", action: "/app/invite_track" };
    }
    if (storyCount < collectionGoal) {
      return { text: "Follow up with storytellers for more responses", action: "/app/invite_track" };
    }
    if (!hasCompletedReflection) {
      return { text: "Complete your self-reflection to unlock your report", action: "/app/self_reflection" };
    }
    return { text: "View your complete strengths report", action: "/app/report" };
  };

  const nextStep = getNextStep();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress, manage your story collection, and reflect on your strengths.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Story Collection Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {storyCount} of {collectionGoal} stories collected
              </p>
            </div>
            <Badge variant={storyCount >= collectionGoal ? "default" : "secondary"} className="text-sm">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercentage} className="h-3" />
          
          {storyCount >= collectionGoal && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Congratulations! You've reached your collection goal.
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <Link to={nextStep.action}>
              <Button variant="outline" size="sm">
                {nextStep.text}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storytellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storytellers.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvites > 0 && `${pendingInvites} pending invites`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stories Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storyCount}</div>
            <p className="text-xs text-muted-foreground">
              Goal: {collectionGoal} stories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Self Reflection</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasCompletedReflection ? "Complete" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {canReflect ? "Ready to start" : "Unlock with more stories"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasCompletedReflection && storyCount >= collectionGoal ? "Ready" : "Locked"}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasCompletedReflection && storyCount >= collectionGoal 
                ? "View your insights" 
                : "Complete reflection first"
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Jump to key areas of your SARE journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/app/learn_prepare" className="block">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                Learn & Prepare
              </Button>
            </Link>
            
            <Link to="/app/invite_track" className="block">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite People
              </Button>
            </Link>
            
            <Link to="/app/invite_track" className="block">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </Link>
            
            <Link to="/app/self_reflection" className="block">
              <Button 
                variant={canReflect ? "outline" : "ghost"} 
                className="w-full justify-start" 
                size="sm"
                disabled={!canReflect}
              >
                <Heart className="h-4 w-4 mr-2" />
                Self Reflection
              </Button>
            </Link>
            
            <Link to="/app/report" className="block">
              <Button 
                variant={hasCompletedReflection && canReflect ? "outline" : "ghost"} 
                className="w-full justify-start" 
                size="sm"
                disabled={!hasCompletedReflection || !canReflect}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Story Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canViewStories === false && (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Stories are locked until you reach your goal and complete self-reflection.</p>
              </div>
            )}
            {canViewStories !== false && activity?.recentStories && activity.recentStories.length > 0 ? (
              <div className="space-y-3">
                {activity.recentStories.slice(0, 3).map((story) => (
                  <div key={story.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {story.storytellers?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {story.storytellers?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {story.submitted_at && formatDistanceToNow(new Date(story.submitted_at), { addSuffix: true })}
                    </div>
                  </div>
                ))}
                {activity.recentStories.length > 3 && (
                  <Link to="/app/invite_track">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View all submissions
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              canViewStories !== false && (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No story submissions yet</p>
                  <p className="text-xs">Stories will appear here once submitted</p>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity?.recentInvites && activity.recentInvites.length > 0 ? (
              <div className="space-y-3">
                {activity.recentInvites.slice(0, 3).map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div>
                        <p className="text-sm font-medium">{invite.name}</p>
                        <p className="text-xs text-muted-foreground">{invite.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {invite.invitation_status}
                    </Badge>
                  </div>
                ))}
                {activity.recentInvites.length > 3 && (
                  <Link to="/app/invite_track">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      Manage all invitations
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invitations sent yet</p>
                <Link to="/app/invite_track">
                  <Button variant="outline" size="sm" className="mt-2">
                    Start inviting people
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;