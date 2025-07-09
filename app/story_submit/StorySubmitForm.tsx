"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Storyteller } from "@/lib/supabase/types";

interface StorySubmitFormProps {
  storyteller: Storyteller;
  token: string;
}

export default function StorySubmitForm({ storyteller, token }: StorySubmitFormProps) {
  const router = useRouter();
  const [storyPart1, setStoryPart1] = useState("");
  const [storyPart2, setStoryPart2] = useState("");
  const [storyPart3, setStoryPart3] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Character counts
  const part1Count = storyPart1.length;
  const part2Count = storyPart2.length;
  const part3Count = storyPart3.length;

  // Auto-save functionality (similar to self-reflection)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (storyPart1.trim()) {
        autoSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [storyPart1, storyPart2, storyPart3]);

  const autoSave = async () => {
    if (!storyPart1.trim()) return; // Don't save if main story is empty

    setSaveStatus("saving");
    
    try {
      const supabase = createClient();
      
      // Check if story already exists
      const { data: existingStory } = await supabase
        .from("stories")
        .select("id")
        .eq("storyteller_id", storyteller.id)
        .single();

      if (existingStory) {
        // Update existing story
        const { error } = await supabase
          .from("stories")
          .update({
            story_part_1: storyPart1,
            story_part_2: storyPart2 || null,
            story_part_3: storyPart3 || null,
          })
          .eq("storyteller_id", storyteller.id);

        if (error) throw error;
      } else {
        // Create new story draft (without submission timestamp)
        const { error } = await supabase
          .from("stories")
          .insert({
            storyteller_id: storyteller.id,
            user_id: storyteller.user_id,
            story_part_1: storyPart1,
            story_part_2: storyPart2 || null,
            story_part_3: storyPart3 || null,
          });

        if (error) throw error;
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storyPart1.trim()) {
      setError("Please share your story in the first section before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Submit the story with timestamp
      const { error: storyError } = await supabase
        .from("stories")
        .upsert({
          storyteller_id: storyteller.id,
          user_id: storyteller.user_id,
          story_part_1: storyPart1,
          story_part_2: storyPart2 || null,
          story_part_3: storyPart3 || null,
          submitted_at: new Date().toISOString(),
        });

      if (storyError) throw storyError;

      // Update storyteller record with submission timestamp
      const { error: storytellerError } = await supabase
        .from("storytellers")
        .update({
          story_submitted_at: new Date().toISOString(),
        })
        .eq("id", storyteller.id);

      if (storytellerError) throw storytellerError;

      // Redirect to thank you page
      router.push("/story_thank_you");
      
    } catch (error: any) {
      console.error("Submission error:", error);
      setError(error.message || "An error occurred while submitting your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load existing draft if any
  useEffect(() => {
    const loadExistingStory = async () => {
      try {
        const supabase = createClient();
        const { data: story } = await supabase
          .from("stories")
          .select("*")
          .eq("storyteller_id", storyteller.id)
          .eq("submitted_at", null) // Only load drafts
          .single();

        if (story) {
          setStoryPart1(story.story_part_1 || "");
          setStoryPart2(story.story_part_2 || "");
          setStoryPart3(story.story_part_3 || "");
        }
      } catch (error) {
        // No existing draft, that's fine
      }
    };

    loadExistingStory();
  }, [storyteller.id]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Save Status */}
      {saveStatus && (
        <div className="text-center">
          {saveStatus === "saving" && (
            <p className="text-sm text-neutral-500">Saving draft...</p>
          )}
          {saveStatus === "saved" && (
            <p className="text-sm text-green-600">Draft saved ✓</p>
          )}
          {saveStatus === "error" && (
            <p className="text-sm text-red-600">Error saving draft</p>
          )}
        </div>
      )}

      {/* Main Story (Required) */}
      <div className="bg-white rounded-lg border-2 border-primary-teal/20 p-6">
        <div className="mb-4">
          <Label htmlFor="story-part-1" className="heading-md text-neutral-800">
            Your Story <span className="text-accent-coral">*</span>
          </Label>
          <p className="body-sm text-neutral-600 mt-1">
            Tell us about a time when you witnessed someone at their absolute best. What happened? What did you observe?
          </p>
        </div>
        <Textarea
          id="story-part-1"
          value={storyPart1}
          onChange={(e) => setStoryPart1(e.target.value)}
          placeholder="Share your story here... Think about a specific moment when you saw someone performing at their peak, demonstrating their natural talents, or making a meaningful impact."
          className="min-h-[200px] resize-none"
          required
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-neutral-500">
            Required section
          </p>
          <p className="text-sm text-neutral-500">
            {part1Count} characters
          </p>
        </div>
      </div>

      {/* Additional Context (Optional) */}
      <div className="bg-white rounded-lg border-2 border-neutral-200 p-6">
        <div className="mb-4">
          <Label htmlFor="story-part-2" className="heading-md text-neutral-800">
            Additional Context <span className="text-neutral-500">(Optional)</span>
          </Label>
          <p className="body-sm text-neutral-600 mt-1">
            Add any additional context, background, or details that help complete the picture.
          </p>
        </div>
        <Textarea
          id="story-part-2"
          value={storyPart2}
          onChange={(e) => setStoryPart2(e.target.value)}
          placeholder="Any additional details, context, or background information..."
          className="min-h-[150px] resize-none"
        />
        <div className="flex justify-end mt-2">
          <p className="text-sm text-neutral-500">
            {part2Count} characters
          </p>
        </div>
      </div>

      {/* Reflection (Optional) */}
      <div className="bg-white rounded-lg border-2 border-neutral-200 p-6">
        <div className="mb-4">
          <Label htmlFor="story-part-3" className="heading-md text-neutral-800">
            Your Reflection <span className="text-neutral-500">(Optional)</span>
          </Label>
          <p className="body-sm text-neutral-600 mt-1">
            What impact did witnessing this person at their best have on you? What did you learn or take away from the experience?
          </p>
        </div>
        <Textarea
          id="story-part-3"
          value={storyPart3}
          onChange={(e) => setStoryPart3(e.target.value)}
          placeholder="Share your thoughts and reflections about this experience..."
          className="min-h-[150px] resize-none"
        />
        <div className="flex justify-end mt-2">
          <p className="text-sm text-neutral-500">
            {part3Count} characters
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center pt-6">
        <Button
          type="submit"
          disabled={isSubmitting || !storyPart1.trim()}
          className="px-12 py-4 bg-accent-coral hover:bg-accent-coral/90 text-white font-medium text-lg"
        >
          {isSubmitting ? "Submitting Your Story..." : "Submit Your Story"}
        </Button>
        {!storyPart1.trim() && (
          <p className="text-sm text-neutral-500 mt-2">
            Please share your story in the first section to submit
          </p>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-neutral-50 rounded-lg p-6">
        <h3 className="heading-sm text-neutral-800 mb-3">Tips for a Great Story:</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>• Be specific about what you observed</li>
          <li>• Focus on the person's actions, behaviors, and impact</li>
          <li>• Describe the situation and context</li>
          <li>• Include how it made you feel or what you learned</li>
          <li>• There are no wrong answers - your perspective matters</li>
        </ul>
      </div>
    </form>
  );
} 