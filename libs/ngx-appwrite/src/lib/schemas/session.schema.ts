import { z } from 'zod';

export const AppwriteSessionSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.string(),
  userId: z.string(),
  expire: z.string(),
  provider: z.string(),
  providerUid: z.string(),
  providerAccessToken: z.string(),
  providerAccessTokenExpiry: z.string(),
  providerRefreshToken: z.string(),
  ip: z.string(),
  osCode: z.string(),
  osName: z.string(),
  osVersion: z.string(),
  clientType: z.string(),
  clientCode: z.string(),
  clientName: z.string(),
  clientVersion: z.string(),
  clientEngine: z.string(),
  clientEngineVersion: z.string(),
  deviceName: z.string(),
  deviceBrand: z.string(),
  deviceModel: z.string(),
  countryCode: z.string(),
  countryName: z.string(),
  current: z.boolean(),
});

export const AppwriteSessionListSchema = z.strictObject({
  total: z.number(),
  sessions: z.array(AppwriteSessionSchema),
});

export type AppwriteSessionObject = z.infer<typeof AppwriteSessionSchema>;
export type AppwriteSessionListObject = z.infer<
  typeof AppwriteSessionListSchema
>;
