import { ApplicationConfig } from '@angular/core';
import { provideAppwrite } from 'ngx-appwrite';
import { SECRETS } from './secrets.env';

// test data for later
export const TEST_COLLECTION = '65fc3a62a07dbc4f3dc8';
export const TEST_DATA = {
  name: 'John Doe',
  age: 33,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppwrite({
      endpoint: SECRETS.SERVER_URL,
      project: SECRETS.PROJECT_ID,
      defaultDatabase: SECRETS.DEFAULT_DATABASE,
    }),
  ],
};
