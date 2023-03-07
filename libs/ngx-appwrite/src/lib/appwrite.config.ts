/* eslint-disable @typescript-eslint/ban-types */
import { InjectionToken } from '@angular/core';
import { z } from 'zod';

export const APPWRITE_CONFIG = new InjectionToken<AppwriteConfig>(
  'AppwriteConfigToken'
);

export const APPWRITE_CONFIG_DEFAULT_VALUE: AppwriteConfig = {
  endpoint: '',
  project: '',
  userPrefsSchema: z.object({}),
};

export interface AppwriteConfig {
  endpoint: string;
  project: string;
  userPrefsSchema?: z.Schema;
  defaultDatabase?: string;
}
