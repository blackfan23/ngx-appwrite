import { z } from 'zod';

export const AppwriteAccountSchema = z.strictObject({
  $id: z.string(),
  $createdAt: z.date(),
  $updatedAt: z.date(),
  name: z.string(),
  registration: z.date(),
  status: z.boolean(),
  passwordUpdate: z.date(),
  email: z.string(),
  phone: z.string(),
  emailVerification: z.boolean(),
  phoneVerification: z.boolean(),
  prefs: z.object({}),
});

export type AppwriteAccountObject = z.infer<typeof AppwriteAccountSchema>;
