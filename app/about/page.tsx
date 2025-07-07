import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About the SARE Exercise",
  description: "Learn what the SARE is, the science that supports it, and how it was developed."
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-teal text-white section-spacing">
        <div className="container-sare text-center">
          <h1 className="heading-xl mb-6">
            About the SARE Exercise
          </h1>
          <p className="body-lg max-w-3xl mx-auto text-white/90">
            Discover the methodology behind Stories, Analyses, Reports, and Evaluations - a research-backed approach to understanding your signature strengths.
          </p>
        </div>
      </section>

      {/* What is SARE Section */}
      <section className="section-spacing">
        <div className="container-sare">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-lg text-center mb-12">What is the SARE Exercise?</h2>
            <div className="prose prose-lg mx-auto">
              <p className="body-lg text-gray-600 mb-6">
                SARE stands for <strong>Stories, Analyses, Reports, and Evaluations</strong> - a comprehensive methodology designed to help individuals discover and leverage their signature strengths through the power of narrative reflection.
              </p>
              <p className="body-lg text-gray-600 mb-6">
                The exercise involves collecting stories from people who know you well, engaging in structured self-reflection, and generating insights that reveal your unique combination of talents, skills, and values. These are the qualities that make you most effective, engaged, and authentic.
              </p>
              <p className="body-lg text-gray-600">
                Unlike traditional assessment tools that categorize you into predetermined types, SARE is entirely personalized, drawing from your real experiences and the observations of people who have witnessed you at your best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Science Behind SARE */}
      <section className="section-spacing bg-gray-50">
        <div className="container-sare">
          <h2 className="heading-lg text-center mb-12">The Science Behind SARE</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="heading-md mb-6 text-primary-teal">Research Foundations</h3>
              <div className="space-y-4">
                <p className="body-md text-gray-600">
                  SARE is grounded in decades of research from positive psychology, strengths-based development, and narrative identity theory. Our methodology draws from the work of leading researchers in human development and organizational psychology.
                </p>
                <p className="body-md text-gray-600">
                  Studies show that people who understand and use their signature strengths experience higher levels of engagement, performance, and well-being. The narrative approach helps individuals construct a coherent sense of identity that guides decision-making and goal-setting.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-coral">Positive Psychology</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Research on human flourishing and optimal functioning forms the foundation of our strengths-based approach.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-coral">Narrative Identity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    The stories we tell about ourselves shape our sense of purpose and guide our future actions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-coral">360-Degree Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Multiple perspectives provide a more complete and accurate picture of your strengths and impact.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How SARE Was Developed */}
      <section className="section-spacing">
        <div className="container-sare">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="heading-lg mb-6">How SARE Was Developed</h2>
            <p className="body-lg text-gray-600">
              The SARE methodology emerged from years of research and practical application in organizational development and personal coaching.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="heading-sm mb-4">Research Phase</h3>
              <p className="text-gray-600">
                Extensive literature review and analysis of existing strengths assessments and narrative approaches to identity development.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="heading-sm mb-4">Pilot Testing</h3>
              <p className="text-gray-600">
                Iterative development through pilot programs with individuals and organizations, refining the process based on feedback and outcomes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="heading-sm mb-4">Validation</h3>
              <p className="text-gray-600">
                Formal validation studies demonstrating the effectiveness of SARE in helping individuals identify and leverage their strengths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The SARE Process */}
      <section className="section-spacing bg-accent-coral text-white">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-8">The SARE Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="heading-sm mb-4">Stories</h3>
              <p className="text-white/90">
                Collect narratives from people who know you well about times when you were at your best.
              </p>
            </div>
            <div>
              <h3 className="heading-sm mb-4">Analyses</h3>
              <p className="text-white/90">
                Examine patterns and themes across the stories to identify recurring strengths.
              </p>
            </div>
            <div>
              <h3 className="heading-sm mb-4">Reports</h3>
              <p className="text-white/90">
                Generate comprehensive insights about your signature strengths and their applications.
              </p>
            </div>
            <div>
              <h3 className="heading-sm mb-4">Evaluations</h3>
              <p className="text-white/90">
                Reflect on findings and create action plans for leveraging your strengths.
              </p>
            </div>
          </div>
          <Button asChild size="lg" variant="outline" className="bg-white text-accent-coral hover:bg-gray-100">
            <Link href="/auth/sign-up">Start Your SARE Journey</Link>
          </Button>
        </div>
      </section>

      {/* Learn More Section */}
      <section className="section-spacing">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-6">Learn More</h2>
          <p className="body-lg mb-8 max-w-3xl mx-auto text-gray-600">
            Explore our research library to dive deeper into the science behind SARE, or get started with your own strengths discovery journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/research">Explore Research</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary-teal hover:bg-primary-teal/90">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}