import { APP_INITIALIZER, InjectionToken, type Provider } from '@angular/core';
import { Client } from 'appwrite';
import { AppwriteConfig } from './config';

export { ID } from 'appwrite';

let __client: Client | undefined;
let __defaultDatabaseId: string | undefined;

export const CLIENT = () => {
  if (!__client) {
    throw new Error(
      'Appwrite client not initialized, did you call initializeAppwrite?',
    );
  }
  return __client;
};

export const DEFAULT_DATABASE_ID = (): string | undefined => {
  if (!__defaultDatabaseId) {
    console.warn(
      'Appwrite default database id not initialized, can be passed inside provideAppwrite',
    );
  }
  return __defaultDatabaseId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConfigToken = new InjectionToken<any>('APPWRITE_USER_CONFIG');

const initializeAppwrite = (config: AppwriteConfig) => {
  return () => {
    __client = new Client();

    __client.setEndpoint(config.endpoint).setProject(config.project); //

    if (config.defaultDatabase) {
      console.log('Configured defaultDatabaseId: ', config.defaultDatabase);
      __defaultDatabaseId = config.defaultDatabase;
    }
  };
};

export const provideAppwrite = (config: AppwriteConfig): Provider[] => {
  return [
    {
      provide: ConfigToken,
      useValue: config,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppwrite,
      multi: true,
      deps: [ConfigToken],
    },
  ];
};
