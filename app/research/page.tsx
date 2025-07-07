import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResearchClient } from "./research-client";

export const metadata = {
  title: "Research Library",
  description: "Peer reviewed studies and white papers that underpin the SARE methodology."
};


export default function ResearchPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-teal text-white section-spacing">
        <div className="container-sare text-center">
          <h1 className="heading-xl mb-6">
            Research Library
          </h1>
          <p className="body-lg max-w-3xl mx-auto text-white/90">
            Peer reviewed studies and white papers that underpin the SARE methodology.
          </p>
        </div>
      </section>

      {/* Client Component for Interactive Features */}
      <ResearchClient />

      {/* Callout Section */}
      <section className="section-spacing bg-gray-50">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-6">Ready to Apply This Research?</h2>
          <p className="body-lg mb-8 max-w-3xl mx-auto text-gray-600">
            The research is clear: understanding and leveraging your signature strengths leads to better outcomes. 
            Start your own SARE journey and put this science to work in your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary-teal hover:bg-primary-teal/90">
              <Link href="/">Learn About SARE</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-up">Start Your Journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}