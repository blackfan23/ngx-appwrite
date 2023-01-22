import * as crypto from 'crypto';
import { cloneDeep } from 'lodash';
import { catchError, EMPTY } from 'rxjs';
import { AccountService } from './lib/account.service';
import { Appwrite } from './lib/appwrite.service';
import { ClientService } from './lib/client.service';
import { DatabasesService } from './lib/databases.service';
import { TeamsService } from './lib/teams.service';
import { TEST_CONFIG, USER_DATA } from './test-db';

const TEST_COLLECTION = '63b82fa8d35fde002a92';
const TEST_DOCUMENT_ID = '63b8302ec685aeebe0d3';
const WRONG_DOCUMENT_ID = 'iififni33fnnfnaa';
interface TestDocument {
  firstName: string;
  lastName: string;
  age: number;
  profession: string;
}

const TEST_DOCUMENT: TestDocument = {
  firstName: 'Mark',
  lastName: 'Madlock',
  age: 32,
  profession: 'Teacher',
};

const BUCKET_ID = '63bc4cdf1bed091fecec';

const SERVICES = [
  new ClientService(TEST_CONFIG),
  new AccountService(new ClientService(TEST_CONFIG)),
];

describe('NgxAppwrite', () => {
  let appwriteService: Appwrite;

  beforeEach(async () => {
    appwriteService = new Appwrite(
      new DatabasesService(
        new ClientService(TEST_CONFIG),
        new AccountService(new ClientService(TEST_CONFIG))
      ),
      new TeamsService(
        new ClientService(TEST_CONFIG),
        new AccountService(new ClientService(TEST_CONFIG))
      ),
      new AccountService(new ClientService(TEST_CONFIG))
    );
  });

  it('Appwrite should be defined', () => {
    expect(appwriteService).toBeTruthy();
  });

  it('Appwrite should get collectiondata and checks that is looks as expected', (done) => {
    appwriteService.databases
      .collection$<TestDocument>(TEST_COLLECTION)
      .pipe(
        catchError((e) => {
          console.log(e);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        expect(res.length).toBeGreaterThanOrEqual(1);
        expect(res[0]).toHaveProperty('$id');
        expect(res[0]).toEqual(expect.objectContaining(TEST_DOCUMENT));

        done();
      });
  });

  it('Appwrite should get document data and checks that is looks as expected', (done) => {
    appwriteService.databases
      .document$<TestDocument>(TEST_COLLECTION, TEST_DOCUMENT_ID)
      .pipe(
        catchError((e) => {
          console.log(e);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        expect(res).toHaveProperty('$id');
        expect(res).toEqual(expect.objectContaining(TEST_DOCUMENT));

        done();
      });
  });
  it('Appwrite should return null when targeting non-existing document', (done) => {
    appwriteService.databases
      .document$<TestDocument>(TEST_COLLECTION, WRONG_DOCUMENT_ID)
      .pipe(
        catchError((e) => {
          console.log(e);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        expect(res).toBeNull();

        done();
      });
  });
  it('Appwrite should be able to create update and delete a document while not authenticated on an open Collection', async () => {
    const CLONED_TEST_DOCUMENT = cloneDeep(TEST_DOCUMENT);

    const RANDOM_ID = generateRandomString();
    /* ----------------------------- createDocument ---------------------------- */
    const createdDocument =
      await appwriteService.databases.createDocument<TestDocument>(
        TEST_COLLECTION,
        CLONED_TEST_DOCUMENT,
        [],
        RANDOM_ID
      );
    expect(createdDocument).toHaveProperty('$id');
    expect(createdDocument).toEqual(
      expect.objectContaining(CLONED_TEST_DOCUMENT)
    );
    /* ----------------------------- updateDocument ----------------------------- */
    CLONED_TEST_DOCUMENT.firstName = 'New';
    CLONED_TEST_DOCUMENT.lastName = 'Person';
    const updatedDocument =
      await appwriteService.databases.updateDocument<TestDocument>(
        TEST_COLLECTION,
        RANDOM_ID,
        CLONED_TEST_DOCUMENT
      );
    expect(updatedDocument).toHaveProperty('$id');
    expect(updatedDocument).toEqual(
      expect.objectContaining(CLONED_TEST_DOCUMENT)
    );
    /* ----------------------------- deleteDocument ----------------------------- */
    const deletedDocument = await appwriteService.databases.deleteDocument(
      TEST_COLLECTION,
      RANDOM_ID
    );
    expect(deletedDocument).toStrictEqual({ message: '' });
  });

  it('auth$ return null if unauthenticated', (done) => {
    appwriteService.account.auth$.subscribe((auth) => {
      expect(auth).toBeNull();
      done();
    });
  });

  it('auth$ should fire on signin', (done) => {
    appwriteService.account.auth$.subscribe((auth) => {
      if (auth) {
        expect(auth.email).toEqual(USER_DATA.email);
        done();
      }

      expect(auth).toBeNull();
    });

    setTimeout(() => {
      appwriteService.account.createEmailSession(
        USER_DATA.email,
        USER_DATA.password
      );
    }, 200);
  });

  it('should return an observable of type Models.Account<Models.Preferences> when logged in', (done) => {
    appwriteService.account
      .createEmailSession(USER_DATA.email, USER_DATA.password)
      .then(() => {
        appwriteService.account.account$.subscribe((account) => {
          expect(account).toBeDefined();
          expect(account.prefs).toBeDefined();
          done();
        });
      });
  });

  xit('should send an recovery email', (done) => {
    appwriteService.account
      .createEmailSession(USER_DATA.email, USER_DATA.password)
      .then(() => {
        appwriteService.account.createRecovery(
          USER_DATA.email,
          'https://appwrite.nas4.us'
        );
        done();
      });
  });
});

function generateRandomString(length: number = 16): string {
  return crypto.randomBytes(16).toString('hex').slice(0, length);
}
