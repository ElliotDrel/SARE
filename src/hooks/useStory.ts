import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";
import { useCanViewStories } from "@/hooks/useProfile";

type Story = Database["public"]["Tables"]["stories"]["Row"];
type Storyteller = Database["public"]["Tables"]["storytellers"]["Row"];

export interface StoryWithStoryteller extends Story {
  storytellers: Storyteller;
}

export const useStories = () => {
  const { user } = useAuth();
  const { data: canViewStories } = useCanViewStories();
  
  return useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          storytellers (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false });
      
      if (error) throw error;
      return data as StoryWithStoryteller[];
    },
    enabled: !!user && canViewStories === true,
  });
};

export const useRecentActivity = () => {
  const { user } = useAuth();
  const { data: canViewStories } = useCanViewStories();
  
  return useQuery({
    queryKey: ["recent-activity", user?.id, canViewStories === true],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Get recent story submissions (only when gate allows)
      let recentStories: { id: string; submitted_at: string | null; storytellers?: { name?: string | null; email?: string | null } | null }[] = [];
      if (canViewStories) {
        const { data, error } = await supabase
          .from("stories")
          .select(`
            id,
            submitted_at,
            storytellers (name, email)
          `)
          .eq("user_id", user.id)
          .eq("status", "submitted")
          .order("submitted_at", { ascending: false })
          .limit(5);
        if (error) throw error;
        recentStories = data || [];
      }
      
      // Get recently invited storytellers
      const { data: recentInvites, error: invitesError } = await supabase
        .from("storytellers")
        .select("*")
        .eq("user_id", user.id)
        .not("invited_at", "is", null)
        .order("invited_at", { ascending: false })
        .limit(5);
      
      if (invitesError) throw invitesError;
      
      return {
        recentStories: recentStories || [],
        recentInvites: recentInvites || [],
      };
    },
    enabled: !!user,
  });
};