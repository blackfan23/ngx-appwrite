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

export const AppwriteMembershipSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  invited: z.string(),
  joined: z.string(),
  confirm: z.boolean(),
  roles: z.array(z.string()),
});

export const AppwriteMembershipListSchema = z.strictObject({
  total: z.number(),
  memberships: z.array(AppwriteMembershipSchema),
});

export type AppwriteTeamObject = z.infer<typeof AppwriteTeamSchema>;
export type AppwriteTeamListObject = z.infer<typeof AppwriteTeamListSchema>;

export type AppwriteMembershipObject = z.infer<typeof AppwriteMembershipSchema>;
export type AppwriteMembershipListObject = z.infer<
  typeof AppwriteMembershipListSchema
>;
