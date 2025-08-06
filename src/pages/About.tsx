import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Users, Heart, FileText, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About the <span className="text-transparent bg-gradient-hero bg-clip-text">SARE Method</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Strengths in Action Reflection Experience is a structured approach to understanding 
                your strengths through the eyes of those who know you best, combined with deep 
                self-reflection.
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                How SARE Works
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full text-primary-foreground flex-shrink-0">
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Learn & Prepare</h3>
                      <p className="text-muted-foreground">
                        Begin with guided preparation on who to ask for stories and how to make 
                        effective requests that yield meaningful insights.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full text-primary-foreground flex-shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Collect Stories</h3>
                      <p className="text-muted-foreground">
                        Invite friends, colleagues, family, and mentors to share specific stories 
                        about times they've seen your strengths in action.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full text-primary-foreground flex-shrink-0">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Self Reflection</h3>
                      <p className="text-muted-foreground">
                        Before reading any stories, complete guided self-reflection prompts about 
                        your perceived strengths, evidence, and growth themes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-full text-primary-foreground flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Strengths Report</h3>
                      <p className="text-muted-foreground">
                        Receive a compiled report that shows your self-reflection alongside all 
                        collected stories, revealing patterns and insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why the Sequence Matters */}
            <div className="bg-gradient-card rounded-2xl p-8 mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Why the Sequence Matters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Stories First</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect authentic stories without influence from your own expectations
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Reflect Privately</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture your unbiased self-perception before seeing others' views
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Then Reveal</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover meaningful contrasts and alignments between perspectives
                  </p>
                </div>
              </div>
            </div>

            {/* Who Uses SARE */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                Who Uses SARE
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Individuals",
                    description: "Self-guided journey for personal growth and career development"
                  },
                  {
                    title: "Teams",
                    description: "Facilitated sessions with group planning and shared insights"
                  },
                  {
                    title: "Educators", 
                    description: "Classroom integration with cohort tracking and group reflection"
                  },
                  {
                    title: "Coaches",
                    description: "Certification and resource library for internal facilitators"
                  }
                ].map((useCase, index) => (
                  <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-card">
                    <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Outcomes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
                What to Expect
              </h2>
              
              <div className="space-y-4">
                {[
                  "Clear understanding of your strengths as perceived by others",
                  "Insights into the gap between self-perception and external observation", 
                  "Specific examples of your strengths in action",
                  "A comprehensive report you can reference for growth and applications",
                  "Greater confidence in discussing your strengths with authenticity"
                ].map((outcome, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Research Foundation */}
            <div className="bg-muted rounded-2xl p-8 mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Research Foundation
              </h2>
              <p className="text-muted-foreground mb-6">
                SARE is built on established research in strengths psychology, narrative identity, 
                and reflective practice. The method combines insights from positive psychology 
                with practical storytelling techniques to create meaningful self-discovery.
              </p>
              <Link to="/research">
                <Button variant="outline">
                  Explore the Research
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Discover Your Strengths?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Begin your SARE journey today and uncover the stories that reveal your unique strengths.
              </p>
              <Link to="/sign-up">
                <Button variant="hero" size="lg">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;