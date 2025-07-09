import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

// Mock form data helper
export const createMockFormData = (data: Record<string, string | File>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Mock server actions
export const mockServerAction = (returnValue: any = { message: 'Success' }) => {
  return vi.fn(async () => returnValue);
};

// Helper to create wrapper components for testing
interface WrapperProps {
  children: ReactNode;
}

export const createTestWrapper = (wrapperProps: any = {}) => {
  const TestWrapper = ({ children }: WrapperProps) => {
    return <div data-testid="test-wrapper" {...wrapperProps}>{children}</div>;
  };
  return TestWrapper;
};

// Custom render function that includes common providers
export const renderWithProviders = (
  ui: ReactElement,
  options: RenderOptions & { wrapperProps?: any } = {}
) => {
  const { wrapperProps = {}, ...renderOptions } = options;
  const Wrapper = createTestWrapper(wrapperProps);
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to wait for async operations
export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock PDF generation
export const mockPDFGeneration = () => {
  vi.mock('pdf-lib', () => ({
    PDFDocument: {
      create: vi.fn(() => ({
        embedFont: vi.fn(() => Promise.resolve({})),
        addPage: vi.fn(() => ({
          getSize: vi.fn(() => ({ width: 612, height: 792 })),
          drawText: vi.fn(),
        })),
        save: vi.fn(() => Promise.resolve(new Uint8Array())),
      })),
    },
    StandardFonts: {
      Helvetica: 'Helvetica',
      HelveticaBold: 'Helvetica-Bold',
    },
    rgb: vi.fn((r, g, b) => ({ r, g, b })),
  }));
  
  vi.mock('file-saver', () => ({
    saveAs: vi.fn(),
  }));
};

// Mock validation functions
export const mockValidation = {
  success: (data: any) => ({ success: true, data, errors: {} }),
  error: (errors: Record<string, string[]>) => ({ success: false, data: null, errors }),
};

// Helper to create mock tokens
export const createMockToken = (length: number = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => 
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};

// Mock environment variables
export const mockEnvVars = (vars: Record<string, string>) => {
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv, ...vars };
  });
  afterEach(() => {
    process.env = originalEnv;
  });
};

// Error testing helpers
export const expectError = (error: any, expectedMessage: string) => {
  expect(error).toBeDefined();
  expect(error.message).toContain(expectedMessage);
};

export const expectDatabaseError = (result: any, expectedCode: string) => {
  expect(result.data).toBeNull();
  expect(result.error).toBeDefined();
  expect(result.error.code).toBe(expectedCode);
};

// Mock Next.js specific features
export const mockNextJsFeatures = () => {
  // Mock redirect to capture redirect calls
  const mockRedirect = vi.fn();
  vi.mock('next/navigation', async () => {
    const actual = await vi.importActual('next/navigation');
    return {
      ...actual,
      redirect: mockRedirect,
    };
  });
  
  // Mock revalidatePath to capture revalidation calls
  const mockRevalidatePath = vi.fn();
  vi.mock('next/cache', async () => {
    const actual = await vi.importActual('next/cache');
    return {
      ...actual,
      revalidatePath: mockRevalidatePath,
    };
  });
  
  return { mockRedirect, mockRevalidatePath };
};

// Test data builders
export const testDataBuilder = {
  storyteller: (overrides: any = {}) => ({
    id: 'test-storyteller-id',
    user_id: 'test-user-id',
    name: 'Test Storyteller',
    email: 'storyteller@test.com',
    invite_token: 'test-token',
    storyteller_user_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  story: (overrides: any = {}) => ({
    id: 'test-story-id',
    storyteller_id: 'test-storyteller-id',
    user_id: 'test-user-id',
    story_part_1: 'Test story part 1',
    story_part_2: 'Test story part 2',
    story_part_3: null,
    submitted_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  selfReflection: (overrides: any = {}) => ({
    id: 'test-reflection-id',
    user_id: 'test-user-id',
    reflection_1: 'Test reflection 1',
    reflection_2: 'Test reflection 2',
    reflection_3: 'Test reflection 3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
  
  user: (overrides: any = {}) => ({
    id: 'test-user-id',
    email: 'user@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),
};