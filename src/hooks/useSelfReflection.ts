import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";

type SelfReflection = Database["public"]["Tables"]["self_reflections"]["Row"];
type SelfReflectionInsert = Database["public"]["Tables"]["self_reflections"]["Insert"];
type SelfReflectionUpdate = Database["public"]["Tables"]["self_reflections"]["Update"];

export const useSelfReflection = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["self-reflection", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("self_reflections")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data as SelfReflection | null;
    },
    enabled: !!user,
  });
};

export const useCreateSelfReflection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (reflection: Omit<SelfReflectionInsert, 'user_id'>) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("self_reflections")
        .insert({ ...reflection, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-reflection"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["can-view-stories"] });
    },
  });
};

export const useUpdateSelfReflection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: SelfReflectionUpdate) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("self_reflections")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-reflection"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["can-view-stories"] });
    },
  });
};

export const useCompleteSelfReflection = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Mark reflection as completed
      const { data: reflectionData, error: reflectionError } = await supabase
        .from("self_reflections")
        .update({ completed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (reflectionError) throw reflectionError;
      
      // Update profile to mark reflection as completed and set status to completed
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({ 
          reflection_completed: true,
          collection_status: 'completed'
        })
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      return { reflection: reflectionData, profile: profileData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["self-reflection"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["can-view-stories"] });
    },
  });
};

// Hook to check if self-reflection is unlocked (story goal met)
export const useReflectionUnlockStatus = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["reflection-unlock-status", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Get user's collection goal and current story count
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("collection_goal, collection_status")
        .eq("user_id", user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Get current story count
      const { data: storyCount, error: countError } = await supabase
        .rpc("get_user_story_count", { target_user_id: user.id });
      
      if (countError) throw countError;
      
      const goalMet = storyCount >= (profile.collection_goal || 10);
      const canStartReflection = goalMet && profile.collection_status === 'collecting';
      const isReflecting = profile.collection_status === 'reflecting';
      const isCompleted = profile.collection_status === 'completed';
      
      return {
        goalMet,
        canStartReflection,
        isReflecting,
        isCompleted,
        storyCount,
        collectionGoal: profile.collection_goal || 10,
        currentStatus: profile.collection_status
      };
    },
    enabled: !!user,
  });
};