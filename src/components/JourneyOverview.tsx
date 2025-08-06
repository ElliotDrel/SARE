import { ArrowRight, Lightbulb, Users, Heart, FileText } from "lucide-react";

const JourneyOverview = () => {
  const steps = [
    {
      icon: Lightbulb,
      title: "Learn & Prepare",
      description: "Discover who to ask and how to request meaningful stories about your strengths"
    },
    {
      icon: Users, 
      title: "Collect Stories",
      description: "Invite people who know you well to share specific examples of your strengths in action"
    },
    {
      icon: Heart,
      title: "Self Reflection", 
      description: "Reflect on your own view of your strengths before seeing what others shared"
    },
    {
      icon: FileText,
      title: "Strengths Report",
      description: "Receive a personalized report combining your reflection with collected stories"
    }
  ];

  return (
    <section className="py-16 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Your Journey to Understanding Your Strengths
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SARE guides you through a structured process of collecting stories first, 
            reflecting on your strengths, then revealing insights from those who know you best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full text-primary-foreground mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 max-w-3xl mx-auto">
            <p className="text-foreground font-medium mb-2">
              The key insight: Stories first, reflection second, then reveal
            </p>
            <p className="text-muted-foreground text-sm">
              This sequence protects the integrity of your self-reflection and creates 
              meaningful contrast between your self-perception and others' observations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyOverview;