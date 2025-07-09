import { z } from "zod";

// Story submission validation schema
export const storySubmissionSchema = z.object({
  story_part_1: z
    .string()
    .min(10, "The first part of your story must be at least 10 characters long")
    .max(5000, "The first part of your story cannot exceed 5000 characters")
    .refine(
      (value) => value.trim().length > 0,
      "The first part of your story cannot be empty"
    ),
  story_part_2: z
    .string()
    .max(5000, "The second part of your story cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
  story_part_3: z
    .string()
    .max(5000, "The third part of your story cannot exceed 5000 characters")
    .optional()
    .or(z.literal("")),
});

// Storyteller signup validation schema
export const storytellerSignupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters")
    .refine(
      (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value),
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

// Self-reflection validation schema
export const selfReflectionSchema = z.object({
  reflection_1: z
    .string()
    .min(10, "Your reflection must be at least 10 characters long")
    .max(5000, "Your reflection cannot exceed 5000 characters")
    .refine(
      (value) => value.trim().length > 0,
      "This reflection cannot be empty"
    ),
  reflection_2: z
    .string()
    .min(10, "Your reflection must be at least 10 characters long")
    .max(5000, "Your reflection cannot exceed 5000 characters")
    .refine(
      (value) => value.trim().length > 0,
      "This reflection cannot be empty"
    ),
  reflection_3: z
    .string()
    .min(10, "Your reflection must be at least 10 characters long")
    .max(5000, "Your reflection cannot exceed 5000 characters")
    .refine(
      (value) => value.trim().length > 0,
      "This reflection cannot be empty"
    ),
});

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .refine(
      (value) => value.trim().length > 0,
      "Name cannot be empty"
    ),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(100, "Email cannot exceed 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(2000, "Message cannot exceed 2000 characters")
    .refine(
      (value) => value.trim().length > 0,
      "Message cannot be empty"
    ),
});

// Utility function to sanitize HTML content
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Utility function to validate and sanitize form data
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string[]> } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((error) => {
      const field = error.path.join(".");
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.message);
    });
    return { success: false, errors };
  }
  
  return { success: true, data: result.data };
}

// Type exports for form validation
export type StorySubmissionData = z.infer<typeof storySubmissionSchema>;
export type StorytellerSignupData = z.infer<typeof storytellerSignupSchema>;
export type SelfReflectionData = z.infer<typeof selfReflectionSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;