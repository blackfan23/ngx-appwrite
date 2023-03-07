import { z } from 'zod';

export const AppwriteTokenSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.string(),
  userId: z.string(),
  secret: z.string(),
  expire: z.string(),
});

export type AppwriteTokenObject = z.infer<typeof AppwriteTokenSchema>;
