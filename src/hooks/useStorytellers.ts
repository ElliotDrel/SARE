import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";

type Storyteller = Database["public"]["Tables"]["storytellers"]["Row"];
type StorytellerInsert = Database["public"]["Tables"]["storytellers"]["Insert"];

export const useStorytellers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["storytellers", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("storytellers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Storyteller[];
    },
    enabled: !!user,
  });
};

export const useAddStoryteller = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (storyteller: Omit<StorytellerInsert, "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("storytellers")
        .insert({ ...storyteller, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    },
  });
};

export const useUpdateStoryteller = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Storyteller> }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("storytellers")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storytellers"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    },
  });
};