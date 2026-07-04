import { z } from 'zod';

const updateProfileValidationSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1).max(50).optional(),
    lastName: z.string().trim().min(1).max(50).optional(),
  }),
});

export const UserValidation = {
  updateProfileValidationSchema,
};
