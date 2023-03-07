import { z } from 'zod';

export const AppwriteDocumentSchema = z.strictObject({
  $id: z.string(),
  $collectionId: z.string(),
  $databaseId: z.string(),
  $createdAt: z.string(),
  $updatedAt: z.string(),
  $permissions: z.array(z.string()),
});

export type AppwriteDocumentObject = z.infer<typeof AppwriteDocumentSchema>;
