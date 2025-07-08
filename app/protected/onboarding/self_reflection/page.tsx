"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Save,
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Metadata for this page
// Note: This is a client component, so metadata should be handled by parent layout

export default function SelfReflectionPage() {
  const [reflections, setReflections] = useState({
    reflection_1: "",
    reflection_2: "",
    reflection_3: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  const supabase = createClient();

  // Reflection questions
  const questions = [
    {
      id: 'reflection_1',
      title: 'Peak Performance Moments',
      question: 'Think about a time when you felt you were performing at your absolute best. What was happening? What strengths were you using? How did it feel?',
      placeholder: 'Describe a specific moment when you felt most effective and engaged...'
    },
    {
      id: 'reflection_2', 
      title: 'Natural Talents & Energy',
      question: 'What activities or tasks come naturally to you and give you energy? When do you feel most like yourself?',
      placeholder: 'Reflect on what energizes you and feels most natural...'
    },
    {
      id: 'reflection_3',
      title: 'Impact & Contribution',
      question: 'How do you typically contribute to teams or relationships? What value do you bring that others notice and appreciate?',
      placeholder: 'Think about the unique value you bring to others...'
    }
  ];

  const fetchReflections = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: existingReflection } = await supabase
        .from("self_reflections")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (existingReflection) {
        setReflections({
          reflection_1: existingReflection.reflection_1 || "",
          reflection_2: existingReflection.reflection_2 || "",
          reflection_3: existingReflection.reflection_3 || ""
        });
        setLastSaved(new Date(existingReflection.updated_at));
      }
    } catch (error) {
      console.error("Error fetching reflections:", error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  const saveReflections = useCallback(async (reflectionData = reflections) => {
    if (!userId) return;

    setSaveStatus('saving');
    setIsSaving(true);

    try {
      await supabase
        .from("self_reflections")
        .upsert({
          user_id: userId,
          ...reflectionData
        }, { onConflict: "user_id" })
        .select()
        .single();

      setLastSaved(new Date());
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving reflections:", error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [userId, reflections, supabase]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (!userId || saveStatus === 'saving') return;

    const autoSaveTimer = setTimeout(() => {
      const hasContent = reflections.reflection_1 || reflections.reflection_2 || reflections.reflection_3;
      if (hasContent) {
        saveReflections();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [reflections, userId, saveReflections, saveStatus]);

  const handleReflectionChange = (field: keyof typeof reflections, value: string) => {
    setReflections(prev => ({ ...prev, [field]: value }));
  };

  const handleManualSave = () => {
    saveReflections();
  };

  const getCompletionStatus = () => {
    const completedCount = Object.values(reflections).filter(r => r.trim().length > 0).length;
    return {
      completed: completedCount,
      total: 3,
      percentage: Math.round((completedCount / 3) * 100),
      isComplete: completedCount === 3
    };
  };

  const status = getCompletionStatus();

  if (isLoading) {
    return (
      <div className="container-sare section-spacing">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-teal mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your reflections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sare section-spacing">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-xl text-primary-teal mb-2">
          Self Reflection
        </h1>
        <p className="body-lg text-muted-foreground">
          Complete these reflections to gain deeper insights into your strengths and prepare for your personalized report.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8 border-primary-teal/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary-teal">
            <BookOpen className="h-5 w-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-primary-teal">
                {status.completed} / {status.total}
              </div>
              <p className="text-sm text-muted-foreground">
                Reflections completed
              </p>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-1 text-amber-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Save failed</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-primary-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${status.percentage}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {status.percentage}% complete
            </p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reflection Questions */}
      <div className="space-y-8 mb-8">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-primary-teal/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-teal">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-teal text-white text-sm font-bold">
                  {index + 1}
                </div>
                {question.title}
              </CardTitle>
              <CardDescription className="text-base">
                {question.question}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={question.id} className="text-sm font-medium">
                    Your reflection
                  </Label>
                  <div className="flex items-center gap-1">
                    {reflections[question.id as keyof typeof reflections].trim().length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <Textarea
                  id={question.id}
                  value={reflections[question.id as keyof typeof reflections]}
                  onChange={(e) => handleReflectionChange(question.id as keyof typeof reflections, e.target.value)}
                  placeholder={question.placeholder}
                  className="min-h-[120px] resize-none"
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  {reflections[question.id as keyof typeof reflections].length} characters
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={handleManualSave}
          disabled={isSaving}
          variant="outline"
          className="border-primary-teal text-primary-teal hover:bg-primary-teal hover:text-white"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Reflections
            </>
          )}
        </Button>
      </div>

      {/* Next Steps */}
      {status.isComplete && (
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Excellent! Your reflections are complete
            </h3>
            <p className="text-green-700">
              You&apos;ve completed all three reflection questions. Your insights will help create a personalized report that highlights your unique strengths.
            </p>
          </div>
          
          <Button 
            asChild 
            size="lg" 
            className="bg-accent-coral hover:bg-accent-coral/90 px-8"
          >
            <Link href="/protected/onboarding/report">
              Generate Your Report
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!status.isComplete && (
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Take Your Time
          </h3>
          <p className="text-blue-700 mb-4">
            These reflections are automatically saved as you type. Take your time to think deeply about each question.
          </p>
          <p className="text-sm text-blue-600">
            Complete all three reflections to unlock your personalized strengths report.
          </p>
        </div>
      )}
    </div>
  );
}