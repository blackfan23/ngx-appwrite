import { Injectable } from '@angular/core';
import { Account, Models } from 'appwrite';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilKeyChanged,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ClientService } from './client.service';
import { watch } from './helpers';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private _checkAuth$ = new BehaviorSubject<boolean>(false);
  private _account: Account;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));

  public account$: Observable<Models.Account<Models.Preferences>> =
    this._client$.pipe(
      switchMap(() => {
        return this._account.get();
      }),
      shareReplay(1)
    );

  public auth$: Observable<null | Models.Account<Models.Preferences>> =
    this._client$.pipe(
      switchMap((client) =>
        combineLatest([
          watch(client, 'account').pipe(startWith(null)),
          this._checkAuth$,
        ]).pipe(
          debounceTime(10),
          tap(() => console.log('Triggering auth')),
          switchMap(() =>
            this.account$.pipe(
              distinctUntilKeyChanged('$id'),
              startWith(null),
              catchError((err, caught) => {
                if (err instanceof Error) console.warn(err.message);
                return caught;
              })
            )
          )
        )
      ),
      shareReplay(1)
    );

  constructor(private clientService: ClientService) {
    this._account = new Account(this.clientService.client);
  }

  triggerAuthCheck(): void {
    this._checkAuth$.next(true);
  }

  /**
   * Create Email Session
   *
   * Allow the user to login into their account by providing a valid email and
   * password combination. This route will create a new session for the user.
   *
   * A user is limited to 10 active sessions at a time by default. [Learn more
   * about session limits](/docs/authentication#limits).
   *
   * @param {string} email
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async createEmailSession(
    email: string,
    password: string
  ): Promise<Models.Session | undefined> {
    if (!this._account) {
      return this.createEmailSession(email, password);
    }
    const session = this._account?.createEmailSession(email, password);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Delete Sessions
   *
   * Delete all sessions from the user account and remove any sessions cookies
   * from the end client.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async deleteSessions(): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<{} | undefined> {
    if (!this._account) {
      return this.deleteSessions();
    }
    const result = this._account?.deleteSessions();
    this.triggerAuthCheck();
    return result;
  }
}
