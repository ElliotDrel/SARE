import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Story, SelfReflection } from './supabase/types';

interface StoryWithStoryteller extends Story {
  storyteller: {
    name: string;
    email: string;
  };
}

interface ReportData {
  userEmail: string;
  stories: StoryWithStoryteller[];
  selfReflection: SelfReflection | null;
}

export async function generateSAREReport(data: ReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Colors
  const primaryTeal = rgb(0, 0.44, 0.49); // #00707C
  const accentCoral = rgb(1, 0.42, 0.34); // #FF6A57
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  let page = pdfDoc.addPage([612, 792]); // Standard letter size
  let yPosition = 750;

  // Helper function to add new page if needed
  const checkPageSpace = (neededSpace: number) => {
    if (yPosition - neededSpace < 50) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = 750;
    }
  };

  // Helper function to draw text with word wrapping
  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, font = helveticaFont) => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    lines.forEach((line, index) => {
      page.drawText(line, {
        x,
        y: y - (index * (fontSize + 2)),
        size: fontSize,
        font,
        color: darkGray,
      });
    });

    return lines.length * (fontSize + 2);
  };

  // Header
  page.drawText('SARE PERSONAL STRENGTHS REPORT', {
    x: 50,
    y: yPosition,
    size: 24,
    font: helveticaBoldFont,
    color: primaryTeal,
  });

  yPosition -= 40;

  page.drawText(`Generated for: ${data.userEmail}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: lightGray,
  });

  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: 400,
    y: yPosition,
    size: 12,
    font: helveticaFont,
    color: lightGray,
  });

  yPosition -= 60;

  // Introduction
  page.drawText('Introduction', {
    x: 50,
    y: yPosition,
    size: 18,
    font: helveticaBoldFont,
    color: primaryTeal,
  });

  yPosition -= 30;

  const introText = 'This report contains stories about you at your best, collected from people who know you well, along with your personal reflections. These insights reveal your signature strengths and natural talents.';
  const introHeight = drawWrappedText(introText, 50, yPosition, 500, 12);
  yPosition -= introHeight + 30;

  // Stories Section
  if (data.stories.length > 0) {
    checkPageSpace(60);
    
    page.drawText(`Stories About You (${data.stories.length})`, {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: primaryTeal,
    });

    yPosition -= 40;

    data.stories.forEach((story, index) => {
      checkPageSpace(120);
      
      // Story header
      page.drawText(`Story ${index + 1}: From ${story.storyteller.name}`, {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: accentCoral,
      });

      yPosition -= 25;

      // Story parts
      const parts = [
        { label: 'Part 1', content: story.story_part_1 },
        { label: 'Part 2', content: story.story_part_2 },
        { label: 'Part 3', content: story.story_part_3 },
      ].filter(part => part.content);

      parts.forEach((part) => {
        checkPageSpace(50);
        
        if (part.content) {
          page.drawText(`${part.label}:`, {
            x: 70,
            y: yPosition,
            size: 12,
            font: helveticaBoldFont,
            color: darkGray,
          });

          yPosition -= 20;

          const partHeight = drawWrappedText(part.content, 70, yPosition, 480, 11);
          yPosition -= partHeight + 15;
        }
      });

      yPosition -= 20;
    });
  }

  // Self Reflection Section
  if (data.selfReflection) {
    checkPageSpace(60);
    
    page.drawText('Your Self-Reflections', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: primaryTeal,
    });

    yPosition -= 40;

    const reflections = [
      { 
        title: 'Peak Performance Moments', 
        content: data.selfReflection.reflection_1,
        question: 'When you felt you were performing at your absolute best:'
      },
      { 
        title: 'Natural Talents & Energy', 
        content: data.selfReflection.reflection_2,
        question: 'Activities that come naturally and give you energy:'
      },
      { 
        title: 'Impact & Contribution', 
        content: data.selfReflection.reflection_3,
        question: 'How you contribute to teams and relationships:'
      },
    ];

    reflections.forEach((reflection) => {
      if (reflection.content) {
        checkPageSpace(100);
        
        page.drawText(reflection.title, {
          x: 50,
          y: yPosition,
          size: 14,
          font: helveticaBoldFont,
          color: accentCoral,
        });

        yPosition -= 25;

        page.drawText(reflection.question, {
          x: 70,
          y: yPosition,
          size: 11,
          font: helveticaFont,
          color: lightGray,
        });

        yPosition -= 20;

        const reflectionHeight = drawWrappedText(reflection.content, 70, yPosition, 480, 11);
        yPosition -= reflectionHeight + 25;
      }
    });
  }

  // Footer
  checkPageSpace(60);
  yPosition = 50;
  
  page.drawText('SARE - See Yourself at Your Best', {
    x: 50,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: lightGray,
  });

  page.drawText(`Page 1 of ${pdfDoc.getPageCount()}`, {
    x: 500,
    y: yPosition,
    size: 10,
    font: helveticaFont,
    color: lightGray,
  });

  return await pdfDoc.save();
} 