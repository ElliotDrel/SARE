import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Mail, Lock, Users, User } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type UserType = 'unknown' | 'regular' | 'storyteller';

interface StorytellerInfo {
  id: string;
  name: string;
  email: string;
  auth_user_id: string | null;
  invitation_status: string | null;
  access_method: string | null;
  has_submitted: boolean;
  has_draft: boolean;
  invitation_token?: string;
  token_expires_at?: string;
}

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>('unknown');
  const [storytellerInfo, setStorytellerInfo] = useState<StorytellerInfo | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Redirect to the intended destination or default to /app for authenticated users
      const from = location.state?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Check user type when email is entered (via minimal RPC)
  const checkUserType = async (email: string) => {
    if (!email || email === formData.email) return; // Avoid duplicate checks
    setIsLoading(true);
    try {
      const { data: isStoryteller, error } = await supabase.rpc('is_storyteller_email', {
        target_email: email,
      });
      if (error) {
        console.error('Error checking storyteller via RPC:', error);
        setUserType('regular');
      } else {
        setUserType(isStoryteller ? 'storyteller' : 'regular');
      }
      setStorytellerInfo(null);
      setEmailChecked(true);
    } catch (error) {
      console.error('Error checking user type:', error);
      setUserType('regular');
      setEmailChecked(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMagicLink = async () => {
    setIsLoading(true);
    try {
      // Resolve storyteller id and token server-side with minimal leakage
      const [{ data: storytellerId }, { data: token }] = await Promise.all([
        supabase.rpc('get_storyteller_id_for_email', { target_email: formData.email }),
        // Attempt to get token for current auth user; if not logged in yet, we fallback to email-based flow
        supabase.rpc('get_invitation_token_for_current_user'),
      ]);

      if (!storytellerId && !token) {
        throw new Error('Could not resolve storyteller');
      }

      // Send magic link with minimal metadata
      const inviteToken = token as string | null;
      const redirectTokenQuery = inviteToken ? `&token=${inviteToken}` : '';
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=storyteller_return${redirectTokenQuery}`,
          data: {
            user_type: 'storyteller',
            storyteller_id: storytellerId || undefined,
            invitation_context: 'return_visit',
          },
        },
      });

      if (error) {
        toast({ title: 'Failed to Send Magic Link', description: error.message, variant: 'destructive' });
      } else {
        setMagicLinkSent(true);
        toast({ title: 'Magic Link Sent!', description: 'Check your email and click the link to continue your story.' });
      }
    } catch (error) {
      console.error('Error sending magic link:', error);
      toast({ title: 'An Error Occurred', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If email hasn't been checked yet, check it first
    if (!emailChecked) {
      await checkUserType(formData.email);
      return;
    }

    // Handle based on user type
    if (userType === 'storyteller') {
      await sendMagicLink();
      return;
    }

    // Regular user authentication flow
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back",
          description: "You have successfully signed in.",
        });
        // Redirect to the intended destination or default to /app
        const from = location.state?.from?.pathname || '/app';
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        title: "An Error Occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset states when email changes
    if (name === 'email') {
      setUserType('unknown');
      setEmailChecked(false);
      setStorytellerInfo(null);
      setMagicLinkSent(false);
      
      // Check user type when email has @ and seems complete
      if (value.includes('@') && value.includes('.')) {
        // Debounce the check to avoid excessive API calls
        const timer = setTimeout(() => {
          checkUserType(value);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  };

  // Function to get smart messaging based on user type
  const getSmartMessaging = () => {
    if (!emailChecked || userType === 'unknown') {
      return {
        title: "Welcome Back",
        description: "Enter your email to continue"
      };
    }
    
    if (userType === 'storyteller') {
      const name = storytellerInfo?.name ? ` ${storytellerInfo.name}` : '';
      return {
        title: `Welcome${name}!`,
        description: storytellerInfo?.has_draft 
          ? "We'll send you a link to continue your story"
          : "We'll send you a link to start sharing your story"
      };
    }
    
    return {
      title: "Welcome Back",
      description: "Continue your strengths discovery journey"
    };
  };

  const smartMessaging = getSmartMessaging();

  return (
    <div className="min-h-screen bg-gradient-card">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-elegant border-0">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {userType === 'storyteller' ? (
                    <Users className="w-6 h-6 text-primary mr-2" />
                  ) : (
                    <User className="w-6 h-6 text-primary mr-2" />
                  )}
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {smartMessaging.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-muted-foreground">
                  {smartMessaging.description}
                </CardDescription>
                
                {/* Show storyteller progress indicator */}
                {userType === 'storyteller' && storytellerInfo && (
                  <div className="mt-3 p-2 bg-primary/10 rounded-md">
                    <p className="text-xs text-primary font-medium">
                      {storytellerInfo.has_submitted ? (
                        "✅ Story submitted"
                      ) : storytellerInfo.has_draft ? (
                        "📝 Draft saved - ready to continue"
                      ) : (
                        "🚀 Ready to start your story"
                      )}
                    </p>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {magicLinkSent ? (
                  /* Magic link sent confirmation */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Check Your Email</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      We've sent you a magic link to continue your story. 
                      Click the link in your email to proceed.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setMagicLinkSent(false)}
                      className="w-full"
                    >
                      Send Another Link
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Show password field only for regular users after email is checked */}
                    {emailChecked && userType === 'regular' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="password"
                              name="password"
                              type="password"
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <Link to="/forgot-password" className="text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </>
                    )}

                    <Button 
                      type="submit" 
                      variant="hero" 
                      size="lg" 
                      className="w-full mt-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        emailChecked ? (
                          userType === 'storyteller' ? "Sending Magic Link..." : "Signing In..."
                        ) : "Checking..."
                      ) : (
                        emailChecked ? (
                          userType === 'storyteller' ? "Send Magic Link" : "Sign In"
                        ) : "Continue"
                      )}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}

                {/* Show sign-up link only for regular users or when user type is unknown */}
                {(userType === 'regular' || userType === 'unknown') && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link to="/sign-up" className="text-primary hover:underline">
                        Create one now
                      </Link>
                    </p>
                  </div>
                )}

                {/* Special message for storytellers */}
                {userType === 'storyteller' && !magicLinkSent && (
                  <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      You were invited to share a story. No account creation needed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                New to SARE?{" "}
                <Link to="/about" className="text-primary hover:underline">
                  Learn how it works
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;