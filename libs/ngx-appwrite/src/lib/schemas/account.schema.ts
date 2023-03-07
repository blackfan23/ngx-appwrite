import { z } from 'zod';

export const AppwriteAccountSchema = <TPrefs>(
  prefsSchema: z.Schema<TPrefs>
) => {
  return z.strictObject({
    $id: z.string(),
    $createdAt: z.string(),
    $updatedAt: z.string(),
    name: z.string(),
    registration: z.string(),
    status: z.boolean(),
    passwordUpdate: z.string(),
    email: z.string(),
    phone: z.string(),
    emailVerification: z.boolean(),
    phoneVerification: z.boolean(),
    prefs: prefsSchema,
  });
};

export type AppwriteAccountObject = z.infer<
  ReturnType<typeof AppwriteAccountSchema>
>;
