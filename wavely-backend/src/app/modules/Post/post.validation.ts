import { z } from 'zod';

const createPostValidationSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Post text is required' })
      .trim()
      .min(1, 'Post cannot be empty')
      .max(5000, 'Post cannot exceed 5000 characters'),
    visibility: z.enum(['public', 'private']).default('public'),
    imageUrl: z
      .string()
      .url()
      .refine((u) => u.startsWith('https://res.cloudinary.com/'), {
        message: 'Image must be a Cloudinary URL from this app',
      })
      .optional(),
  }),
});

const updatePostValidationSchema = z.object({
  body: z
    .object({
      text: z
        .string()
        .trim()
        .min(1, 'Post cannot be empty')
        .max(5000, 'Post cannot exceed 5000 characters')
        .optional(),
      visibility: z.enum(['public', 'private']).optional(),
    })
    .refine((b) => b.text !== undefined || b.visibility !== undefined, {
      message: 'Nothing to update',
    }),
});

export const PostValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
