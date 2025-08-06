import { Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useStoryCount } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import ProgressTimeline from "./ProgressTimeline";

const AuthenticatedLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { data: profile } = useProfile();
  const { data: storyCount = 0 } = useStoryCount();

  // Determine current step based on route
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.includes("/learn_prepare")) return "learn";
    if (path.includes("/invite_track")) return "collect";
    if (path.includes("/self_reflection")) return "reflect";
    if (path.includes("/report")) return "report";
    return "learn"; // Default to first step for dashboard
  };

  // Determine completed steps based on user progress
  const getCompletedSteps = () => {
    const completed: string[] = [];
    
    // Mark learn step complete if user has moved beyond preparation stage
    if (profile?.collection_status !== 'preparing') {
      completed.push('learn');
    }
    
    // Mark collect step complete if user has reached their story goal
    const collectionGoal = profile?.collection_goal ?? 10;
    if (storyCount >= collectionGoal) {
      completed.push('collect');
    }
    
    // Mark reflect step complete if user has completed reflection
    if (profile?.reflection_completed) {
      completed.push('reflect');
    }
    
    // Mark report step complete if both reflection and collection are done
    if (profile?.reflection_completed && storyCount >= collectionGoal) {
      completed.push('report');
    }
    
    return completed;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name[0]}${user.user_metadata.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || "User";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/app" className="text-2xl font-bold text-primary">
                SARE
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getUserName()}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border my-1" />
                  <DropdownMenuItem asChild>
                    <Link to="/app/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProgressTimeline 
          currentStep={getCurrentStep()}
          completedSteps={getCompletedSteps()}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthenticatedLayout;