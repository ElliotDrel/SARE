"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitStory } from "./actions";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? "Submitting Story..." : "Submit Your Story"}
    </Button>
  );
}

export function StorySubmitForm() {
  const [state, formAction] = useFormState(submitStory, initialState);
  const [storyPart1Length, setStoryPart1Length] = useState(0);
  const [storyPart2Length, setStoryPart2Length] = useState(0);
  const [storyPart3Length, setStoryPart3Length] = useState(0);

  return (
    <CardContent>
      {state.message && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}
      <form action={formAction} className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="story_part_1">
            Describe a time when this person was at their best. What happened? What did they do? (Required)
          </Label>
          <Textarea
            id="story_part_1"
            name="story_part_1"
            required
            rows={6}
            placeholder="Share the first part of your story here..."
            onChange={(e) => setStoryPart1Length(e.target.value.length)}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Required</span>
            <span className={storyPart1Length > 5000 ? "text-red-500" : ""}>
              {storyPart1Length}/5000 characters
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="story_part_2">
            What qualities or strengths did they demonstrate? (Optional)
          </Label>
          <Textarea
            id="story_part_2"
            name="story_part_2"
            rows={4}
            placeholder="e.g., Leadership, compassion, creativity..."
            onChange={(e) => setStoryPart2Length(e.target.value.length)}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Optional</span>
            <span className={storyPart2Length > 5000 ? "text-red-500" : ""}>
              {storyPart2Length}/5000 characters
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="story_part_3">
            How did their actions impact you or others? (Optional)
          </Label>
          <Textarea
            id="story_part_3"
            name="story_part_3"
            rows={4}
            placeholder="e.g., It inspired our team, it made me feel valued..."
            onChange={(e) => setStoryPart3Length(e.target.value.length)}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Optional</span>
            <span className={storyPart3Length > 5000 ? "text-red-500" : ""}>
              {storyPart3Length}/5000 characters
            </span>
          </div>
        </div>

        <SubmitButton />
      </form>
    </CardContent>
  );
} 