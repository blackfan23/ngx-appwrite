/* eslint-disable @typescript-eslint/ban-types */
import { InjectionToken } from '@angular/core';

export const APPWRITE_CONFIG = new InjectionToken<AppwriteConfig>(
  'AppwriteConfigToken'
);

export const APPWRITE_CONFIG_DEFAULT_VALUE: AppwriteConfig = {
  endpoint: '',
  project: '',
};

export interface AppwriteConfig {
  endpoint: string;
  project: string;
  defaultDatabase?: string;
}
