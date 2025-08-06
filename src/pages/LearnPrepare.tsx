import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Lightbulb, 
  Users, 
  MessageCircle, 
  ArrowRight,
  Info,
  Heart,
  Star,
  BookOpen
} from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const LearnPrepare = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isCompleting, setIsCompleting] = useState(false);

  const isAlreadyCompleted = profile?.collection_status !== 'preparing';

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      await updateProfile.mutateAsync({
        collection_status: 'collecting'
      });
      
      toast({
        title: "Great start!",
        description: "You're ready to begin collecting stories. Let's start inviting people!",
      });
      
      navigate('/app/invite_track');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Lightbulb className="h-8 w-8 text-primary" />
          Learn & Prepare
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Set yourself up for success by understanding who to ask and how to ask them effectively.
        </p>
      </div>

      {isAlreadyCompleted && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            You've completed this step! You can review this guidance anytime or{" "}
            <Link to="/app/invite_track" className="underline font-medium">
              continue to story collection
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Who to Ask Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Who Should You Ask?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            The right mix of people will give you the richest insights about your strengths.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Professional Connections</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Current or former managers who've seen your work</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Colleagues you've worked closely with on projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Team members you've mentored or supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Clients or customers you've served</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Personal Connections</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Family members who know you well</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Close friends from different stages of life</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Community group members or volunteers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Mentors or coaches who've supported you</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Aim for variety:</strong> Include people from different contexts (work, personal, community) 
              and relationships (peers, managers, mentees) to get a well-rounded view of your strengths.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* How to Ask Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            How to Ask Effectively
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            The way you ask makes all the difference in the quality of responses you'll receive.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">Personal Approach</Badge>
              <p className="text-sm text-muted-foreground">
                Reach out personally first - a text, call, or in-person conversation works best. 
                Explain why their perspective matters to you specifically.
              </p>
            </div>
            
            <div>
              <Badge variant="outline" className="mb-2">Clear Context</Badge>
              <p className="text-sm text-muted-foreground">
                Let them know this is for your personal development or a growth opportunity. 
                Mention it will take about 10-15 minutes of their time.
              </p>
            </div>
            
            <div>
              <Badge variant="outline" className="mb-2">Specific Stories</Badge>
              <p className="text-sm text-muted-foreground">
                Ask for specific examples rather than general opinions. Stories with details 
                and context are much more valuable than abstract descriptions.
              </p>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Sample Invitation Message
            </h4>
            <div className="text-sm space-y-2 bg-background p-4 rounded border-l-4 border-primary">
              <p>
                "Hi [Name], I'm working on understanding my strengths better as part of my professional 
                development, and I'd really value your perspective since you've seen me [specific context].
              </p>
              <p>
                Would you be willing to share a story or two about a time when you saw me at my best? 
                It could be a work project, how I handled a situation, or any moment that stood out to you.
              </p>
              <p>
                I'll send you a simple form that takes about 10-15 minutes. Your insights would mean 
                a lot to me as I think about my growth and development. Thanks for considering it!"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Before You Start</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Make a list of 12-15 potential storytellers</li>
                <li>• Think about your shared experiences with each person</li>
                <li>• Plan your personal outreach approach</li>
                <li>• Set a realistic timeline (2-3 weeks typically)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">As You Collect</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Follow up gently if people haven't responded</li>
                <li>• Thank people promptly when they contribute</li>
                <li>• Be patient - quality takes time</li>
                <li>• Celebrate small wins along the way</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collection Goal */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Your Collection Goal</CardTitle>
          <p className="text-sm text-muted-foreground">
            You're aiming to collect <Badge variant="outline">{profile?.collection_goal ?? 10} stories</Badge> 
            {" "}for the most comprehensive insights.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This number gives you enough variety to see patterns while being achievable. 
            You can adjust this goal later if needed (between 5-20 stories).
          </p>
          
          {!isAlreadyCompleted ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="flex-1"
              >
                {isCompleting ? "Updating..." : "I'm Ready to Start Collecting Stories"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/app">Return to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link to="/app/invite_track">
                  Continue to Story Collection
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link to="/app">Return to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnPrepare;