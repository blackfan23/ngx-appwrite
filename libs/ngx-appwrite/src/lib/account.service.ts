import { Injectable } from '@angular/core';
import { Account, Models } from 'appwrite';
import {
  catchError,
  combineLatest,
  defer,
  distinctUntilKeyChanged,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { ClientService } from './client.service';
import { watch } from './helpers';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private _checkAuth$ = new Subject<boolean>();
  private _account: Account | undefined;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));

  public account$: Observable<Models.Account<Models.Preferences>> =
    this._client$.pipe(
      map((client) => new Account(client)),
      switchMap((account) => {
        return account.get();
      }),
      shareReplay(1)
    );

  public auth$: Observable<null | Models.Account<Models.Preferences>> =
    this._client$.pipe(
      switchMap((client) =>
        combineLatest([
          watch(client, 'account').pipe(startWith(null)),
          this._checkAuth$.pipe(startWith(null)),
        ]).pipe(
          switchMap(() =>
            defer(() =>
              this.account$.pipe(
                distinctUntilKeyChanged('$id'),
                catchError(() => {
                  console.error('Not Authenticated');
                  return of(null);
                })
              )
            )
          )
        )
      )
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
}
