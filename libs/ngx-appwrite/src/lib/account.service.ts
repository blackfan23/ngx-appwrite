import { Injectable } from '@angular/core';
import { Account, ID, Models } from 'appwrite';
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
  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */
  private _checkAuth$ = new BehaviorSubject<boolean>(false);
  private _account!: Account;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));
  /* -------------------------------------------------------------------------- */
  /*                                  Reactive                                  */
  /* -------------------------------------------------------------------------- */
  public account$: Observable<Models.Account<Models.Preferences>> =
    this._client$.pipe(
      switchMap(() => this.get()),
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

  /**
   * Create Account
   *
   * Use this endpoint to allow a new user to register a new account in your
   * project. After the user registration completes successfully, you can use
   * the [/account/verfication](/docs/client/account#accountCreateVerification)
   * route to start verifying the user email address. To allow the new user to
   * login to their new account, you need to create a new [account
   * session](/docs/client/account#accountCreateSession).
   *
   * @param {string} email
   * @param {string} password
   * @param {string} name
   * @param {string} customId
   * Defaults to ID.unique()
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async create(
    email: string,
    password: string,
    name?: string,
    customId: string = ID.unique()
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Account<Models.Preferences> | undefined> {
    if (!this._account) {
      return this.create(email, password, customId, name);
    }
    const result = this._account.create(customId, email, password, name);
    this.triggerAuthCheck();
    return result;
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
    const session = this._account.createEmailSession(email, password);
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Create OAuth2 Session
   *
   * Allow the user to login to their account using the OAuth2 provider of their
   * choice. Each OAuth2 provider should be enabled from the Appwrite console
   * first. Use the success and failure arguments to provide a redirect URL's
   * back to your app when login is completed.
   *
   * If there is already an active session, the new session will be attached to
   * the logged-in account. If there are no active sessions, the server will
   * attempt to look for a user with the same email address as the email
   * received from the OAuth2 provider and attach the new session to the
   * existing user. If no matching user is found - the server will create a new
   * user.
   *
   * A user is limited to 10 active sessions at a time by default. [Learn more
   * about session limits](/docs/authentication#limits).
   *
   *
   * @param {string} provider
   * @param {string} success
   * @param {string} failure
   * @param {string[]} scopes
   * @throws {AppwriteException}
   * @returns {void|string}
   */
  async createOAuth2Session(
    provider: string,
    success?: string,
    failure?: string,
    scopes?: string[]
  ): Promise<URL | void> {
    if (!this._account) {
      return this.createOAuth2Session(provider, success, failure, scopes);
    }
    const session = this._account.createOAuth2Session(
      provider,
      success,
      failure,
      scopes
    );
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Magic URL session
   *
   * Sends the user an email with a secret key for creating a session. If the
   * provided user ID has not be registered, a new user will be created. When
   * the user clicks the link in the email, the user is redirected back to the
   * URL you provided with the secret key and userId values attached to the URL
   * query string. Use the query string parameters to submit a request to the
   * [PUT
   * /account/sessions/magic-url](/docs/client/account#accountUpdateMagicURLSession)
   * endpoint to complete the login process. The link sent to the user's email
   * address is valid for 1 hour. If you are on a mobile device you can leave
   * the URL parameter empty, so that the login completion will be handled by
   * your Appwrite instance by default.
   *
   * A user is limited to 10 active sessions at a time by default. [Learn more
   * about session limits](/docs/authentication#limits).
   *
   * @param {string} email
   * @param {string} url
   * @param {string} customId
   * Defaults to ID.unique()
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createMagicURLSession(
    email: string,
    url?: string,
    customId: string = ID.unique()
  ): Promise<Models.Token> {
    if (!this._account) {
      return this.createMagicURLSession(customId, email, url);
    }
    const session = this._account.createMagicURLSession(customId, email, url);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Magic URL session (confirmation)
   *
   * Use this endpoint to complete creating the session with the Magic URL. Both
   * the **userId** and **secret** arguments will be passed as query parameters
   * to the redirect URL you have provided when sending your request to the
   * [POST
   * /account/sessions/magic-url](/docs/client/account#accountCreateMagicURLSession)
   * endpoint.
   *
   * Please note that in order to avoid a [Redirect
   * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md)
   * the only valid redirect URLs are the ones from domains you have set when
   * adding your platforms in the console interface.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  updateMagicURLSession(
    userId: string,
    secret: string
  ): Promise<Models.Session> {
    if (!this._account) {
      return this.updateMagicURLSession(userId, secret);
    }
    const session = this._account.updateMagicURLSession(userId, secret);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Phone session
   *
   * Sends the user an SMS with a secret key for creating a session. If the
   * provided user ID has not be registered, a new user will be created. Use the
   * returned user ID and secret and submit a request to the [PUT
   * /account/sessions/phone](/docs/client/account#accountUpdatePhoneSession)
   * endpoint to complete the login process. The secret sent to the user's phone
   * is valid for 15 minutes.
   *
   * A user is limited to 10 active sessions at a time by default. [Learn more
   * about session limits](/docs/authentication#limits).
   *
   * @param {string} userId
   * @param {string} phone
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createPhoneSession(userId: string, phone: string): Promise<Models.Token> {
    if (!this._account) {
      return this.createPhoneSession(userId, phone);
    }
    const session = this._account.createPhoneSession(userId, phone);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Phone Session (confirmation)
   *
   * Use this endpoint to complete creating a session with SMS. Use the
   * **userId** from the
   * [createPhoneSession](/docs/client/account#accountCreatePhoneSession)
   * endpoint and the **secret** received via SMS to successfully update and
   * confirm the phone session.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  updatePhoneSession(userId: string, secret: string): Promise<Models.Session> {
    if (!this._account) {
      return this.updatePhoneSession(userId, secret);
    }
    const session = this._account.updatePhoneSession(userId, secret);
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Create Anonymous Session
   *
   * Use this endpoint to allow a new user to register an anonymous account in
   * your project. This route will also create a new session for the user. To
   * allow the new user to convert an anonymous account to a normal account, you
   * need to update its [email and
   * password](/docs/client/account#accountUpdateEmail) or create an [OAuth2
   * session](/docs/client/account#accountCreateOAuth2Session).
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createAnonymousSession(): Promise<Models.Session> {
    if (!this._account) {
      return this.createAnonymousSession();
    }
    const session = this._account.createAnonymousSession();
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Create JWT
   *
   * Use this endpoint to create a JSON Web Token. You can use the resulting JWT
   * to authenticate on behalf of the current user when working with the
   * Appwrite server-side API and SDKs. The JWT secret is valid for 15 minutes
   * from its creation and will be invalid if the user will logout in that time
   * frame.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createJWT(): Promise<Models.Jwt> {
    if (!this._account) {
      return this.createJWT();
    }
    const session = this._account.createJWT();
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Get Account
   *
   * Get currently logged in user data as JSON object.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  get(): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.get();
    }
    const session = this._account.get();
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Get Account Preferences
   *
   * Get currently logged in user preferences as a key-value object.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  getPrefs(): Promise<Models.Preferences> {
    if (!this._account) {
      return this.getPrefs();
    }
    const session = this._account.getPrefs();
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
    const result = this._account.deleteSessions();
    this.triggerAuthCheck();
    return result;
  }
  /**
   * Create Password Recovery
   *
   * Sends the user an email with a temporary secret key for password reset.
   * When the user clicks the confirmation link he is redirected back to your
   * app password reset URL with the secret key and email address values
   * attached to the URL query string. Use the query string params to submit a
   * request to the [PUT
   * /account/recovery](/docs/client/account#accountUpdateRecovery) endpoint to
   * complete the process. The verification link sent to the user's email
   * address is valid for 1 hour.
   *
   * @param {string} email
   * @param {string} url
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async createRecovery(
    email: string,
    url: string
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token | undefined> {
    if (!this._account) {
      return this.createRecovery(email, url);
    }
    const result = this._account.createRecovery(email, url);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Triggering the Auth Check
   *
   * Trigger a review of all account and
   * session-related actions to enable
   * reactive monitoring of authentication status
   *
   */
  triggerAuthCheck(): void {
    this._checkAuth$.next(true);
  }
}
