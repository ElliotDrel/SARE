import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  handleDatabaseError, 
  createStoryteller, 
  createStory, 
  getStorytellerByToken,
  getStoriesForUser,
  checkOnboardingStatus 
} from '@/lib/supabase/database';
import { mockSupabaseClient, createMockStoryteller, createMockStory, mockDatabase } from '../utils';

describe('Database Utilities', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = mockSupabaseClient();
  });

  describe('handleDatabaseError', () => {
    it('should return null for null error', () => {
      const result = handleDatabaseError(null);
      expect(result).toBeNull();
    });

    it('should handle PostgreSQL error codes', () => {
      const error = { code: '23505', message: 'duplicate key' };
      const result = handleDatabaseError(error);
      expect(result).toEqual({
        code: '23505',
        message: 'A record with this information already exists',
        details: undefined,
        hint: undefined,
      });
    });

    it('should handle unknown error codes', () => {
      const error = { code: 'UNKNOWN_CODE', message: 'Unknown error' };
      const result = handleDatabaseError(error);
      expect(result).toEqual({
        code: 'UNKNOWN_CODE',
        message: 'Unknown error',
        details: undefined,
        hint: undefined,
      });
    });

    it('should handle errors without code', () => {
      const error = { message: 'Generic error' };
      const result = handleDatabaseError(error);
      expect(result).toEqual({
        code: 'UNKNOWN',
        message: 'Generic error',
        details: undefined,
        hint: undefined,
      });
    });
  });

  describe('createStoryteller', () => {
    it('should create a storyteller successfully', async () => {
      const storytellerData = {
        user_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Storyteller',
        email: 'test@example.com',
        invite_token: 'test-token',
      };

      mockClient.seedData({
        storytellers: [],
      });

      const result = await createStoryteller(storytellerData);
      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should return error for invalid UUID', async () => {
      const storytellerData = {
        user_id: 'invalid-uuid',
        name: 'Test Storyteller',
        email: 'test@example.com',
        invite_token: 'test-token',
      };

      const result = await createStoryteller(storytellerData);
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('INVALID_UUID');
    });

    it('should return error for missing required fields', async () => {
      const storytellerData = {
        user_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        name: '',
        email: 'test@example.com',
        invite_token: 'test-token',
      };

      const result = await createStoryteller(storytellerData);
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('MISSING_REQUIRED_FIELDS');
    });
  });

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const storyData = {
        storyteller_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        user_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        story_part_1: 'This is the first part of the story',
        story_part_2: 'This is the second part',
        story_part_3: null,
      };

      mockClient.seedData({
        stories: [],
      });

      const result = await createStory(storyData);
      expect(result.data).toBeTruthy();
      expect(result.error).toBeNull();
      expect(result.data?.story_part_1).toBe('This is the first part of the story');
    });

    it('should return error for invalid storyteller ID', async () => {
      const storyData = {
        storyteller_id: 'invalid-uuid',
        user_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        story_part_1: 'This is the first part of the story',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await createStory(storyData);
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('INVALID_UUID');
    });

    it('should return error for missing story content', async () => {
      const storyData = {
        storyteller_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        user_id: 'valid-uuid-123e4567-e89b-12d3-a456-426614174000',
        story_part_1: '',
        story_part_2: null,
        story_part_3: null,
      };

      const result = await createStory(storyData);
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('MISSING_REQUIRED_FIELDS');
    });
  });

  describe('getStorytellerByToken', () => {
    it('should find storyteller by token', async () => {
      const storyteller = createMockStoryteller({ invite_token: 'test-token' });
      mockClient.seedData({
        storytellers: [storyteller],
      });

      const result = await getStorytellerByToken('test-token');
      expect(result.data).toBeTruthy();
      expect(result.data?.invite_token).toBe('test-token');
    });

    it('should return null for non-existent token', async () => {
      mockClient.seedData({
        storytellers: [],
      });

      const result = await getStorytellerByToken('non-existent-token');
      expect(result.data).toBeNull();
      expect(result.error?.code).toBe('PGRST116');
    });
  });

  describe('getStoriesForUser', () => {
    it('should return stories for user', async () => {
      const stories = [
        createMockStory({ user_id: 'user-1' }),
        createMockStory({ user_id: 'user-1' }),
      ];
      mockClient.seedData({
        stories,
      });

      const result = await getStoriesForUser('user-1');
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]?.user_id).toBe('user-1');
    });

    it('should return empty array for user with no stories', async () => {
      mockClient.seedData({
        stories: [],
      });

      const result = await getStoriesForUser('user-with-no-stories');
      expect(result.data).toEqual([]);
    });
  });

  describe('checkOnboardingStatus', () => {
    it('should return correct onboarding status', async () => {
      const userId = 'test-user-id';
      
      // Mock both queries
      mockClient.from = vi.fn((table) => {
        if (table === 'stories') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ count: 2 }))
            }))
          };
        }
        if (table === 'self_reflections') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: {
                    reflection_1: 'Test reflection 1',
                    reflection_2: 'Test reflection 2',
                    reflection_3: 'Test reflection 3',
                  }
                }))
              }))
            }))
          };
        }
      });

      const result = await checkOnboardingStatus(userId);
      expect(result.storiesCollected).toBe(2);
      expect(result.hasCompletedReflection).toBe(true);
      expect(result.canGenerateReport).toBe(true);
    });

    it('should handle incomplete onboarding', async () => {
      const userId = 'test-user-id';
      
      mockClient.from = vi.fn((table) => {
        if (table === 'stories') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ count: 0 }))
            }))
          };
        }
        if (table === 'self_reflections') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({
                  data: null
                }))
              }))
            }))
          };
        }
      });

      const result = await checkOnboardingStatus(userId);
      expect(result.storiesCollected).toBe(0);
      expect(result.hasCompletedReflection).toBe(false);
      expect(result.canGenerateReport).toBe(false);
    });
  });
});