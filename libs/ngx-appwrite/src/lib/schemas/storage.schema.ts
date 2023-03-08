import { z } from 'zod';

export const AppwriteFileSchema = z.strictObject({
  $id: z.string(),
  bucketId: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  $permissions: z.array(z.string()),
  name: z.string(),
  signature: z.string(),
  mimeType: z.string(),
  sizeOriginal: z.number(),
  chunksTotal: z.number(),
  chunksUploaded: z.number(),
});

export const AppwriteFileListSchema = z.strictObject({
  total: z.number(),
  files: z.array(AppwriteFileSchema),
});

export type AppwriteFileObject = z.infer<typeof AppwriteFileSchema>;
export type AppwriteFileListObject = z.infer<typeof AppwriteFileListSchema>;
