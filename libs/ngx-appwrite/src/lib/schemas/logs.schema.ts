import { z } from 'zod';

export const AppwriteLogSchema = z.strictObject({
  event: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  userName: z.string(),
  mode: z.string(),
  ip: z.string(),
  time: z.string(),
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
});

export const AppwriteLogListSchema = z.strictObject({
  total: z.number(),
  logs: z.array(AppwriteLogSchema),
});

export type AppwriteLogListObject = z.infer<typeof AppwriteLogListSchema>;
export type AppwriteLogObject = z.infer<typeof AppwriteLogSchema>;
