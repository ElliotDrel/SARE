import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, RGB } from "pdf-lib";
import type { User } from "@supabase/supabase-js";
import type { SelfReflection, Story } from "@/lib/supabase/types";

// PDF styling constants
const PDF_CONSTANTS = {
  MARGIN: 50,
  FONT_SIZES: {
    TITLE: 18,
    SECTION_HEADER: 16,
    QUESTION: 12,
    BODY: 12,
  },
  LINE_HEIGHT: 1.5,
  SECTION_SPACING: 20,
  QUESTION_SPACING: 10,
  STORY_SPACING: 10,
  COLORS: {
    BLACK: rgb(0, 0, 0),
    DARK_GRAY: rgb(0.2, 0.2, 0.2),
  },
} as const;

type StoryWithStoryteller = Story & {
  storyteller: {
    name: string;
    email: string;
  } | null;
};

interface PDFGeneratorOptions {
  user: User;
  selfReflection: SelfReflection | null;
  stories: StoryWithStoryteller[];
}

class PDFGenerator {
  private pdfDoc: PDFDocument;
  private regularFont: PDFFont;
  private boldFont: PDFFont;
  private currentPage: PDFPage;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;

  constructor(
    pdfDoc: PDFDocument,
    regularFont: PDFFont,
    boldFont: PDFFont
  ) {
    this.pdfDoc = pdfDoc;
    this.regularFont = regularFont;
    this.boldFont = boldFont;
    this.currentPage = pdfDoc.addPage();
    const { width, height } = this.currentPage.getSize();
    this.pageWidth = width;
    this.pageHeight = height;
    this.currentY = height - PDF_CONSTANTS.MARGIN;
  }

  private checkAndAddNewPage(requiredHeight: number): void {
    if (this.currentY - requiredHeight < PDF_CONSTANTS.MARGIN) {
      this.currentPage = this.pdfDoc.addPage();
      this.currentY = this.pageHeight - PDF_CONSTANTS.MARGIN;
    }
  }

  private drawWrappedText(
    text: string,
    options: {
      font: PDFFont;
      size: number;
      color?: RGB;
      maxWidth?: number;
    }
  ): void {
    const { font, size, color = PDF_CONSTANTS.COLORS.BLACK } = options;
    const maxWidth = options.maxWidth || (this.pageWidth - PDF_CONSTANTS.MARGIN * 2);
    const lineHeight = size * PDF_CONSTANTS.LINE_HEIGHT;
    
    const words = text.split(" ");
    let currentLine = "";
    const lines: string[] = [];

    // Split text into lines that fit within maxWidth
    for (const word of words) {
      const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Calculate total height needed
    const totalHeight = lines.length * lineHeight;
    this.checkAndAddNewPage(totalHeight);

    // Draw each line
    for (const line of lines) {
      this.checkAndAddNewPage(lineHeight);
      this.currentPage.drawText(line, {
        x: PDF_CONSTANTS.MARGIN,
        y: this.currentY,
        font,
        size,
        color,
      });
      this.currentY -= lineHeight;
    }
  }

  private addTitle(title: string): void {
    this.drawWrappedText(title, {
      font: this.boldFont,
      size: PDF_CONSTANTS.FONT_SIZES.TITLE,
    });
    this.currentY -= PDF_CONSTANTS.SECTION_SPACING;
  }

  private addSectionHeader(header: string): void {
    this.drawWrappedText(header, {
      font: this.boldFont,
      size: PDF_CONSTANTS.FONT_SIZES.SECTION_HEADER,
    });
    this.currentY -= PDF_CONSTANTS.QUESTION_SPACING;
  }

  private addQuestion(question: string): void {
    this.drawWrappedText(question, {
      font: this.boldFont,
      size: PDF_CONSTANTS.FONT_SIZES.QUESTION,
    });
  }

  private addAnswer(answer: string): void {
    this.drawWrappedText(answer, {
      font: this.regularFont,
      size: PDF_CONSTANTS.FONT_SIZES.BODY,
    });
    this.currentY -= PDF_CONSTANTS.QUESTION_SPACING;
  }

  private addSelfReflections(selfReflection: SelfReflection | null): void {
    this.addSectionHeader("Your Self-Reflections");

    const questions = [
      {
        question: "1. A time I was at my best:",
        answer: selfReflection?.reflection_1 || "Not answered.",
      },
      {
        question: "2. What makes it a story about you at your best?",
        answer: selfReflection?.reflection_2 || "Not answered.",
      },
      {
        question: "3. What are the common themes?",
        answer: selfReflection?.reflection_3 || "Not answered.",
      },
    ];

    questions.forEach((item) => {
      this.addQuestion(item.question);
      this.addAnswer(item.answer);
    });

    this.currentY -= PDF_CONSTANTS.SECTION_SPACING;
  }

  private addStories(stories: StoryWithStoryteller[]): void {
    this.addSectionHeader("Collected Stories");

    if (stories.length === 0) {
      this.addAnswer("No stories have been collected yet.");
      return;
    }

    stories.forEach((story) => {
      const storytellerName = story.storyteller?.name || "Anonymous";
      this.addQuestion(`Story from: ${storytellerName}`);
      
      // Add story parts
      this.addAnswer(story.story_part_1);
      
      if (story.story_part_2) {
        this.addAnswer(story.story_part_2);
      }
      
      if (story.story_part_3) {
        this.addAnswer(story.story_part_3);
      }
      
      this.currentY -= PDF_CONSTANTS.STORY_SPACING;
    });
  }

  public generate(): void {
    // Add title
    this.addTitle(`SARE Report for ${this.user.email}`);
    
    // Add self-reflections
    this.addSelfReflections(this.selfReflection);
    
    // Add stories
    this.addStories(this.stories);
  }

  private user: User;
  private selfReflection: SelfReflection | null;
  private stories: StoryWithStoryteller[];

  public static async create(options: PDFGeneratorOptions): Promise<PDFGenerator> {
    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const generator = new PDFGenerator(pdfDoc, regularFont, boldFont);
    generator.user = options.user;
    generator.selfReflection = options.selfReflection;
    generator.stories = options.stories;
    
    return generator;
  }

  public async save(): Promise<Uint8Array> {
    return await this.pdfDoc.save();
  }
}

export async function generateSAREReport(options: PDFGeneratorOptions): Promise<Uint8Array> {
  const generator = await PDFGenerator.create(options);
  generator.generate();
  return await generator.save();
}

export { PDF_CONSTANTS };