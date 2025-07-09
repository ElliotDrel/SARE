import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateSAREReport, PDF_CONSTANTS } from '@/lib/pdf-generator';
import { mockPDFGeneration, createMockUser, createMockSelfReflection, createMockStory } from '../utils';

// Mock PDF dependencies
mockPDFGeneration();

describe('PDF Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSAREReport', () => {
    it('should generate PDF with user data', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();
      const stories = [
        { ...createMockStory(), storyteller: { name: 'Test Storyteller', email: 'test@example.com' } }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle null self reflection', async () => {
      const user = createMockUser();
      const stories = [
        { ...createMockStory(), storyteller: { name: 'Test Storyteller', email: 'test@example.com' } }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection: null,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle empty stories array', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories: []
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle stories with missing storyteller data', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();
      const stories = [
        { ...createMockStory(), storyteller: null }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle stories with partial content', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();
      const stories = [
        { 
          ...createMockStory(), 
          story_part_2: null, 
          story_part_3: null,
          storyteller: { name: 'Test Storyteller', email: 'test@example.com' }
        }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle multiple stories', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();
      const stories = [
        { ...createMockStory(), storyteller: { name: 'Storyteller 1', email: 'story1@example.com' } },
        { ...createMockStory(), storyteller: { name: 'Storyteller 2', email: 'story2@example.com' } },
        { ...createMockStory(), storyteller: { name: 'Storyteller 3', email: 'story3@example.com' } }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle long text content', async () => {
      const user = createMockUser();
      const selfReflection = {
        ...createMockSelfReflection(),
        reflection_1: 'This is a very long reflection that should test the text wrapping functionality of the PDF generator. '.repeat(50),
        reflection_2: 'Another long reflection to test pagination and text flow handling. '.repeat(30),
        reflection_3: 'A third long reflection to ensure the PDF can handle multiple pages if needed. '.repeat(40)
      };
      const stories = [
        { 
          ...createMockStory(), 
          story_part_1: 'This is a very long story part that should test the text wrapping and pagination features. '.repeat(100),
          story_part_2: 'Another long story part to test continuous text flow across pages. '.repeat(80),
          story_part_3: 'A third long story part to ensure proper handling of multi-part stories. '.repeat(60),
          storyteller: { name: 'Test Storyteller', email: 'test@example.com' }
        }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle special characters in content', async () => {
      const user = createMockUser();
      const selfReflection = {
        ...createMockSelfReflection(),
        reflection_1: 'Reflection with special chars: áéíóú, ñ, ¿¡, symbols: @#$%^&*()_+{}[]|\\:";\'<>?,./`~',
        reflection_2: 'Unicode test: 🚀 💡 ⭐ 🎯 📊 🔥 ✨ 🌟 💪 🎉',
        reflection_3: 'Mixed content: Regular text with émojis 😊 and spëcial chärs'
      };
      const stories = [
        { 
          ...createMockStory(), 
          story_part_1: 'Story with special characters: "quotes", 'apostrophes', & ampersands',
          story_part_2: 'Unicode story: 🌈 Stories can have emojis too! 🎨',
          story_part_3: null,
          storyteller: { name: 'Storyteller with spëcial name', email: 'test@exámple.com' }
        }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe('PDF_CONSTANTS', () => {
    it('should have required constants', () => {
      expect(PDF_CONSTANTS.MARGIN).toBeDefined();
      expect(PDF_CONSTANTS.FONT_SIZES).toBeDefined();
      expect(PDF_CONSTANTS.LINE_HEIGHT).toBeDefined();
      expect(PDF_CONSTANTS.COLORS).toBeDefined();
    });

    it('should have proper font sizes', () => {
      expect(PDF_CONSTANTS.FONT_SIZES.TITLE).toBeGreaterThan(PDF_CONSTANTS.FONT_SIZES.SECTION_HEADER);
      expect(PDF_CONSTANTS.FONT_SIZES.SECTION_HEADER).toBeGreaterThan(PDF_CONSTANTS.FONT_SIZES.BODY);
      expect(PDF_CONSTANTS.FONT_SIZES.QUESTION).toBeGreaterThanOrEqual(PDF_CONSTANTS.FONT_SIZES.BODY);
    });

    it('should have reasonable spacing values', () => {
      expect(PDF_CONSTANTS.MARGIN).toBeGreaterThan(0);
      expect(PDF_CONSTANTS.LINE_HEIGHT).toBeGreaterThan(1);
      expect(PDF_CONSTANTS.SECTION_SPACING).toBeGreaterThan(0);
    });
  });

  describe('PDF Generation Edge Cases', () => {
    it('should handle empty user email', async () => {
      const user = createMockUser({ email: '' });
      const selfReflection = createMockSelfReflection();
      const stories = [];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle null user email', async () => {
      const user = createMockUser({ email: null });
      const selfReflection = createMockSelfReflection();
      const stories = [];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle empty reflection fields', async () => {
      const user = createMockUser();
      const selfReflection = {
        ...createMockSelfReflection(),
        reflection_1: '',
        reflection_2: '',
        reflection_3: ''
      };
      const stories = [];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should handle stories with only story_part_1', async () => {
      const user = createMockUser();
      const selfReflection = createMockSelfReflection();
      const stories = [
        { 
          ...createMockStory(), 
          story_part_1: 'Only first part',
          story_part_2: null,
          story_part_3: null,
          storyteller: { name: 'Test Storyteller', email: 'test@example.com' }
        }
      ];

      const result = await generateSAREReport({
        user,
        selfReflection,
        stories
      });

      expect(result).toBeInstanceOf(Uint8Array);
    });
  });
});