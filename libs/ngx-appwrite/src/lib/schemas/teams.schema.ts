import { z } from 'zod';

export const AppwriteTeamsSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.date(),
  $updatedAt: z.date(),
  name: z.string(),
  total: z.number(),
});

export type AppwriteTeamsObject = z.infer<typeof AppwriteTeamsSchema>;
