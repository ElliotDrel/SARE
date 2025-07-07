import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Users, 
  MessageSquare, 
  FileText, 
  ArrowRight,
  Clock,
  Target,
  Lightbulb
} from "lucide-react";

export const metadata = {
  title: "Get Started with SARE - Onboarding",
  description: "Begin your SARE journey with our step-by-step onboarding process."
};

export default function OnboardingIntroPage() {
  const steps = [
    {
      id: 1,
      title: "Choose Storytellers",
      description: "Select people who know you at your best",
      icon: Users,
      duration: "5 minutes",
      active: false
    },
    {
      id: 2,
      title: "Collect Stories",
      description: "Send invitations and gather meaningful stories",
      icon: MessageSquare,
      duration: "1-2 weeks",
      active: false
    },
    {
      id: 3,
      title: "Self Reflection",
      description: "Complete your personal reflections",
      icon: FileText,
      duration: "30 minutes",
      active: false
    },
    {
      id: 4,
      title: "Generate Report",
      description: "Create your comprehensive SARE report",
      icon: FileText,
      duration: "Instant",
      active: false
    }
  ];

  return (
    <div className="container-sare section-spacing">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="heading-xl text-primary-teal mb-4">
          Welcome to Your SARE Journey
        </h1>
        <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
          Discover your signature strengths through stories from people who know you at your best. 
          This guided process will help you uncover insights about yourself and create a comprehensive report.
        </p>
      </div>

      {/* Timeline Section */}
      <div className="mb-12">
        <h2 className="heading-lg text-primary-teal text-center mb-8">
          Your 4-Step Journey
        </h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200 hidden md:block" />
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center">
                  <div className={`flex-1 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 order-2'}`}>
                    <Card className="border-primary-teal/20 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-primary-teal">
                          <step.icon className="h-5 w-5" />
                          {step.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-accent-coral">
                          <Clock className="h-4 w-4" />
                          {step.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Timeline Circle */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-teal rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    {step.id}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <Card className="border-primary-teal/20 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-primary-teal">
                        <div className="w-6 h-6 bg-primary-teal rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {step.id}
                        </div>
                        {step.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-accent-coral">
                        <Clock className="h-4 w-4" />
                        {step.duration}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="border-primary-teal/20 text-center">
          <CardHeader>
            <Target className="h-8 w-8 text-primary-teal mx-auto mb-2" />
            <CardTitle className="text-primary-teal">Discover Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Uncover your signature strengths through stories from people who have seen you at your best.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary-teal/20 text-center">
          <CardHeader>
            <Lightbulb className="h-8 w-8 text-primary-teal mx-auto mb-2" />
            <CardTitle className="text-primary-teal">Gain Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reflect on patterns and themes that emerge from your collected stories and personal reflections.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary-teal/20 text-center">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary-teal mx-auto mb-2" />
            <CardTitle className="text-primary-teal">Create Your Report</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate a comprehensive report that captures your strengths, stories, and personal insights.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What to Expect */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="heading-md text-primary-teal mb-4">What to Expect</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Step 1:</strong> Choose 3-10 people who know you well and have seen you at your best
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Step 2:</strong> Send them personalized invitations to share stories about your strengths
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Step 3:</strong> Complete your own self-reflection while stories are being collected
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong>Step 4:</strong> Generate your comprehensive SARE report with insights and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h3 className="heading-md text-primary-teal mb-4">Ready to Begin?</h3>
        <p className="body-md text-muted-foreground mb-6">
          The entire process takes about 30 minutes of your time, plus 1-2 weeks for story collection.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-accent-coral hover:bg-accent-coral/90 px-8"
        >
          <Link href="/protected/onboarding/storytellers">
            Start Your Journey
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}