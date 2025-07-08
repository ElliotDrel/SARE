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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

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

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const margin = 50;
      let y = height - margin;

      const drawText = (
        text: string,
        x: number,
        yPos: number,
        isBold = false,
        size = 12
      ) => {
        page.drawText(text, {
          x,
          y: yPos,
          font: isBold ? boldFont : font,
          size,
          color: rgb(0, 0, 0),
        });
        return yPos - size * 1.5;
      };
      
      y = drawText(`SARE Report for ${user.email}`, margin, y, true, 18);
      y -= 20;

      // Self-Reflections
      y = drawText("Your Self-Reflections", margin, y, true, 16);
      y -= 10;
      
      const reflection1 = selfReflection?.reflection_1 || "Not answered.";
      y = drawText("1. A time I was at my best:", margin, y, true);
      y = drawText(reflection1, margin, y);
      y -= 10;
      
      const reflection2 = selfReflection?.reflection_2 || "Not answered.";
      y = drawText("2. What makes it a story about you at your best?", margin, y, true);
      y = drawText(reflection2, margin, y);
      y -= 10;
      
      const reflection3 = selfReflection?.reflection_3 || "Not answered.";
      y = drawText("3. What are the common themes?", margin, y, true);
      y = drawText(reflection3, margin, y);
      y -= 20;

      // Collected Stories
      y = drawText("Collected Stories", margin, y, true, 16);

      stories.forEach((story) => {
        y -= 10;
        const storytellerName = story.storyteller?.name || "Anonymous";
        y = drawText(`Story from: ${storytellerName}`, margin, y, true);
        y = drawText(story.story_part_1, margin, y);
        if(story.story_part_2) y = drawText(story.story_part_2, margin, y);
        if(story.story_part_3) y = drawText(story.story_part_3, margin, y);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, "SARE-Report.pdf");

    } catch (error) {
      console.error("Failed to generate PDF:", error);
      // Here you could add a user-facing error message
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