import { z } from 'zod';

export const AppwriteAccountSchema = z.strictObject({
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
  prefs: z.any(),
});

export interface AppwriteAccountObject<T> {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  registration: string;
  status: boolean;
  passwordUpdate: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: T;
}
