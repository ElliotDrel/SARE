import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import Dashboard from "./pages/Dashboard";
import LearnPrepare from "./pages/LearnPrepare";
import InviteTrack from "./pages/InviteTrack";
import SelfReflection from "./pages/SelfReflection";
import StorytellerWelcome from "./pages/storyteller/StorytellerWelcome";
import StorytellerWrite from "./pages/storyteller/StorytellerWrite";
import StorytellerThankYou from "./pages/storyteller/StorytellerThankYou";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          
          {/* Auth Callback Route */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Storyteller Portal Routes */}
          <Route path="/storyteller/welcome" element={<StorytellerWelcome />} />
          <Route path="/storyteller/write" element={<StorytellerWrite />} />
          <Route path="/storyteller/thank-you" element={<StorytellerThankYou />} />
          
          {/* Protected Authenticated Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="learn_prepare" element={<LearnPrepare />} />
            <Route path="invite_track" element={<InviteTrack />} />
            <Route path="self_reflection" element={<SelfReflection />} />
            {/* <Route path="report" element={<Report />} /> */}
            {/* <Route path="notifications" element={<Notifications />} /> */}
            {/* <Route path="profile" element={<Profile />} /> */}
          </Route>
          
          {/* Catch-all route must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
