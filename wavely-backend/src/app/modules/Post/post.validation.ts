import { z } from 'zod';

const createPostValidationSchema = z.object({
  body: z.object({
    text: z
      .string({ required_error: 'Post text is required' })
      .trim()
      .min(1, 'Post cannot be empty')
      .max(5000, 'Post cannot exceed 5000 characters'),
    visibility: z.enum(['public', 'private']).default('public'),
  }),
});

export const PostValidation = {
  createPostValidationSchema,
};
