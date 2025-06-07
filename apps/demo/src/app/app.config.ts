import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAppwrite } from 'ngx-appwrite';
import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { SECRETS } from './secrets.env';

addRxPlugin(RxDBDevModePlugin);

// test data for later
export const TEST_COLLECTION = '65fc3a62a07dbc4f3dc8';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppwrite({
      endpoint: SECRETS.SERVER_URL,
      project: SECRETS.PROJECT_ID,
      defaultDatabase: SECRETS.DEFAULT_DATABASE,
    }),
    provideZonelessChangeDetection(),
  ],
};
