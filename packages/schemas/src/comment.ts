import { z } from 'zod';

export const CommentSchema = z.object({
  _id: z.string(),
  productId: z.string(),
  userId: z.string(),
  text: z.string(),
  createdAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;