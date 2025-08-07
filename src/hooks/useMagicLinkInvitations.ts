import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";

interface SendInvitationParams {
  storytellerId: string;
  storytellerEmail: string;
  storytellerName: string;
}

// Hook to send magic link invitation to storyteller
export const useSendStorytellerInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ storytellerId, storytellerEmail, storytellerName }: SendInvitationParams) => {
      if (!user || !profile) throw new Error("User not authenticated");

      // First, update storyteller with fresh token and sent timestamp
      const { data: storyteller, error: updateError } = await supabase
        .from("storytellers")
        .update({
          invitation_token: crypto.randomUUID(), // Generate fresh token
          token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          magic_link_sent_at: new Date().toISOString(),
          invitation_status: 'sent',
          access_method: 'magic_link'
        })
        .eq("id", storytellerId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Get user's display name for email context
      const inviterName = profile.display_name || 
                          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                          'Someone';

      // Send magic link with custom redirect and metadata
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: storytellerEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/storyteller/welcome?token=${storyteller.invitation_token}`,
          data: {
            user_type: 'storyteller',
            storyteller_id: storytellerId,
            storyteller_name: storytellerName,
            inviter_name: inviterName,
            invitation_token: storyteller.invitation_token,
            invitation_context: 'story_request'
          }
        }
      });

      if (authError) throw authError;

      return storyteller;
    },
    onSuccess: () => {
      // Invalidate storytellers query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
    },
  });
};

// Hook to send reminder magic link
export const useSendStorytellerReminder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ storytellerId, storytellerEmail, storytellerName }: SendInvitationParams) => {
      if (!user || !profile) throw new Error("User not authenticated");

      // Increment reminder count
      const { error: incrementError } = await supabase.rpc('increment_reminder_count', { 
        storyteller_id: storytellerId 
      });
      if (incrementError) throw incrementError;

      // Update storyteller reminder info
      const { data: storyteller, error: updateError } = await supabase
        .from("storytellers")
        .update({
          last_contacted_at: new Date().toISOString(),
          invitation_status: 'reminded'
        })
        .eq("id", storytellerId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Get user's display name for email context
      const inviterName = profile.display_name || 
                          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                          'Someone';

      // Send reminder magic link
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: storytellerEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/storyteller/welcome?token=${storyteller.invitation_token}`,
          data: {
            user_type: 'storyteller',
            storyteller_id: storytellerId,
            storyteller_name: storytellerName,
            inviter_name: inviterName,
            invitation_token: storyteller.invitation_token,
            invitation_context: 'story_reminder',
            is_reminder: true
          }
        }
      });

      if (authError) throw authError;

      return storyteller;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
    },
  });
};

// Hook to bulk send invitations
export const useBulkSendInvitations = () => {
  const sendInvitation = useSendStorytellerInvitation();
  
  return useMutation({
    mutationFn: async (storytellers: SendInvitationParams[]) => {
      const results = [];
      
      // Send invitations sequentially to avoid rate limits
      for (const storyteller of storytellers) {
        try {
          const result = await sendInvitation.mutateAsync(storyteller);
          results.push({ success: true, storyteller, result });
        } catch (error) {
          results.push({ success: false, storyteller, error });
        }
        
        // Brief delay between sends to be respectful to email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return results;
    }
  });
};

// Hook to track invitation opens (called when storyteller accesses welcome page)
export const useTrackInvitationOpen = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storytellerId: string) => {
      const { data, error } = await supabase
        .from("storytellers")
        .update({
          invitation_status: 'opened',
          first_access_at: new Date().toISOString()
        })
        .eq("id", storytellerId)
        .eq("invitation_status", "sent") // Only update if currently "sent"
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
    },
  });
};

// Helper function to get invitation status color/variant
export const getInvitationStatusDisplay = (status: string | null, lastContacted?: string | null) => {
  switch (status) {
    case 'pending':
      return { 
        variant: 'secondary' as const, 
        color: 'text-gray-600', 
        label: 'Not Sent',
        description: 'Invitation not yet sent'
      };
    case 'sent': {
      const daysSinceSent = lastContacted ? 
        Math.floor((Date.now() - new Date(lastContacted).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return { 
        variant: 'outline' as const, 
        color: 'text-blue-600', 
        label: 'Sent',
        description: daysSinceSent > 0 ? `${daysSinceSent} days ago` : 'Today'
      };
    }
    case 'reminded':
      return { 
        variant: 'outline' as const, 
        color: 'text-amber-600', 
        label: 'Reminded',
        description: 'Follow-up sent'
      };
    case 'opened':
      return { 
        variant: 'outline' as const, 
        color: 'text-green-600', 
        label: 'Opened',
        description: 'Clicked the link'
      };
    case 'submitted':
      return { 
        variant: 'default' as const, 
        color: 'text-green-700', 
        label: 'Completed',
        description: 'Story submitted'
      };
    default:
      return { 
        variant: 'secondary' as const, 
        color: 'text-gray-600', 
        label: 'Unknown',
        description: 'Status unclear'
      };
  }
};