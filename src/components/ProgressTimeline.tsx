import { CheckCircle, Circle, Users, Lightbulb, Heart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  current: boolean;
}

interface ProgressTimelineProps {
  currentStep: string;
  completedSteps: string[];
}

const ProgressTimeline = ({ currentStep, completedSteps }: ProgressTimelineProps) => {
  const steps: TimelineStep[] = [
    {
      id: "learn",
      title: "Learn & Prepare", 
      description: "Understand who to ask and how",
      icon: Lightbulb,
      completed: completedSteps.includes("learn"),
      current: currentStep === "learn"
    },
    {
      id: "collect",
      title: "Collect Stories",
      description: "Invite people and track responses", 
      icon: Users,
      completed: completedSteps.includes("collect"),
      current: currentStep === "collect"
    },
    {
      id: "reflect",
      title: "Self Reflection",
      description: "Reflect on your strengths",
      icon: Heart,
      completed: completedSteps.includes("reflect"),
      current: currentStep === "reflect"
    },
    {
      id: "report",
      title: "Strengths Report",
      description: "View your compiled insights",
      icon: FileText,
      completed: completedSteps.includes("report"),
      current: currentStep === "report"
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-center w-full md:w-auto">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    step.completed
                      ? "bg-success border-success text-success-foreground"
                      : step.current
                      ? "bg-primary border-primary text-primary-foreground animate-glow"
                      : "bg-background border-border text-muted-foreground"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={cn(
                    "text-sm font-medium",
                    step.completed || step.current ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-24">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className="hidden md:flex flex-1 mx-4">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-all duration-500",
                      step.completed
                        ? "bg-gradient-progress"
                        : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTimeline;