import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Save,
  Lightbulb,
  Target,
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  useSelfReflection, 
  useCreateSelfReflection, 
  useUpdateSelfReflection, 
  useCompleteSelfReflection,
  useReflectionUnlockStatus 
} from "@/hooks/useSelfReflection";
import { useToast } from "@/hooks/use-toast";

const SelfReflection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Hooks
  const { data: reflection, isLoading: reflectionLoading } = useSelfReflection();
  const { data: unlockStatus, isLoading: statusLoading } = useReflectionUnlockStatus();
  const createReflection = useCreateSelfReflection();
  const updateReflection = useUpdateSelfReflection();
  const completeReflection = useCompleteSelfReflection();

  // Form state
  const [formData, setFormData] = useState({
    strengths_response: "",
    evidence_response: "",
    growth_themes_response: "",
    personal_narrative: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<string>("strengths");

  // Initialize form data from existing reflection
  useEffect(() => {
    if (reflection) {
      setFormData({
        strengths_response: reflection.strengths_response || "",
        evidence_response: reflection.evidence_response || "",
        growth_themes_response: reflection.growth_themes_response || "",
        personal_narrative: reflection.personal_narrative || ""
      });
    }
  }, [reflection]);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.strengths_response || formData.evidence_response || formData.growth_themes_response) {
        handleAutoSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleAutoSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (reflection) {
        await updateReflection.mutateAsync(formData);
      } else {
        await createReflection.mutateAsync(formData);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteReflection = async () => {
    if (!formData.strengths_response.trim() || !formData.evidence_response.trim() || !formData.growth_themes_response.trim()) {
      toast({
        title: "Incomplete reflection",
        description: "Please complete all three required sections before finishing.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save current changes first
      if (reflection) {
        await updateReflection.mutateAsync(formData);
      } else {
        await createReflection.mutateAsync(formData);
      }
      
      // Mark as completed
      await completeReflection.mutateAsync();
      
      toast({
        title: "Reflection completed!",
        description: "Great work! You can now view your collected stories and generate your report.",
      });
      
      navigate('/app/report');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete reflection. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (reflectionLoading || statusLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  // Show locked state if reflection is not yet available
  if (!unlockStatus?.canStartReflection && !unlockStatus?.isReflecting && !unlockStatus?.isCompleted) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Lock className="h-8 w-8 text-muted-foreground" />
            Self Reflection
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Complete your story collection to unlock this step.
          </p>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Reflection Locked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-amber-800">Story Collection Progress</span>
                <Badge variant="outline" className="border-amber-300 text-amber-800">
                  {unlockStatus?.storyCount || 0} / {unlockStatus?.collectionGoal || 10}
                </Badge>
              </div>
              <Progress 
                value={(((unlockStatus?.storyCount || 0) / (unlockStatus?.collectionGoal || 10)) * 100)} 
                className="w-full"
              />
              <p className="text-sm text-amber-700">
                You need {(unlockStatus?.collectionGoal || 10) - (unlockStatus?.storyCount || 0)} more stories 
                to unlock the reflection step. This ensures you have enough insights to reflect meaningfully 
                on your strengths.
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/app/invite_track">
                    Continue Collecting Stories
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/app">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = unlockStatus?.isCompleted && reflection?.completed_at;
  const progress = [
    formData.strengths_response.trim() ? 1 : 0,
    formData.evidence_response.trim() ? 1 : 0,
    formData.growth_themes_response.trim() ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Self Reflection
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Before you see your stories, take time to reflect on your own perspective of your strengths.
        </p>
      </div>

      {/* Completion Status */}
      {isCompleted && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Reflection completed! You can now{" "}
            <Link to="/app/report" className="underline font-medium">
              view your complete report
            </Link>
            {" "}or continue editing your reflection below.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress and Save Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Progress:</span>
            <Badge variant={progress === 3 ? "default" : "secondary"}>
              {progress}/3 sections completed
            </Badge>
          </div>
          <Progress value={(progress / 3) * 100} className="w-32" />
        </div>
        
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

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "strengths", label: "Strengths", icon: Target, required: true },
          { id: "evidence", label: "Evidence", icon: FileText, required: true },
          { id: "growth", label: "Growth Themes", icon: TrendingUp, required: true },
          { id: "narrative", label: "Personal Narrative", icon: Lightbulb, required: false }
        ].map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="flex-shrink-0"
          >
            <section.icon className="h-4 w-4 mr-2" />
            {section.label}
            {section.required && !formData[`${section.id === 'growth' ? 'growth_themes' : section.id}_response` as keyof typeof formData]?.trim() && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </Button>
        ))}
      </div>

      {/* Reflection Sections */}
      {activeSection === "strengths" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Your Strengths
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              What do you see as your core strengths? Think about what you do well naturally, 
              what energizes you, and what others have told you about your abilities.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Consider these prompts:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• What activities or tasks feel effortless to you?</li>
                <li>• When do you feel most energized and engaged?</li>
                <li>• What do people often ask for your help with?</li>
                <li>• What patterns do you notice in your successes?</li>
              </ul>
            </div>
            
            <Textarea
              placeholder="Reflect on your strengths here... (minimum 50 words recommended)"
              value={formData.strengths_response}
              onChange={(e) => handleInputChange("strengths_response", e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.strengths_response.split(' ').filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "evidence" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Expected Evidence
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              What evidence do you expect to see in the stories people will share about you? 
              What examples or themes do you anticipate?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Think about:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Specific situations where you've made a positive impact</li>
                <li>• Ways you've helped others or solved problems</li>
                <li>• Moments when your strengths were particularly visible</li>
                <li>• Feedback you've received in the past</li>
              </ul>
            </div>
            
            <Textarea
              placeholder="What evidence do you expect to see in your stories?... (minimum 50 words recommended)"
              value={formData.evidence_response}
              onChange={(e) => handleInputChange("evidence_response", e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.evidence_response.split(' ').filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "growth" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Growth Themes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Where do you want to grow and develop? What areas would you like to strengthen 
              or explore further?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Consider:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Strengths you'd like to develop further</li>
                <li>• New skills or capabilities you want to build</li>
                <li>• Areas where you feel you have potential</li>
                <li>• Challenges you'd like to take on</li>
              </ul>
            </div>
            
            <Textarea
              placeholder="Where do you want to grow and develop?... (minimum 50 words recommended)"
              value={formData.growth_themes_response}
              onChange={(e) => handleInputChange("growth_themes_response", e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.growth_themes_response.split(' ').filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "narrative" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Personal Narrative (Optional)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Is there anything else you'd like to capture about your strengths, goals, or perspective 
              before seeing your stories?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">This space is for:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Additional thoughts or insights</li>
                <li>• Personal goals or aspirations</li>
                <li>• Context you want to remember</li>
                <li>• Anything else that feels important</li>
              </ul>
            </div>
            
            <Textarea
              placeholder="Share any additional thoughts or insights... (optional)"
              value={formData.personal_narrative}
              onChange={(e) => handleInputChange("personal_narrative", e.target.value)}
              className="min-h-[150px] resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.personal_narrative.split(' ').filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" asChild>
          <Link to="/app">Return to Dashboard</Link>
        </Button>

        <div className="flex gap-3">
          {!isCompleted && (
            <Button 
              onClick={handleCompleteReflection}
              disabled={progress < 3 || completeReflection.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {completeReflection.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Complete Reflection
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
          
          {isCompleted && (
            <Button asChild>
              <Link to="/app/report">
                View Your Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfReflection;