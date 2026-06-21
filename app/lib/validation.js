import { z } from 'zod';

export const visibilitySchema = z.enum(['public', 'private', 'unlisted']);

export const linkTtlSchema = z.enum(['hour', 'day', 'week', 'never']).default('never');

export const mediaKindSchema = z.enum(['video', 'image']).optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(6),
  visibility: visibilitySchema.optional(),
  accessToken: z.string().trim().optional(),
  mine: z
    .string()
    .optional()
    .transform((v) => v === '1' || v === 'true'),
  mediaKind: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'video' || v === 'image') return v;
      return undefined;
    }),
});
