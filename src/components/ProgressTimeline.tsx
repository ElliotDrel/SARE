import React from "react";
import { CheckCircle, Circle, Users, Lightbulb, Heart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  completed: boolean;
  current: boolean;
}

interface ProgressTimelineProps {
  currentStep: string;
  completedSteps: string[];
}

const ProgressTimeline = ({ currentStep, completedSteps }: ProgressTimelineProps) => {
  const navigate = useNavigate();
  
  // Step to route mapping
  const stepRoutes = {
    learn: '/app/learn_prepare',
    collect: '/app/invite_track', 
    reflect: '/app/self_reflection',
    report: '/app/report'
  };
  
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

  // Determine if a step is clickable
  const isStepClickable = (step: TimelineStep) => {
    // Current step and completed steps are always clickable
    return step.completed || step.current;
  };

  // Handle step navigation
  const handleStepClick = (step: TimelineStep) => {
    if (isStepClickable(step) && stepRoutes[step.id as keyof typeof stepRoutes]) {
      navigate(stepRoutes[step.id as keyof typeof stepRoutes]);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, step: TimelineStep) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStepClick(step);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          const clickable = isStepClickable(step);
          
          return (
            <div key={step.id} className="flex items-center w-full md:w-auto">
              <div 
                className={cn(
                  "flex flex-col items-center",
                  clickable && "cursor-pointer group"
                )}
                onClick={() => handleStepClick(step)}
                onKeyDown={(e) => handleKeyDown(e, step)}
                tabIndex={clickable ? 0 : -1}
                role={clickable ? "button" : undefined}
                aria-label={clickable ? `Go to ${step.title}` : step.title}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    step.completed
                      ? "bg-success border-success text-success-foreground"
                      : step.current
                      ? "bg-primary border-primary text-primary-foreground animate-glow"
                      : "bg-background border-border text-muted-foreground",
                    clickable && "group-hover:scale-105 group-hover:shadow-md group-focus:scale-105 group-focus:shadow-md"
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
                    "text-sm font-medium transition-colors duration-300",
                    step.completed || step.current ? "text-foreground" : "text-muted-foreground",
                    clickable && "group-hover:text-primary group-focus:text-primary"
                  )}>
                    {step.title}
                  </p>
                  <p className={cn(
                    "text-xs mt-1 max-w-24 transition-colors duration-300",
                    "text-muted-foreground",
                    clickable && "group-hover:text-foreground group-focus:text-foreground"
                  )}>
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