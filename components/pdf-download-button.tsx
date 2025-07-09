"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateSAREReport } from "@/lib/pdf-generator";
import type { Story, SelfReflection } from "@/lib/supabase/types";

interface StoryWithStoryteller extends Story {
  storyteller: {
    name: string;
    email: string;
  };
}

interface PDFDownloadButtonProps {
  userEmail: string;
  stories: StoryWithStoryteller[];
  selfReflection: SelfReflection | null;
  disabled?: boolean;
}

export default function PDFDownloadButton({ 
  userEmail, 
  stories, 
  selfReflection, 
  disabled = false 
}: PDFDownloadButtonProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    if (!userEmail) return;

    setIsGeneratingPDF(true);
    setError(null);
    
    try {
      const pdfBytes = await generateSAREReport({
        userEmail,
        stories,
        selfReflection
      });

      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SARE-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleDownloadPDF} 
        disabled={disabled || isGeneratingPDF}
        className="w-full bg-accent-coral hover:bg-accent-coral/90"
      >
        {isGeneratingPDF ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 