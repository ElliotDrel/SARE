import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth token from URL hash or search params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/sign-in");
          return;
        }

        if (data.session?.user) {
          // Check if this is a storyteller authentication
          const userType = data.session.user.user_metadata?.user_type;
          const storytellerId = data.session.user.user_metadata?.storyteller_id;
          const invitationToken = data.session.user.user_metadata?.invitation_token;
          const callbackType = searchParams.get('type');
          const tokenFromUrl = searchParams.get('token');
          
            if (userType === 'storyteller' || callbackType?.includes('storyteller')) {
            // Update storyteller with auth user ID  
            const storytellerIdToUse = storytellerId;
            if (storytellerIdToUse) {
              await supabase.rpc('update_storyteller_access', {
                storyteller_id: storytellerIdToUse,
                auth_user_id: data.session.user.id
              });
            }
            
            // Use token from URL or metadata
            let tokenToUse = tokenFromUrl || invitationToken;
            if (!tokenToUse) {
              // Attempt to resolve token based on current user via RPC
              const { data: resolvedToken } = await supabase.rpc('get_invitation_token_for_current_user');
              if (resolvedToken) tokenToUse = resolvedToken as unknown as string;
            }
            
            // Redirect to appropriate storyteller page based on context
              if (tokenToUse) {
                // Prefer RPCs that validate token + expiry and avoid table access from anon
                const { data: submittedStory } = await supabase.rpc('get_submitted_story_by_token', { token: tokenToUse });
                if (submittedStory) {
                  navigate(`/storyteller/thank-you?token=${tokenToUse}`);
                  return;
                }
                const { data: draft } = await supabase.rpc('get_story_draft_by_token', { token: tokenToUse });
                if (draft) {
                  navigate(`/storyteller/write?token=${tokenToUse}`);
                } else {
                  navigate(`/storyteller/welcome?token=${tokenToUse}`);
                }
              } else {
              // No token - redirect to welcome with basic flow
              navigate('/storyteller/welcome');
            }
          } else {
            // Regular user - redirect to dashboard
            navigate("/app");
          }
        } else {
          // No session - redirect to sign in
          navigate("/sign-in");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/sign-in");
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium mb-2">Completing sign-in...</p>
        <p className="text-sm text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;