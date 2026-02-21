import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { Client } from 'appwrite';
import { AppwriteConfig } from './config';

export { ID } from 'appwrite';

let __client: Client | undefined;
let __defaultDatabaseId: string | undefined;

/**
 * Injection token for the Appwrite Client.
 * Can be used to inject the client directly into services.
 */
export const APPWRITE_CLIENT = new InjectionToken<Client>('APPWRITE_CLIENT', {
  providedIn: 'root',
  factory: () => {
    if (!__client) {
      throw new Error(
        'Appwrite client not initialized, did you call provideAppwrite?',
      );
    }
    return __client;
  },
});

/**
 * Injection token for the default database ID.
 * Can be used to inject the default database ID directly into services.
 */
export const APPWRITE_DEFAULT_DATABASE = new InjectionToken<string | undefined>(
  'APPWRITE_DEFAULT_DATABASE',
  {
    providedIn: 'root',
    factory: () => __defaultDatabaseId,
  },
);

const ConfigToken = new InjectionToken<AppwriteConfig>('APPWRITE_USER_CONFIG');

const initializeAppwrite = (config: AppwriteConfig): void => {
  __client = new Client();

  __client.setEndpoint(config.endpoint).setProject(config.project);

  if (config.defaultDatabase) {
    __defaultDatabaseId = config.defaultDatabase;
  }
};

export const provideAppwrite = (
  config: AppwriteConfig,
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: ConfigToken,
      useValue: config,
    },
    provideAppInitializer(() => {
      const config = inject(ConfigToken);
      initializeAppwrite(config);
    }),
  ]);
};
