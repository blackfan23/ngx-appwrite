import { z } from 'zod';

export const AppwriteFileSchema = z.strictObject({
  $id: z.string(),
  bucketId: z.string(),
  $createdAt: z.date(),
  $updatedAt: z.date(),
  $permissions: z.array(z.string()),
  name: z.string(),
  signature: z.string(),
  mimeType: z.string(),
  sizeOriginal: z.number(),
  chunksTotal: z.number(),
  chunksUploaded: z.number(),
});

export type AppwriteFileObject = z.infer<typeof AppwriteFileSchema>;
