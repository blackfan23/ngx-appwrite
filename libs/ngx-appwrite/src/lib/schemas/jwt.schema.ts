import { z } from 'zod';

export const AppwriteJWTSchema = z.strictObject({
  jwt: z.string(),
});

export type AppwriteJWTObject = z.infer<typeof AppwriteJWTSchema>;
