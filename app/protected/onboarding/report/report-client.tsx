"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { SelfReflection, Story } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateSAREReport } from "@/lib/pdf-generator";
import { saveAs } from "file-saver";
import { X } from "lucide-react";

type StoryWithStoryteller = Story & {
  storyteller: {
    name: string;
    email: string;
  } | null;
};

interface ReportClientProps {
  user: User;
  selfReflection: SelfReflection | null;
  stories: StoryWithStoryteller[];
}

export default function ReportClient({
  user,
  selfReflection,
  stories,
}: ReportClientProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const pdfBytes = await generateSAREReport({
        user,
        selfReflection,
        stories,
      });
      
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "SARE-Report.pdf");

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setError("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="heading-lg">Your SARE Report</h1>
        <Button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Download as PDF"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="h-auto p-1 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Self-Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold">1. A time I was at my best:</h3>
            <p>{selfReflection?.reflection_1 || "You have not answered this question yet."}</p>
          </div>
          <div>
            <h3 className="font-bold">2. What makes it a story about you at your best?</h3>
            <p>{selfReflection?.reflection_2 || "You have not answered this question yet."}</p>
          </div>
          <div>
            <h3 className="font-bold">3. What are the common themes?</h3>
            <p>{selfReflection?.reflection_3 || "You have not answered this question yet."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collected Stories ({stories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {stories.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {stories.map((story) => (
                <AccordionItem value={story.id} key={story.id}>
                  <AccordionTrigger>
                    Story from {story.storyteller?.name || "Anonymous"}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <p>{story.story_part_1}</p>
                    {story.story_part_2 && <p>{story.story_part_2}</p>}
                    {story.story_part_3 && <p>{story.story_part_3}</p>}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p>No stories have been collected yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 