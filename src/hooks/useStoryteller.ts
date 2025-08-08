import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";
import { useEffect, useState } from "react";

type Storyteller = Database["public"]["Tables"]["storytellers"]["Row"];
type StoryDraft = Database["public"]["Tables"]["story_drafts"]["Row"];
type StoryDraftInsert = Database["public"]["Tables"]["story_drafts"]["Insert"];
type StoryDraftUpdate = Database["public"]["Tables"]["story_drafts"]["Update"];
type Story = Database["public"]["Tables"]["stories"]["Row"];
type StoryInsert = Database["public"]["Tables"]["stories"]["Insert"];
type StorytellerByToken = Database["public"]["Functions"]["storyteller_by_token"]["Returns"][number];

// Hook to get storyteller by invitation token (via SECURITY DEFINER RPC)
export const useStorytellerByToken = (token: string | null) => {
  return useQuery({
    queryKey: ["storyteller-by-token", token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase.rpc('storyteller_by_token', { token });
      if (error) throw error;
      // Returns 0-1 rows as an array
      const row = Array.isArray(data) ? (data[0] as StorytellerByToken | undefined) : undefined;
      return row ?? null;
    },
    enabled: !!token,
  });
};

// Hook to get current storyteller (authenticated)
export const useCurrentStoryteller = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["current-storyteller", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get storyteller data for authenticated user
      const { data: storytellerData, error: storytellerError } = await supabase
        .from("storytellers")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();
      
      if (storytellerError && storytellerError.code !== 'PGRST116') throw storytellerError;
      if (!storytellerData) return null;
      
      // Get the profile data for the story requester
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name")
        .eq("user_id", storytellerData.user_id)
        .single();
      
      // Combine the data
      const data = {
        ...storytellerData,
        profiles: profileError ? null : profileData
      };
      
      return data;
    },
    enabled: !!user,
  });
};

// Hook to get story draft for storyteller (via token RPC)
export const useStoryDraft = (token: string | null) => {
  return useQuery({
    queryKey: ["story-draft", token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase.rpc('get_story_draft_by_token', { token });
      if (error) throw error;
      return (data as StoryDraft | null);
    },
    enabled: !!token,
  });
};

// Hook to get submitted story for storyteller (via token RPC)
export const useSubmittedStory = (token: string | null) => {
  return useQuery({
    queryKey: ["submitted-story", token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase.rpc('get_submitted_story_by_token', { token });
      if (error) throw error;
      return (data as Story | null);
    },
    enabled: !!token,
  });
};

// Hook to create or update story draft
export const useStoryDraftMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      token,
      draftData
    }: { 
      token: string;
      draftData: Omit<StoryDraftInsert, 'storyteller_id'>;
    }) => {
      const { data, error } = await supabase.rpc('upsert_story_draft_by_token', {
        token,
        p_story_one: draftData.story_one ?? null,
        p_story_two: draftData.story_two ?? null,
        p_story_three: draftData.story_three ?? null,
        p_notes: draftData.notes ?? null,
      });
      if (error) throw error;
      return (data as StoryDraft | null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["story-draft", variables.token] });
    },
  });
};

// Hook to submit final story
export const useSubmitStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      token,
      storyData,
    }: {
      token: string;
      storyData: Pick<StoryInsert, 'story_one' | 'story_two' | 'story_three'>;
    }) => {
      const { data, error } = await supabase.rpc('submit_story_by_token', {
        token,
        p_story_one: storyData.story_one ?? null,
        p_story_two: storyData.story_two ?? null,
        p_story_three: storyData.story_three ?? null,
      });
      if (error) throw error;
      return (data as Story | null);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["story-draft", variables.token] });
      queryClient.invalidateQueries({ queryKey: ["submitted-story", variables.token] });
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
    },
  });
};

// Hook to update storyteller access tracking
export const useUpdateStorytellerAccess = () => {
  return useMutation({
    mutationFn: async ({ storytellerId, authUserId }: { storytellerId: string; authUserId?: string }) => {
      const { error } = await supabase.rpc('update_storyteller_access', {
        storyteller_id: storytellerId,
        auth_user_id: authUserId
      });
      
      if (error) throw error;
    },
  });
};

// Auto-save hook for story drafts
export const useAutoSaveStoryDraft = (
  token: string | null,
  draftData: { story_one: string; story_two: string; story_three: string; notes?: string },
  enabled: boolean = true
) => {
  const draftMutation = useStoryDraftMutation();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !token) return;

    const timeoutId = setTimeout(async () => {
      // Only auto-save if there's some content
      if (draftData.story_one.trim() || draftData.story_two.trim() || draftData.story_three.trim()) {
        setIsSaving(true);
        try {
          await draftMutation.mutateAsync({
            token,
            draftData: {
              ...draftData,
              auto_saved_at: new Date().toISOString()
            },
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearTimeout(timeoutId);
  }, [draftData, token, enabled, draftMutation]);

  return { lastSaved, isSaving };
};