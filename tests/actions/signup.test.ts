import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signup } from '@/app/story_signup/actions';
import { 
  mockSupabaseClient, 
  createMockFormData, 
  createMockStoryteller, 
  mockValidation,
  mockNextJsFeatures 
} from '../utils';

// Mock the validation functions
vi.mock('@/lib/validations', () => ({
  storytellerSignupSchema: {},
  validateAndSanitize: vi.fn(),
}));

// Mock the transaction function
vi.mock('@/lib/supabase/transactions', () => ({
  storytellerSignupTransaction: vi.fn(),
}));

// Mock the database functions
vi.mock('@/lib/supabase/database', () => ({
  getStorytellerByToken: vi.fn(),
}));

describe('Signup Action', () => {
  let mockClient: any;
  let mockRedirect: any;
  let mockValidateAndSanitize: any;
  let mockStorytellerSignupTransaction: any;
  let mockGetStorytellerByToken: any;

  beforeEach(() => {
    mockClient = mockSupabaseClient();
    const nextMocks = mockNextJsFeatures();
    mockRedirect = nextMocks.mockRedirect;
    
    // Import mocked functions
    mockValidateAndSanitize = vi.mocked(
      (await import('@/lib/validations')).validateAndSanitize
    );
    mockStorytellerSignupTransaction = vi.mocked(
      (await import('@/lib/supabase/transactions')).storytellerSignupTransaction
    );
    mockGetStorytellerByToken = vi.mocked(
      (await import('@/lib/supabase/database')).getStorytellerByToken
    );
  });

  it('should return error for missing token', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const result = await signup({}, '', formData);
    expect(result.message).toContain('Invalid invitation: No token provided');
  });

  it('should return error for invalid form data', async () => {
    const formData = createMockFormData({
      email: 'invalid-email',
      password: 'weak'
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.error({ email: ['Invalid email format'] })
    );

    const result = await signup({}, 'valid-token', formData);
    expect(result.message).toContain('Invalid email format');
  });

  it('should return error for invalid token', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: null,
      error: { message: 'Token not found' }
    });

    const result = await signup({}, 'invalid-token', formData);
    expect(result.message).toContain('There was an issue validating your invitation');
  });

  it('should return error for non-existent storyteller', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: null,
      error: null
    });

    const result = await signup({}, 'invalid-token', formData);
    expect(result.message).toContain('This invitation link is invalid or has expired');
  });

  it('should return error for already used invitation', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const usedStoryteller = createMockStoryteller({
      storyteller_user_id: 'existing-user-id'
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: usedStoryteller,
      error: null
    });

    const result = await signup({}, 'used-token', formData);
    expect(result.message).toContain('This invitation has already been used');
  });

  it('should handle transaction error', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const storyteller = createMockStoryteller({
      storyteller_user_id: null
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: storyteller,
      error: null
    });

    mockStorytellerSignupTransaction.mockResolvedValue({
      data: null,
      error: { message: 'Transaction failed' }
    });

    const result = await signup({}, 'valid-token', formData);
    expect(result.message).toContain('Account creation failed: Transaction failed');
  });

  it('should handle already registered email error', async () => {
    const formData = createMockFormData({
      email: 'existing@example.com',
      password: 'password123'
    });

    const storyteller = createMockStoryteller({
      storyteller_user_id: null
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'existing@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: storyteller,
      error: null
    });

    mockStorytellerSignupTransaction.mockResolvedValue({
      data: null,
      error: { message: 'User already registered' }
    });

    const result = await signup({}, 'valid-token', formData);
    expect(result.message).toContain('An account with this email already exists');
  });

  it('should handle user creation failure', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const storyteller = createMockStoryteller({
      storyteller_user_id: null
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: storyteller,
      error: null
    });

    mockStorytellerSignupTransaction.mockResolvedValue({
      data: null,
      error: { message: 'User creation failed' }
    });

    const result = await signup({}, 'valid-token', formData);
    expect(result.message).toContain('Account creation was unsuccessful');
  });

  it('should handle null transaction result', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const storyteller = createMockStoryteller({
      storyteller_user_id: null
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: storyteller,
      error: null
    });

    mockStorytellerSignupTransaction.mockResolvedValue({
      data: null,
      error: null
    });

    const result = await signup({}, 'valid-token', formData);
    expect(result.message).toContain('Signup process failed');
  });

  it('should redirect on successful signup', async () => {
    const formData = createMockFormData({
      email: 'test@example.com',
      password: 'password123'
    });

    const storyteller = createMockStoryteller({
      storyteller_user_id: null
    });

    mockValidateAndSanitize.mockReturnValue(
      mockValidation.success({ email: 'test@example.com', password: 'password123' })
    );

    mockGetStorytellerByToken.mockResolvedValue({
      data: storyteller,
      error: null
    });

    mockStorytellerSignupTransaction.mockResolvedValue({
      data: {
        user: { id: 'new-user-id', email: 'test@example.com' },
        storyteller: { ...storyteller, storyteller_user_id: 'new-user-id' }
      },
      error: null
    });

    // Mock redirect to throw an error (as Next.js does)
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    try {
      await signup({}, 'valid-token', formData);
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toBe('NEXT_REDIRECT');
      expect(mockRedirect).toHaveBeenCalledWith('/story_submit');
    }
  });
});