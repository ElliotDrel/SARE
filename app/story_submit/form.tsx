"use client";

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

  return (
    <CardContent>
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
          />
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
          />
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
          />
        </div>

        {state?.message && (
          <p className="text-sm text-red-500 text-center">{state.message}</p>
        )}
        <SubmitButton />
      </form>
    </CardContent>
  );
} 