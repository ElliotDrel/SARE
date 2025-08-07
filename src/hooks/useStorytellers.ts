import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Database } from "@/integrations/supabase/types";

type Storyteller = Database["public"]["Tables"]["storytellers"]["Row"];
type StorytellerInsert = Database["public"]["Tables"]["storytellers"]["Insert"];

// Custom error class for storyteller-specific errors
export class StorytellerError extends Error {
  constructor(
    message: string,
    public code: 'DUPLICATE_EMAIL' | 'AUTHENTICATION' | 'UNKNOWN' = 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorytellerError';
  }
}

// Helper function to parse Supabase errors and create appropriate errors
const parseStorytellerError = (error: unknown): StorytellerError => {
  // Type guard for error objects
  const isErrorObject = (err: unknown): err is { code?: string; message?: string } => {
    return typeof err === 'object' && err !== null;
  };
  
  // Check for duplicate email constraint violation
  if (isErrorObject(error) && error.code === '23505' && error.message?.includes('storytellers_user_id_email_key')) {
    return new StorytellerError(
      'A storyteller with this email address already exists in your list.',
      'DUPLICATE_EMAIL'
    );
  }
  
  // Fallback to generic error
  return new StorytellerError(
    isErrorObject(error) && error.message ? error.message : 'An unexpected error occurred while adding the storyteller.',
    'UNKNOWN'
  );
};

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
      if (!user) {
        throw new StorytellerError("User not authenticated", "AUTHENTICATION");
      }
      
      const { data, error } = await supabase
        .from("storytellers")
        .insert({ ...storyteller, user_id: user.id })
        .select()
        .single();
      
      if (error) {
        throw parseStorytellerError(error);
      }
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