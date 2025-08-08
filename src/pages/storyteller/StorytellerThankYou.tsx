import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Heart, 
  ArrowLeft, 
  Edit,
  Share2,
  Loader2,
  AlertCircle,
  Star,
  MessageSquare
} from "lucide-react";
import { 
  useStorytellerByToken, 
  useSubmittedStory
} from "@/hooks/useStoryteller";
import { formatDistanceToNow } from "date-fns";

const StorytellerThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const { data: storyteller, isLoading: storytellerLoading } = useStorytellerByToken(token);
  const { data: submittedStory, isLoading: storyLoading } = useSubmittedStory(token);

  // Redirect to write page if no story submitted yet
  useEffect(() => {
    if (storyteller && !storyLoading && !submittedStory) {
      navigate(`/storyteller/write?token=${token}`);
    }
  }, [storyteller, submittedStory, storyLoading, navigate, token]);

  const handleEditStory = () => {
    navigate(`/storyteller/write?token=${token}&edit=true`);
  };

  if (storytellerLoading || storyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!storyteller || !submittedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Story Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We couldn't find your submitted story. You may need to submit it again.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/storyteller/write?token=${token}`)}
              className="w-full"
            >
              Go to Writing Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const inviterName = storyteller.profiles?.display_name || 
                      `${storyteller.profiles?.first_name || ''} ${storyteller.profiles?.last_name || ''}`.trim() ||
                      'Someone';

  const submittedTime = submittedStory.submitted_at ? 
    formatDistanceToNow(new Date(submittedStory.submitted_at), { addSuffix: true }) : 
    'recently';

  const storyCount = [
    submittedStory.story_one,
    submittedStory.story_two,
    submittedStory.story_three
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">SARE</h1>
            <p className="text-sm text-muted-foreground mt-1">Strengths in Action Reflection Experience</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Thank You Card */}
        <Card className="border-green-200 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-800">Thank You!</CardTitle>
            <p className="text-lg text-muted-foreground">
              Your story has been successfully submitted
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Heart className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>{storyteller.name}</strong>, your contribution means a lot to {inviterName}. 
                Your story will help them understand and develop their strengths.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium mb-1">{storyCount} {storyCount === 1 ? 'Story' : 'Stories'}</h3>
                <p className="text-sm text-muted-foreground">
                  Shared {submittedTime}
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Star className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium mb-1">Impact Made</h3>
                <p className="text-sm text-muted-foreground">
                  Contributing to their growth
                </p>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium mb-1">Complete</h3>
                <p className="text-sm text-muted-foreground">
                  No further action needed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">1</Badge>
                <div>
                  <h4 className="font-medium">Collection Phase</h4>
                  <p className="text-sm text-muted-foreground">
                    {inviterName} is collecting stories from multiple people to get a comprehensive 
                    view of their strengths.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">2</Badge>
                <div>
                  <h4 className="font-medium">Self Reflection</h4>
                  <p className="text-sm text-muted-foreground">
                    Once they reach their story goal, they'll complete their own reflection 
                    on their strengths before seeing any stories.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Badge variant="outline" className="flex-shrink-0">3</Badge>
                <div>
                  <h4 className="font-medium">Strengths Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Finally, they'll receive a comprehensive report that includes their reflection 
                    and all the stories, including yours.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Editing */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Story & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Privacy Protected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Your story will only be shared with {inviterName} as part of their personal 
                  development process. We respect your privacy and won't use your story for any other purpose.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Edit className="h-4 w-4 text-primary" />
                  Can Still Edit
                </h4>
                <p className="text-sm text-muted-foreground">
                  You can edit your story anytime before {inviterName} completes their reflection 
                  and locks the report. Just use the link you received in your email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            size="lg"
            onClick={handleEditStory}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit My Story
          </Button>

          <Button 
            variant="outline"
            size="lg"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'SARE - Strengths in Action Reflection Experience',
                  text: 'I just shared a story about someone\'s strengths through SARE!',
                  url: window.location.origin
                });
              } else {
                navigator.clipboard.writeText(window.location.origin);
                alert('Link copied to clipboard!');
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share SARE
          </Button>

          <Button 
            size="lg"
            onClick={() => window.close()}
          >
            Close
          </Button>
        </div>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for taking the time to help {inviterName} understand their strengths. 
            Your perspective is valuable and will make a real difference in their development.
          </p>
        </div>
      </main>
    </div>
  );
};

export default StorytellerThankYou;