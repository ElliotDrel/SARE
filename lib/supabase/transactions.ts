// Database transaction utilities for SARE Platform
// Provides atomic operations and rollback capabilities for multi-step database operations

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleDatabaseError, type DatabaseError } from "./database";

export interface TransactionResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

export interface TransactionOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

/**
 * Executes a function within a database transaction context
 * Note: Supabase doesn't have native transaction support, so this implements
 * a compensation pattern with rollback strategies
 */
export async function withTransaction<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  rollbackOperations: ((client: SupabaseClient) => Promise<void>)[] = [],
  options: TransactionOptions = {}
): Promise<TransactionResult<T>> {
  const {
    maxRetries = 3,
    retryDelayMs = 1000,
    timeoutMs = 30000
  } = options;

  const supabase = await createClient();
  let result: T | null = null;
  let lastError: unknown = null;

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Transaction timeout')), timeoutMs);
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Execute the main operation with timeout
      result = await Promise.race([
        operation(supabase),
        timeoutPromise
      ]) as T;

      // If we get here, the operation succeeded
      return { data: result, error: null };
    } catch (error) {
      lastError = error;
      
      // Check if this is a retryable error
      if (!isRetryableError(error) || attempt === maxRetries - 1) {
        // Execute rollback operations in reverse order
        await executeRollback(supabase, rollbackOperations);
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * (attempt + 1)));
    }
  }

  return { data: null, error: handleDatabaseError(lastError) };
}

/**
 * Executes rollback operations when a transaction fails
 */
async function executeRollback(
  client: SupabaseClient,
  rollbackOperations: ((client: SupabaseClient) => Promise<void>)[]
): Promise<void> {
  // Execute rollback operations in reverse order
  for (let i = rollbackOperations.length - 1; i >= 0; i--) {
    try {
      await rollbackOperations[i](client);
    } catch (rollbackError) {
      // Log rollback errors but don't throw - we're already in error state
      console.error('Rollback operation failed:', rollbackError);
    }
  }
}

/**
 * Determines if an error is retryable (temporary network issues, etc.)
 */
function isRetryableError(error: unknown): boolean {
  const errorObj = error as Record<string, unknown>;
  const code = errorObj.code as string;
  const message = (errorObj.message as string) || '';

  // Temporary network errors
  if (message.includes('network') || message.includes('timeout')) {
    return true;
  }

  // Specific database error codes that are retryable
  const retryableCodes = [
    '08000', // Connection exception
    '08003', // Connection does not exist
    '08006', // Connection failure
    '57014', // Query canceled
    '40001', // Serialization failure
  ];

  return retryableCodes.includes(code);
}

/**
 * Specific transaction patterns for common operations
 */

/**
 * Atomic storyteller signup with user creation and linking
 */
export async function storytellerSignupTransaction(
  email: string,
  password: string,
  storytellerId: string,
  origin: string
): Promise<TransactionResult<{ user: any; storyteller: any }>> {
  const rollbackOperations: ((client: SupabaseClient) => Promise<void>)[] = [];

  return withTransaction(
    async (client) => {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Add rollback for user creation (if needed)
      rollbackOperations.push(async (client) => {
        // Note: Supabase doesn't allow direct user deletion from client
        // This would need to be handled by admin API or manual cleanup
        console.warn('User created but transaction failed, manual cleanup may be needed:', authData.user!.id);
      });

      // 2. Link storyteller to user
      const { data: storyteller, error: updateError } = await client
        .from('storytellers')
        .update({
          storyteller_user_id: authData.user.id,
          invite_token: null, // Clear the token
        })
        .eq('id', storytellerId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Add rollback for storyteller linking
      rollbackOperations.push(async (client) => {
        await client
          .from('storytellers')
          .update({
            storyteller_user_id: null,
            invite_token: storyteller.invite_token, // Restore original token
          })
          .eq('id', storytellerId);
      });

      return { user: authData.user, storyteller };
    },
    rollbackOperations
  );
}

/**
 * Atomic story creation with validation
 */
export async function storyCreationTransaction(
  storyData: {
    storyteller_id: string;
    user_id: string;
    story_part_1: string;
    story_part_2?: string | null;
    story_part_3?: string | null;
  }
): Promise<TransactionResult<any>> {
  return withTransaction(
    async (client) => {
      // 1. Verify storyteller exists and is linked to correct user
      const { data: storyteller, error: storytellerError } = await client
        .from('storytellers')
        .select('id, user_id')
        .eq('id', storyData.storyteller_id)
        .single();

      if (storytellerError) {
        throw storytellerError;
      }

      if (storyteller.user_id !== storyData.user_id) {
        throw new Error('Storyteller does not belong to this user');
      }

      // 2. Check for existing story from this storyteller
      const { data: existingStory, error: checkError } = await client
        .from('stories')
        .select('id')
        .eq('storyteller_id', storyData.storyteller_id)
        .eq('user_id', storyData.user_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingStory) {
        throw new Error('Story already exists for this storyteller');
      }

      // 3. Create the story
      const { data: story, error: createError } = await client
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      return story;
    },
    [] // No rollback needed for story creation - it's a single operation
  );
}

/**
 * Batch operation for multiple storyteller invitations
 */
export async function batchStorytellerInvitationTransaction(
  storytellers: Array<{
    user_id: string;
    name: string;
    email: string;
    invite_token: string;
  }>
): Promise<TransactionResult<any[]>> {
  const rollbackOperations: ((client: SupabaseClient) => Promise<void>)[] = [];
  const createdIds: string[] = [];

  return withTransaction(
    async (client) => {
      const results = [];

      for (const storyteller of storytellers) {
        const { data, error } = await client
          .from('storytellers')
          .insert(storyteller)
          .select()
          .single();

        if (error) {
          throw error;
        }

        createdIds.push(data.id);
        results.push(data);

        // Add rollback for each created storyteller
        rollbackOperations.push(async (client) => {
          await client
            .from('storytellers')
            .delete()
            .eq('id', data.id);
        });
      }

      return results;
    },
    rollbackOperations
  );
}

/**
 * Utility for handling database migrations or schema changes
 */
export async function migrationTransaction(
  operations: ((client: SupabaseClient) => Promise<void>)[]
): Promise<TransactionResult<void>> {
  return withTransaction(
    async (client) => {
      for (const operation of operations) {
        await operation(client);
      }
    },
    [] // Migrations typically don't have rollback operations
  );
}

export { handleDatabaseError } from "./database";