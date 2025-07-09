import { vi } from 'vitest';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Mock data types
export interface MockStoryteller {
  id: string;
  user_id: string;
  name: string;
  email: string;
  invite_token: string | null;
  storyteller_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockStory {
  id: string;
  storyteller_id: string;
  user_id: string;
  story_part_1: string;
  story_part_2: string | null;
  story_part_3: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface MockSelfReflection {
  id: string;
  user_id: string;
  reflection_1: string;
  reflection_2: string;
  reflection_3: string;
  created_at: string;
  updated_at: string;
}

// Mock data generators
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'mock-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  phone: null,
  confirmation_sent_at: null,
  confirmed_at: new Date().toISOString(),
  recovery_sent_at: null,
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
  ...overrides,
});

export const createMockStoryteller = (overrides: Partial<MockStoryteller> = {}): MockStoryteller => ({
  id: 'mock-storyteller-id',
  user_id: 'mock-user-id',
  name: 'Test Storyteller',
  email: 'storyteller@example.com',
  invite_token: 'mock-invite-token',
  storyteller_user_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockStory = (overrides: Partial<MockStory> = {}): MockStory => ({
  id: 'mock-story-id',
  storyteller_id: 'mock-storyteller-id',
  user_id: 'mock-user-id',
  story_part_1: 'This is part 1 of the story',
  story_part_2: 'This is part 2 of the story',
  story_part_3: null,
  submitted_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockSelfReflection = (overrides: Partial<MockSelfReflection> = {}): MockSelfReflection => ({
  id: 'mock-reflection-id',
  user_id: 'mock-user-id',
  reflection_1: 'My reflection on being at my best',
  reflection_2: 'What makes this story special',
  reflection_3: 'Common themes I notice',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Mock Supabase client builder
export class MockSupabaseClient {
  private mockData: {
    users: User[];
    storytellers: MockStoryteller[];
    stories: MockStory[];
    self_reflections: MockSelfReflection[];
  };

  constructor() {
    this.mockData = {
      users: [],
      storytellers: [],
      stories: [],
      self_reflections: [],
    };
  }

  // Method to seed mock data
  seedData(data: Partial<typeof this.mockData>) {
    this.mockData = { ...this.mockData, ...data };
  }

  // Clear all mock data
  clearData() {
    this.mockData = {
      users: [],
      storytellers: [],
      stories: [],
      self_reflections: [],
    };
  }

  // Mock auth methods
  get auth() {
    return {
      getUser: vi.fn(() => 
        Promise.resolve({
          data: { user: this.mockData.users[0] || null },
          error: null,
        })
      ),
      signUp: vi.fn((params: any) => {
        const newUser = createMockUser({ email: params.email });
        this.mockData.users.push(newUser);
        return Promise.resolve({
          data: { user: newUser },
          error: null,
        });
      }),
      signInWithPassword: vi.fn(() => 
        Promise.resolve({
          data: { user: this.mockData.users[0] || null },
          error: null,
        })
      ),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    };
  }

  // Mock database methods
  from(table: string) {
    const mockTable = {
      select: vi.fn(() => mockTable),
      insert: vi.fn((data: any) => {
        const newItem = { ...data, id: `mock-${Date.now()}` };
        (this.mockData as any)[table].push(newItem);
        return {
          ...mockTable,
          single: () => Promise.resolve({ data: newItem, error: null }),
        };
      }),
      update: vi.fn((data: any) => ({
        ...mockTable,
        eq: vi.fn(() => ({
          ...mockTable,
          single: () => {
            const items = (this.mockData as any)[table];
            if (items.length > 0) {
              Object.assign(items[0], data);
              return Promise.resolve({ data: items[0], error: null });
            }
            return Promise.resolve({ data: null, error: { message: 'No rows found' } });
          },
          select: () => ({
            single: () => {
              const items = (this.mockData as any)[table];
              if (items.length > 0) {
                Object.assign(items[0], data);
                return Promise.resolve({ data: items[0], error: null });
              }
              return Promise.resolve({ data: null, error: { message: 'No rows found' } });
            },
          }),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      eq: vi.fn((column: string, value: any) => ({
        ...mockTable,
        single: () => {
          const items = (this.mockData as any)[table];
          const found = items.find((item: any) => item[column] === value);
          return Promise.resolve({ 
            data: found || null, 
            error: found ? null : { code: 'PGRST116', message: 'No rows found' } 
          });
        },
        order: vi.fn(() => ({
          ...mockTable,
          single: () => {
            const items = (this.mockData as any)[table];
            const found = items.find((item: any) => item[column] === value);
            return Promise.resolve({ 
              data: found || null, 
              error: found ? null : { code: 'PGRST116', message: 'No rows found' } 
            });
          },
        })),
      })),
      order: vi.fn(() => ({
        ...mockTable,
        eq: vi.fn((column: string, value: any) => {
          const items = (this.mockData as any)[table];
          const filtered = items.filter((item: any) => item[column] === value);
          return Promise.resolve({ data: filtered, error: null });
        }),
      })),
      single: vi.fn(() => {
        const items = (this.mockData as any)[table];
        return Promise.resolve({ 
          data: items[0] || null, 
          error: items.length > 0 ? null : { code: 'PGRST116', message: 'No rows found' } 
        });
      }),
    };

    return mockTable;
  }
}

// Helper function to create a mock Supabase client
export const createMockSupabaseClient = () => {
  const mockClient = new MockSupabaseClient();
  return mockClient as unknown as SupabaseClient;
};

// Mock the Supabase client creation
export const mockSupabaseClient = () => {
  const mockClient = new MockSupabaseClient();
  
  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockClient)),
  }));
  
  vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => mockClient),
  }));
  
  return mockClient;
};

// Utility for testing database operations
export const mockDatabase = {
  // Mock successful responses
  success: <T>(data: T) => ({ data, error: null }),
  
  // Mock error responses
  error: (message: string, code = 'UNKNOWN') => ({
    data: null,
    error: { message, code },
  }),
  
  // Mock not found responses
  notFound: () => ({
    data: null,
    error: { code: 'PGRST116', message: 'No rows found' },
  }),
  
  // Mock duplicate error
  duplicate: () => ({
    data: null,
    error: { code: '23505', message: 'duplicate key value violates unique constraint' },
  }),
};