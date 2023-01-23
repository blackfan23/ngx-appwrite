import { TEST_CONFIG, USER_DATA } from '../test-db';
import { AccountService } from './account.service';
import { Appwrite } from './appwrite.service';
import { ClientService } from './client.service';
import { DatabasesService } from './databases.service';
import { TeamsService } from './teams.service';

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
