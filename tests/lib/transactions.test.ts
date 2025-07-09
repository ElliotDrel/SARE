import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  withTransaction, 
  storytellerSignupTransaction, 
  storyCreationTransaction 
} from '@/lib/supabase/transactions';
import { mockSupabaseClient, createMockStoryteller, createMockUser } from '../utils';

describe('Transaction Utilities', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = mockSupabaseClient();
  });

  describe('withTransaction', () => {
    it('should execute operation successfully', async () => {
      const operation = vi.fn(() => Promise.resolve('success'));
      const result = await withTransaction(operation);
      
      expect(result.data).toBe('success');
      expect(result.error).toBeNull();
      expect(operation).toHaveBeenCalledWith(mockClient);
    });

    it('should handle operation failure', async () => {
      const operation = vi.fn(() => Promise.reject(new Error('Operation failed')));
      const result = await withTransaction(operation);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('Operation failed');
    });

    it('should execute rollback operations on failure', async () => {
      const operation = vi.fn(() => Promise.reject(new Error('Operation failed')));
      const rollback1 = vi.fn();
      const rollback2 = vi.fn();
      
      await withTransaction(operation, [rollback1, rollback2]);
      
      expect(rollback2).toHaveBeenCalledWith(mockClient); // Rollbacks execute in reverse order
      expect(rollback1).toHaveBeenCalledWith(mockClient);
    });

    it('should retry retryable errors', async () => {
      let callCount = 0;
      const operation = vi.fn(() => {
        callCount++;
        if (callCount < 3) {
          throw { code: '08000', message: 'Connection exception' };
        }
        return Promise.resolve('success');
      });

      const result = await withTransaction(operation, [], { maxRetries: 3 });
      
      expect(result.data).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = vi.fn(() => 
        Promise.reject({ code: '23505', message: 'Duplicate key' })
      );

      const result = await withTransaction(operation, [], { maxRetries: 3 });
      
      expect(result.data).toBeNull();
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout', async () => {
      const operation = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );

      const result = await withTransaction(operation, [], { timeoutMs: 100 });
      
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Transaction timeout');
    });
  });

  describe('storytellerSignupTransaction', () => {
    it('should create user and link storyteller successfully', async () => {
      const storyteller = createMockStoryteller({ 
        id: 'storyteller-id',
        storyteller_user_id: null,
        invite_token: 'original-token' 
      });
      
      mockClient.seedData({
        storytellers: [storyteller],
        users: [],
      });

      const result = await storytellerSignupTransaction(
        'test@example.com',
        'password123',
        'storyteller-id',
        'http://localhost:3000'
      );

      expect(result.data).toBeTruthy();
      expect(result.data?.user).toBeTruthy();
      expect(result.data?.storyteller).toBeTruthy();
      expect(result.error).toBeNull();
    });

    it('should handle auth signup failure', async () => {
      // Mock auth.signUp to fail
      mockClient.auth.signUp = vi.fn(() => 
        Promise.resolve({
          data: { user: null },
          error: { message: 'Email already registered' }
        })
      );

      const result = await storytellerSignupTransaction(
        'test@example.com',
        'password123',
        'storyteller-id',
        'http://localhost:3000'
      );

      expect(result.data).toBeNull();
      expect(result.error?.message).toContain('Email already registered');
    });

    it('should handle storyteller linking failure', async () => {
      const storyteller = createMockStoryteller({ 
        id: 'storyteller-id',
        storyteller_user_id: null 
      });
      
      mockClient.seedData({
        storytellers: [storyteller],
        users: [],
      });

      // Mock the update to fail
      mockClient.from = vi.fn((table) => {
        if (table === 'storytellers') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({
                    data: null,
                    error: { message: 'Update failed' }
                  }))
                }))
              }))
            }))
          };
        }
      });

      const result = await storytellerSignupTransaction(
        'test@example.com',
        'password123',
        'storyteller-id',
        'http://localhost:3000'
      );

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Update failed');
    });
  });

  describe('storyCreationTransaction', () => {
    it('should create story successfully', async () => {
      const storyteller = createMockStoryteller({ 
        id: 'storyteller-id',
        user_id: 'user-id' 
      });
      
      mockClient.seedData({
        storytellers: [storyteller],
        stories: [],
      });

      const storyData = {
        storyteller_id: 'storyteller-id',
        user_id: 'user-id',
        story_part_1: 'Test story content',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await storyCreationTransaction(storyData);

      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
    });

    it('should validate storyteller ownership', async () => {
      const storyteller = createMockStoryteller({ 
        id: 'storyteller-id',
        user_id: 'different-user-id' 
      });
      
      mockClient.seedData({
        storytellers: [storyteller],
        stories: [],
      });

      const storyData = {
        storyteller_id: 'storyteller-id',
        user_id: 'user-id',
        story_part_1: 'Test story content',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await storyCreationTransaction(storyData);

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Storyteller does not belong to this user');
    });

    it('should prevent duplicate stories', async () => {
      const storyteller = createMockStoryteller({ 
        id: 'storyteller-id',
        user_id: 'user-id' 
      });
      
      const existingStory = {
        id: 'existing-story-id',
        storyteller_id: 'storyteller-id',
        user_id: 'user-id',
      };
      
      mockClient.seedData({
        storytellers: [storyteller],
        stories: [existingStory],
      });

      // Mock the existing story check
      mockClient.from = vi.fn((table) => {
        if (table === 'storytellers') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ 
                  data: storyteller, 
                  error: null 
                }))
              }))
            }))
          };
        }
        if (table === 'stories') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ 
                  data: existingStory, 
                  error: null 
                }))
              }))
            }))
          };
        }
      });

      const storyData = {
        storyteller_id: 'storyteller-id',
        user_id: 'user-id',
        story_part_1: 'Test story content',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await storyCreationTransaction(storyData);

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Story already exists for this storyteller');
    });

    it('should handle storyteller not found', async () => {
      mockClient.seedData({
        storytellers: [],
        stories: [],
      });

      const storyData = {
        storyteller_id: 'non-existent-id',
        user_id: 'user-id',
        story_part_1: 'Test story content',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await storyCreationTransaction(storyData);

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });
});