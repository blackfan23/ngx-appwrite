import { z } from 'zod';

export const AppwriteTeamSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  name: z.string(),
  total: z.number(),
});

export const AppwriteTeamListSchema = z.strictObject({
  total: z.number(),
  teams: z.array(AppwriteTeamSchema),
});

export type AppwriteTeamObject = z.infer<typeof AppwriteTeamSchema>;
export type AppwriteTeamListObject = z.infer<typeof AppwriteTeamListSchema>;
