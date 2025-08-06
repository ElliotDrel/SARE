import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Users, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import JourneyOverview from "@/components/JourneyOverview";
import heroImage from "@/assets/hero-stories.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Discover Your Strengths Through
                  <span className="text-transparent bg-gradient-hero bg-clip-text"> Stories</span>
                </h1>
                <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                  SARE helps you collect meaningful stories from people who know you, 
                  reflect on your strengths, and receive insights that guide your growth.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="gentle" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Invite storytellers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Reflect privately</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Get insights</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl transform rotate-3"></div>
              <img
                src={heroImage}
                alt="People sharing stories in a circle"
                className="relative z-10 w-full h-auto rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Journey Overview */}
      <JourneyOverview />

      {/* Why SARE Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Stories First, Then Reflection?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The sequence matters. By reflecting on your strengths before seeing others' stories, 
              you preserve the integrity of your self-perception and create meaningful insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Unbiased Self-Reflection",
                description: "Your private reflection happens before you read any stories, ensuring authentic self-awareness."
              },
              {
                title: "Rich Story Collection", 
                description: "People who know you share specific examples of your strengths in action."
              },
              {
                title: "Meaningful Contrast",
                description: "See the beautiful alignment and surprising differences between your view and others'."
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-elegant transition-all duration-300">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Begin Your Strengths Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start by learning who to ask and how to request stories. 
            Your reflection and insights are just a few steps away.
          </p>
          <Link to="/sign-up">
            <Button variant="hero" size="lg">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
