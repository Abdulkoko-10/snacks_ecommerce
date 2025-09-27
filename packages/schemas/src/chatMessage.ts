import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  text: z.string(),
  userId: z.string(),
  threadId: z.string(),
  createdAt: z.date(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;