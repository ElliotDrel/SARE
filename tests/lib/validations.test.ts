import { describe, it, expect } from 'vitest';
import { 
  validateAndSanitize, 
  sanitizeHtml, 
  storytellerSignupSchema,
  storySubmissionSchema 
} from '@/lib/validations';
import { z } from 'zod';

describe('Validation Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeHtml(input);
      expect(result).toBe('Hello World');
    });

    it('should remove dangerous attributes', () => {
      const input = '<p onclick="alert(\'xss\')">Hello World</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Hello World</p>');
    });

    it('should preserve safe HTML', () => {
      const input = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<strong>Bold text</strong>');
      expect(result).toContain('<em>italic text</em>');
    });

    it('should handle empty strings', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeHtml(null as any)).toBe('');
      expect(sanitizeHtml(undefined as any)).toBe('');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="http://evil.com"></iframe>Safe content';
      const result = sanitizeHtml(input);
      expect(result).toBe('Safe content');
    });

    it('should handle mixed content', () => {
      const input = '<p>Normal text</p><script>evil()</script><strong>Bold</strong>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>Normal text</p>');
      expect(result).toContain('<strong>Bold</strong>');
      expect(result).not.toContain('<script>');
    });
  });

  describe('validateAndSanitize', () => {
    const testSchema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
      age: z.number().min(0).optional(),
    });

    it('should validate and return data for valid input', () => {
      const input = {
        email: 'test@example.com',
        name: 'John Doe',
        age: 25
      };

      const result = validateAndSanitize(testSchema, input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid input', () => {
      const input = {
        email: 'invalid-email',
        name: 'A',
        age: -5
      };

      const result = validateAndSanitize(testSchema, input);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('age');
    });

    it('should handle partial validation', () => {
      const input = {
        email: 'test@example.com',
        name: 'John Doe'
        // age is optional
      };

      const result = validateAndSanitize(testSchema, input);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(input);
    });

    it('should handle empty input', () => {
      const result = validateAndSanitize(testSchema, {});
      expect(result.success).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('name');
    });

    it('should handle null input', () => {
      const result = validateAndSanitize(testSchema, null);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle undefined input', () => {
      const result = validateAndSanitize(testSchema, undefined);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('storytellerSignupSchema', () => {
    it('should validate correct signup data', () => {
      const input = {
        email: 'storyteller@example.com',
        password: 'securePassword123!'
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it('should reject invalid email', () => {
      const input = {
        email: 'invalid-email',
        password: 'securePassword123!'
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const input = {
        email: 'storyteller@example.com',
        password: '123'
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject empty fields', () => {
      const input = {
        email: '',
        password: ''
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle missing fields', () => {
      const input = {
        email: 'test@example.com'
        // password missing
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should trim email whitespace', () => {
      const input = {
        email: '  storyteller@example.com  ',
        password: 'securePassword123!'
      };

      const result = storytellerSignupSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('storyteller@example.com');
      }
    });
  });

  describe('storySubmissionSchema', () => {
    it('should validate story with all parts', () => {
      const input = {
        story_part_1: 'First part of the story',
        story_part_2: 'Second part of the story',
        story_part_3: 'Third part of the story'
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it('should validate story with only first part', () => {
      const input = {
        story_part_1: 'First part of the story'
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.story_part_1).toBe('First part of the story');
        expect(result.data.story_part_2).toBeUndefined();
        expect(result.data.story_part_3).toBeUndefined();
      }
    });

    it('should validate story with first and second parts', () => {
      const input = {
        story_part_1: 'First part of the story',
        story_part_2: 'Second part of the story'
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.story_part_1).toBe('First part of the story');
        expect(result.data.story_part_2).toBe('Second part of the story');
        expect(result.data.story_part_3).toBeUndefined();
      }
    });

    it('should reject empty first part', () => {
      const input = {
        story_part_1: '',
        story_part_2: 'Second part of the story'
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject missing first part', () => {
      const input = {
        story_part_2: 'Second part of the story'
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should handle very long story parts', () => {
      const longText = 'A'.repeat(10000);
      const input = {
        story_part_1: longText,
        story_part_2: longText,
        story_part_3: longText
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from story parts', () => {
      const input = {
        story_part_1: '  First part with spaces  ',
        story_part_2: '  Second part with spaces  ',
        story_part_3: '  Third part with spaces  '
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.story_part_1).toBe('First part with spaces');
        expect(result.data.story_part_2).toBe('Second part with spaces');
        expect(result.data.story_part_3).toBe('Third part with spaces');
      }
    });

    it('should handle empty optional parts', () => {
      const input = {
        story_part_1: 'First part of the story',
        story_part_2: '',
        story_part_3: ''
      };

      const result = storySubmissionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.story_part_1).toBe('First part of the story');
        // Empty strings should be treated as undefined for optional fields
        expect(result.data.story_part_2).toBeUndefined();
        expect(result.data.story_part_3).toBeUndefined();
      }
    });
  });
});