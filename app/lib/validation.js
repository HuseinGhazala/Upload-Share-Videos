import { z } from 'zod';

export const visibilitySchema = z.enum(['public', 'private', 'unlisted']);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(6),
  visibility: visibilitySchema.optional(),
  accessToken: z.string().trim().optional(),
});
