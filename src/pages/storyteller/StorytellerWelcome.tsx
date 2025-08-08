import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ArrowRight, 
  Clock, 
  MessageSquare, 
  User,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useStorytellerByToken, useSubmittedStory, useUpdateStorytellerAccess } from "@/hooks/useStoryteller";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const StorytellerWelcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const { data: storyteller, isLoading: storytellerLoading, error } = useStorytellerByToken(token);
  const { data: submittedStory } = useSubmittedStory(token);
  const updateAccess = useUpdateStorytellerAccess();

  // Update access tracking when page loads
  useEffect(() => {
    if (storyteller && user) {
      updateAccess.mutate({ 
        storytellerId: storyteller.id, 
        authUserId: user.id 
      });
    }
  }, [storyteller, user, updateAccess]);

  // Redirect if story already submitted
  useEffect(() => {
    if (submittedStory && storyteller) {
      navigate(`/storyteller/thank-you?token=${token}`);
    }
  }, [submittedStory, storyteller, navigate, token]);

  const handleGetStarted = () => {
    if (token) {
      navigate(`/storyteller/write?token=${token}`);
    }
  };

  if (storytellerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !storyteller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This invitation link is invalid or has expired. Please check with the person who 
              sent you this link for a new invitation.
            </p>
            <Button variant="outline" onClick={() => window.close()} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = storyteller.profiles?.display_name || 
                      `${storyteller.profiles?.first_name || ''} ${storyteller.profiles?.last_name || ''}`.trim() ||
                      'Someone';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">SARE</h1>
            <p className="text-sm text-muted-foreground mt-1">Strengths in Action Reflection Experience</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Card */}
        <Card className="border-primary/20 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">You've Been Invited to Share Your Story!</CardTitle>
            <p className="text-muted-foreground text-lg">
              <strong>{inviterName}</strong> has asked you to share a story about their strengths
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <User className="h-4 w-4" />
              <AlertDescription>
                Hello <strong>{storyteller.name}</strong>! Your perspective is valuable because you've 
                seen {inviterName} in action. Your story will help them understand their strengths better.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Share Stories</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about times when you saw {inviterName.split(' ')[0]} at their best
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">10-15 Minutes</h3>
                <p className="text-sm text-muted-foreground">
                  This will take about 10-15 minutes of your time
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Make an Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Your stories will help them grow and develop their strengths
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to Expect */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">1</Badge>
                <div>
                  <h4 className="font-medium">Three Story Fields</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll have space to share up to three different stories. The first one is required, 
                    but you can add more if you'd like.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">2</Badge>
                <div>
                  <h4 className="font-medium">Helpful Prompts</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll provide prompts and examples to help you think of specific moments 
                    and situations that show {inviterName.split(' ')[0]}'s strengths.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">3</Badge>
                <div>
                  <h4 className="font-medium">Save Your Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    You can save your progress and return later if needed. Your work will be 
                    automatically saved as you write.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-2">Story Examples</h4>
              <p className="text-sm text-muted-foreground mb-2">Think about moments like:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• A time they solved a difficult problem or challenge</li>
                <li>• When they helped you or someone else succeed</li>
                <li>• A project where they really stood out or made a difference</li>
                <li>• How they handle pressure or difficult situations</li>
                <li>• Their unique approach to getting things done</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-medium mb-2">Privacy & Usage</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Your stories will only be shared with {inviterName} as part of their personal 
                development. We respect your privacy and will not use your stories for any other purpose.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StorytellerWelcome;