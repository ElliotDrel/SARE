import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Save, 
  Send, 
  ArrowLeft, 
  MessageSquare, 
  Lightbulb, 
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { 
  useStorytellerByToken, 
  useStoryDraft, 
  useSubmittedStory, 
  useAutoSaveStoryDraft,
  useSubmitStory
} from "@/hooks/useStoryteller";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const StorytellerWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const isEditing = searchParams.get('edit') === 'true';
  const { data: storyteller, isLoading: storytellerLoading } = useStorytellerByToken(token);
  const { data: existingDraft } = useStoryDraft(token);
  const { data: submittedStory } = useSubmittedStory(token);
  const submitStory = useSubmitStory();

  // Form state
  const [formData, setFormData] = useState({
    story_one: "",
    story_two: "",
    story_three: "",
    notes: ""
  });
  const [activeField, setActiveField] = useState<'story_one' | 'story_two' | 'story_three'>('story_one');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save with the custom hook
  const { lastSaved, isSaving } = useAutoSaveStoryDraft(
    token,
    formData,
    !submittedStory && !!storyteller
  );

  // Load existing draft
  useEffect(() => {
    if (existingDraft && !isEditing) {
      setFormData({
        story_one: existingDraft.story_one || "",
        story_two: existingDraft.story_two || "",
        story_three: existingDraft.story_three || "",
        notes: existingDraft.notes || ""
      });
    }
  }, [existingDraft, isEditing]);

  // Load submitted story for editing
  useEffect(() => {
    if (submittedStory && isEditing) {
      setFormData({
        story_one: submittedStory.story_one || "",
        story_two: submittedStory.story_two || "",
        story_three: submittedStory.story_three || "",
        notes: submittedStory.notes || ""
      });
    }
  }, [submittedStory, isEditing]);

  // Redirect if already submitted (unless editing)
  useEffect(() => {
    if (submittedStory && storyteller && !isEditing) {
      navigate(`/storyteller/thank-you?token=${token}`);
    }
  }, [submittedStory, storyteller, navigate, token, isEditing]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitStory = async () => {
    if (!storyteller || !formData.story_one.trim()) {
      toast({
        title: "Story required",
        description: "Please write at least the first story before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitStory.mutateAsync({
        token: token as string,
        storyData: {
          story_one: formData.story_one.trim(),
          story_two: formData.story_two.trim() || null,
          story_three: formData.story_three.trim() || null
        }
      });

      toast({
        title: "Story submitted!",
        description: "Thank you for sharing your story. Your contribution is valuable!"
      });

      navigate(`/storyteller/thank-you?token=${token}`);
    } catch (error) {
      console.error("Failed to submit story:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (storytellerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your writing space...</p>
        </div>
      </div>
    );
  }

  if (!storyteller) {
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
              This invitation link is invalid or has expired.
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

  const completedStories = [
    formData.story_one.trim() ? 1 : 0,
    formData.story_two.trim() ? 1 : 0,
    formData.story_three.trim() ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const progressPercentage = Math.max((completedStories / 1) * 100, 0); // At least one story required

  const storyPrompts = {
    story_one: {
      title: "First Story (Required)",
      prompts: [
        "Think of a specific time when you saw them excel or stand out",
        "What was the situation? What did they do that impressed you?",
        "How did their actions make a difference to you or others?",
        "What strengths or qualities did they demonstrate?"
      ]
    },
    story_two: {
      title: "Second Story (Optional)",
      prompts: [
        "Can you think of another example from a different context?", 
        "How do they handle challenges or difficult situations?",
        "What's unique about their approach to problem-solving?",
        "When have you seen them help others succeed?"
      ]
    },
    story_three: {
      title: "Third Story (Optional)",
      prompts: [
        "Is there a recent example that comes to mind?",
        "How do they show leadership or influence others?",
        "What would you want them to know about their impact?",
        "What advice would you give them based on what you've observed?"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/storyteller/welcome?token=${token}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-xl font-bold">Share Your Story</h1>
                <p className="text-sm text-muted-foreground">
                  Writing about <strong>{inviterName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="w-24" />
                <Badge variant={completedStories >= 1 ? "default" : "secondary"}>
                  {completedStories}/1 Required
                </Badge>
              </div>

              {/* Auto-save Status */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : lastSaved ? (
                  <>
                    <Save className="h-4 w-4" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Story Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Stories</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose which story to work on
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(storyPrompts).map(([key, story]) => (
                  <Button
                    key={key}
                    variant={activeField === key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveField(key as typeof activeField)}
                  >
                    <div className="flex items-center gap-2">
                      {formData[key as keyof typeof formData].trim() ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      <span className="text-left">
                        {story.title}
                      </span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Writing Tips */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5" />
                  Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">Make it specific:</p>
                  <p className="text-muted-foreground">
                    Focus on particular moments, situations, or projects rather than general qualities.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Include details:</p>
                  <p className="text-muted-foreground">
                    What was the context? What exactly did they do? What was the result?
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Be honest:</p>
                  <p className="text-muted-foreground">
                    Share authentic observations. There's no "right" answer - just your genuine experience.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Writing Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  {storyPrompts[activeField].title}
                </CardTitle>
                <div className="space-y-2">
                  {storyPrompts[activeField].prompts.map((prompt, index) => (
                    <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {prompt}
                    </p>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`Tell your story here... ${activeField === 'story_one' ? '(Required)' : '(Optional)'}`}
                  value={formData[activeField]}
                  onChange={(e) => handleInputChange(activeField, e.target.value)}
                  className="min-h-[300px] resize-none text-base leading-relaxed"
                />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {formData[activeField].split(' ').filter(word => word.length > 0).length} words
                  </span>
                  {activeField === 'story_one' && !formData.story_one.trim() && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Required field
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleSubmitStory}
                disabled={!formData.story_one.trim() || isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Stories
                    <Send className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <Alert className="sm:hidden border-amber-200 bg-amber-50 p-3">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your progress is automatically saved. You can come back anytime to finish.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StorytellerWrite;