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
import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
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
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const margin = 50;
      let y = height - margin;

      const drawWrappedText = (
        text: string,
        options: {
          font: PDFFont;
          size: number;
          lineHeight: number;
          x: number;
        }
      ) => {
        const { font, size, lineHeight, x } = options;
        const maxWidth = width - margin * 2;
        const words = text.split(" ");
        let currentLine = "";
        const lines = [];

        for (const word of words) {
          const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, size);
          if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const textHeight = lines.length * size * lineHeight;
        if (y - textHeight < margin) {
          page = pdfDoc.addPage();
          y = page.getSize().height - margin;
        }

        for (const line of lines) {
          if (y - size * lineHeight < margin) {
            page = pdfDoc.addPage();
            y = page.getSize().height - margin;
          }
          page.drawText(line, { x, y, font, size, color: rgb(0, 0, 0) });
          y -= size * lineHeight;
        }
      };

      drawWrappedText(`SARE Report for ${user.email}`, { font: boldFont, size: 18, lineHeight: 1.5, x: margin });
      y -= 20;

      // Self-Reflections
      drawWrappedText("Your Self-Reflections", { font: boldFont, size: 16, lineHeight: 1.5, x: margin });
      y -= 10;
      
      const reflection1 = selfReflection?.reflection_1 || "Not answered.";
      drawWrappedText("1. A time I was at my best:", { font: boldFont, size: 12, lineHeight: 1.5, x: margin });
      drawWrappedText(reflection1, { font: font, size: 12, lineHeight: 1.5, x: margin });
      y -= 10;
      
      const reflection2 = selfReflection?.reflection_2 || "Not answered.";
      drawWrappedText("2. What makes it a story about you at your best?", { font: boldFont, size: 12, lineHeight: 1.5, x: margin });
      drawWrappedText(reflection2, { font: font, size: 12, lineHeight: 1.5, x: margin });
      y -= 10;
      
      const reflection3 = selfReflection?.reflection_3 || "Not answered.";
      drawWrappedText("3. What are the common themes?", { font: boldFont, size: 12, lineHeight: 1.5, x: margin });
      drawWrappedText(reflection3, { font: font, size: 12, lineHeight: 1.5, x: margin });
      y -= 20;

      // Collected Stories
      drawWrappedText("Collected Stories", { font: boldFont, size: 16, lineHeight: 1.5, x: margin });
      y -=10;

      stories.forEach((story) => {
        const storytellerName = story.storyteller?.name || "Anonymous";
        drawWrappedText(`Story from: ${storytellerName}`, { font: boldFont, size: 12, lineHeight: 1.5, x: margin });
        
        drawWrappedText(story.story_part_1, { font: font, size: 12, lineHeight: 1.5, x: margin });
        if(story.story_part_2) {
            drawWrappedText(story.story_part_2, { font: font, size: 12, lineHeight: 1.5, x: margin });
        }
        if(story.story_part_3) {
            drawWrappedText(story.story_part_3, { font: font, size: 12, lineHeight: 1.5, x: margin });
        }
        y -= 10; // Add space between stories
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