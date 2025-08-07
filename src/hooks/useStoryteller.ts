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

// Hook to get storyteller by invitation token
export const useStorytellerByToken = (token: string | null) => {
  return useQuery({
    queryKey: ["storyteller-by-token", token],
    queryFn: async () => {
      if (!token) return null;
      
      // First get storyteller data
      const { data: storytellerData, error: storytellerError } = await supabase
        .from("storytellers")
        .select("*")
        .eq("invitation_token", token)
        .gt("token_expires_at", new Date().toISOString())
        .single();
      
      if (storytellerError) throw storytellerError;
      
      // Then get the profile data for the story requester
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name")
        .eq("user_id", storytellerData.user_id)
        .single();
      
      // Combine the data (don't throw error if profile fetch fails)
      const data = {
        ...storytellerData,
        profiles: profileError ? null : profileData
      };
      
      return data;
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

// Hook to get story draft for storyteller
export const useStoryDraft = (storytellerId: string | null) => {
  return useQuery({
    queryKey: ["story-draft", storytellerId],
    queryFn: async () => {
      if (!storytellerId) return null;
      
      const { data, error } = await supabase
        .from("story_drafts")
        .select("*")
        .eq("storyteller_id", storytellerId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    },
    enabled: !!storytellerId,
  });
};

// Hook to get submitted story for storyteller
export const useSubmittedStory = (storytellerId: string | null) => {
  return useQuery({
    queryKey: ["submitted-story", storytellerId],
    queryFn: async () => {
      if (!storytellerId) return null;
      
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("storyteller_id", storytellerId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    },
    enabled: !!storytellerId,
  });
};

// Hook to create or update story draft
export const useStoryDraftMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      storytellerId, 
      draftData,
      isUpdate = false 
    }: { 
      storytellerId: string; 
      draftData: Omit<StoryDraftInsert, 'storyteller_id'>;
      isUpdate?: boolean;
    }) => {
      if (isUpdate) {
        const { data, error } = await supabase
          .from("story_drafts")
          .update(draftData as StoryDraftUpdate)
          .eq("storyteller_id", storytellerId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("story_drafts")
          .upsert({ 
            ...draftData, 
            storyteller_id: storytellerId 
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["story-draft", variables.storytellerId] });
    },
  });
};

// Hook to submit final story
export const useSubmitStory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      storytellerId,
      userId,
      storyData,
    }: {
      storytellerId: string;
      userId: string;
      storyData: Pick<StoryInsert, 'story_one' | 'story_two' | 'story_three'>;
    }) => {
      // Create the final story
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          ...storyData,
          storyteller_id: storytellerId,
          user_id: userId,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (storyError) throw storyError;
      
      // Update storyteller invitation status
      const { error: storytellerError } = await supabase
        .from("storytellers")
        .update({ invitation_status: 'submitted' })
        .eq("id", storytellerId);
      
      if (storytellerError) throw storytellerError;
      
      // Delete the draft since story is now submitted
      await supabase
        .from("story_drafts")
        .delete()
        .eq("storyteller_id", storytellerId);
      
      return story;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["story-draft", variables.storytellerId] });
      queryClient.invalidateQueries({ queryKey: ["submitted-story", variables.storytellerId] });
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
  storytellerId: string | null,
  draftData: { story_one: string; story_two: string; story_three: string; notes?: string },
  enabled: boolean = true
) => {
  const draftMutation = useStoryDraftMutation();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!enabled || !storytellerId) return;

    const timeoutId = setTimeout(async () => {
      // Only auto-save if there's some content
      if (draftData.story_one.trim() || draftData.story_two.trim() || draftData.story_three.trim()) {
        setIsSaving(true);
        try {
          await draftMutation.mutateAsync({
            storytellerId,
            draftData: {
              ...draftData,
              auto_saved_at: new Date().toISOString()
            },
            isUpdate: false // Use upsert
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
  }, [draftData, storytellerId, enabled, draftMutation]);

  return { lastSaved, isSaving };
};