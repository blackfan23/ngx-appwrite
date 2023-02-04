import { Injectable } from '@angular/core';
import { Account, ID, Models } from 'appwrite';
import {
  debounceTime,
  merge,
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
  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  private _account!: Account;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));
  private _watchAuthChannel$ = this._client$.pipe(
    switchMap((client) => watch(client, 'account').pipe(startWith(null)))
  );
  private _triggerManualAuthCheck$ = new Subject<boolean>();

  /* -------------------------------------------------------------------------- */
  /*                                  Reactive                                  */
  /* -------------------------------------------------------------------------- */

  public auth$: Observable<null | Models.Account<Models.Preferences>> = merge(
    this._watchAuthChannel$,
    this._triggerManualAuthCheck$
  ).pipe(
    switchMap(() => this._checkIfAuthExists()),
    debounceTime(50),
    shareReplay(1)
  );

  constructor(private clientService: ClientService) {
    this._account = new Account(this.clientService.client);
  }

  /* -------------------------------------------------------------------------- */
  /*    Default API - https://appwrite.io/docs/client/account?sdk=web-default   */
  /* -------------------------------------------------------------------------- */

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
  Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.create(email, password, customId, name);
    }
    const result = await this._account.create(customId, email, password, name);
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
  ): Promise<Models.Session> {
    if (!this._account) {
      return this.createEmailSession(email, password);
    }
    const session = await this._account.createEmailSession(email, password);
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
  createOAuth2Session(
    provider: string,
    success?: string,
    failure?: string,
    scopes?: string[]
  ): URL | void {
    if (!this._account) {
      return this.createOAuth2Session(provider, success, failure, scopes);
    }
    const session = this._account.createOAuth2Session(
      provider,
      success,
      failure,
      scopes
    );
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
  async createMagicURLSession(
    email: string,
    url?: string,
    customId: string = ID.unique()
  ): Promise<Models.Token> {
    if (!this._account) {
      return this.createMagicURLSession(customId, email, url);
    }
    return this._account.createMagicURLSession(customId, email, url);
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
  async updateMagicURLSession(
    userId: string,
    secret: string
  ): Promise<Models.Session> {
    if (!this._account) {
      return this.updateMagicURLSession(userId, secret);
    }
    const session = await this._account.updateMagicURLSession(userId, secret);
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
  async createPhoneSession(
    userId: string,
    phone: string
  ): Promise<Models.Token> {
    if (!this._account) {
      return this.createPhoneSession(userId, phone);
    }
    return this._account.createPhoneSession(userId, phone);
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
  async updatePhoneSession(
    userId: string,
    secret: string
  ): Promise<Models.Session> {
    if (!this._account) {
      return this.updatePhoneSession(userId, secret);
    }
    const session = await this._account.updatePhoneSession(userId, secret);
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
  async createAnonymousSession(): Promise<Models.Session> {
    if (!this._account) {
      return this.createAnonymousSession();
    }
    const session = await this._account.createAnonymousSession();
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
  async createJWT(): Promise<Models.Jwt> {
    if (!this._account) {
      return this.createJWT();
    }
    return this._account.createJWT();
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
    return this._account.get();
  }
  /**
   * Get Account Preferences
   *
   * Get currently logged in user preferences as a key-value object.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async getPrefs(): Promise<Models.Preferences> {
    if (!this._account) {
      return this.getPrefs();
    }
    return this._account.getPrefs();
  }
  /**
   * List Sessions
   *
   * Get currently logged in user list of active sessions across different
   * devices.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async listSessions(): Promise<Models.SessionList> {
    if (!this._account) {
      return this.listSessions();
    }
    return this._account.listSessions();
  }
  /**
   * List Logs
   *
   * Get currently logged in user list of latest security activity logs. Each
   * log returns user IP address, location and date and time of log.
   *
   * @param {string[]} queries
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async listLogs(queries: string[] = []): Promise<Models.LogList> {
    if (!this._account) {
      return this.listLogs(queries);
    }
    return this._account.listLogs(queries);
  }
  /**
   * Get Session
   *
   * Use this endpoint to get a logged in user's session using a Session ID.
   * Inputting 'current' will return the current session being used.
   *
   * @param {string} sessionId
   * default is 'current' session
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async getSession(sessionId: string = 'current'): Promise<Models.Session> {
    if (!this._account) {
      return this.getSession(sessionId);
    }
    return this._account.getSession(sessionId);
  }
  /**
   * Update Name
   *
   * Update currently logged in user account name.
   *
   * @param {string} name
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateName(name: string): Promise<Models.Preferences> {
    if (!this._account) {
      return this.updateName(name);
    }
    return this._account.updateName(name);
  }
  /**
   * Update Password
   *
   * Update currently logged in user password. For validation, user is required
   * to pass in the new password, and the old password. For users created with
   * OAuth, Team Invites and Magic URL, oldPassword is optional.
   *
   * @param {string} password
   * @param {string} oldPassword
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updatePassword(
    name: string,
    oldPassword?: string
  ): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.updatePassword(name, oldPassword);
    }
    return this._account.updatePassword(name, oldPassword);
  }
  /**
   * Update Email
   *
   * Update currently logged in user account email address. After changing user
   * address, the user confirmation status will get reset. A new confirmation
   * email is not sent automatically however you can use the send confirmation
   * email endpoint again to send the confirmation email. For security measures,
   * user password is required to complete this request.
   * This endpoint can also be used to convert an anonymous account to a normal
   * one, by passing an email address and a new password.
   *
   *
   * @param {string} email
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateEmail(
    email: string,
    password: string
  ): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.updateEmail(email, password);
    }
    return this._account.updateEmail(email, password);
  }
  /**
   * Update Phone
   *
   * Update the currently logged in user's phone number. After updating the
   * phone number, the phone verification status will be reset. A confirmation
   * SMS is not sent automatically, however you can use the [POST
   * /account/verification/phone](/docs/client/account#accountCreatePhoneVerification)
   * endpoint to send a confirmation SMS.
   *
   * @param {string} phone
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updatePhone(
    phoneNumber: string,
    password: string
  ): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.updatePhone(phoneNumber, password);
    }
    return this._account.updatePhone(phoneNumber, password);
  }

  /**
   * Update Preferences
   *
   * Update currently logged in user account preferences. The object you pass is
   * stored as is, and replaces any previous value. The maximum allowed prefs
   * size is 64kB and throws error if exceeded.
   *
   * @param {object} prefs
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updatePrefs(
    prefs: Models.Preferences
  ): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return await this.updatePrefs(prefs);
    }
    return this._account.updatePrefs(prefs);
  }

  /**
   * Update Status
   *
   * Block the currently logged in user account. Behind the scene, the user
   * record is not deleted but permanently blocked from any access. To
   * completely delete a user, use the Users API instead.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateStatus(): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.updateStatus();
    }
    const session = await this._account.updateStatus();
    this.triggerAuthCheck();
    return session;
  }
  /**
   * Delete Session
   *
   * Use this endpoint to log out the currently logged in user from all their
   * account sessions across all of their different devices. When using the
   * Session ID argument, only the unique session ID provided is deleted.
   *
   *
   * @param {string} sessionId
   * defaults to 'current'
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async deleteSession(
    sessionId: string = 'current'
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<{}> {
    if (!this._account) {
      return this.deleteSession();
    }
    const result = await this._account.deleteSession(sessionId);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Update OAuth Session (Refresh Tokens)
   *
   * Access tokens have limited lifespan and expire to mitigate security risks.
   * If session was created using an OAuth provider, this route can be used to
   * "refresh" the access token.
   *
   * @param {string} sessionId
   * defaults to 'current'
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateSession(
    sessionId: string = 'current'
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<{}> {
    if (!this._account) {
      return this.updateSession(sessionId);
    }
    const result = await this._account.updateSession(sessionId);
    this.triggerAuthCheck();
    return result;
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
  Promise<{}> {
    if (!this._account) {
      return this.deleteSessions();
    }
    const result = await this._account.deleteSessions();
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
  Promise<Models.Token> {
    if (!this._account) {
      return this.createRecovery(email, url);
    }
    const result = await this._account.createRecovery(email, url);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Create Password Recovery (confirmation)
   *
   * Use this endpoint to complete the user account password reset. Both the
   * **userId** and **secret** arguments will be passed as query parameters to
   * the redirect URL you have provided when sending your request to the [POST
   * /account/recovery](/docs/client/account#accountCreateRecovery) endpoint.
   *
   * Please note that in order to avoid a [Redirect
   * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md)
   * the only valid redirect URLs are the ones from domains you have set when
   * adding your platforms in the console interface.
   *
   * @param {string} userId
   * @param {string} secret
   * @param {string} password
   * @param {string} passwordAgain
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateRecovery(
    userId: string,
    secret: string,
    password: string,
    passwordAgain: string
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
    if (!this._account) {
      return this.updateRecovery(userId, secret, password, passwordAgain);
    }
    const result = await this._account.updateRecovery(
      userId,
      secret,
      password,
      passwordAgain
    );
    this.triggerAuthCheck();
    return result;
  }
  /**
   * Create Email Verification
   *
   * Use this endpoint to send a verification message to your user email address
   * to confirm they are the valid owners of that address. Both the **userId**
   * and **secret** arguments will be passed as query parameters to the URL you
   * have provided to be attached to the verification email. The provided URL
   * should redirect the user back to your app and allow you to complete the
   * verification process by verifying both the **userId** and **secret**
   * parameters. Learn more about how to [complete the verification
   * process](/docs/client/account#accountUpdateEmailVerification). The
   * verification link sent to the user's email address is valid for 7 days.
   *
   * Please note that in order to avoid a [Redirect
   * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md),
   * the only valid redirect URLs are the ones from domains you have set when
   * adding your platforms in the console interface.
   *
   *
   * @param {string} url
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async createVerification(
    url: string
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
    if (!this._account) {
      return this.createVerification(url);
    }
    const result = await this._account.createVerification(url);
    this.triggerAuthCheck();
    return result;
  }
  /**
   * Create Email Verification (confirmation)
   *
   * Use this endpoint to complete the user email verification process. Use both
   * the **userId** and **secret** parameters that were attached to your app URL
   * to verify the user email ownership. If confirmed this route will return a
   * 200 status code.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateVerification(
    userId: string,
    secret: string
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
    if (!this._account) {
      return this.updateVerification(userId, secret);
    }
    const result = await this._account.updateVerification(userId, secret);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Create Phone Verification
   *
   * Use this endpoint to send a verification SMS to the currently logged in
   * user. This endpoint is meant for use after updating a user's phone number
   * using the [accountUpdatePhone](/docs/client/account#accountUpdatePhone)
   * endpoint. Learn more about how to [complete the verification
   * process](/docs/client/account#accountUpdatePhoneVerification). The
   * verification code sent to the user's phone number is valid for 15 minutes.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async createPhoneVerification(): Promise<Models.Token> {
    if (!this._account) {
      return this.createPhoneVerification();
    }
    const result = await this._account.createPhoneVerification();
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Create Phone Verification (confirmation)
   *
   * Use this endpoint to complete the user phone verification process. Use the
   * **userId** and **secret** that were sent to your user's phone number to
   * verify the user email ownership. If confirmed this route will return a 200
   * status code.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updatePhoneVerification(
    userId: string,
    secret: string
  ): Promise<Models.Token> {
    if (!this._account) {
      return this.updatePhoneVerification(userId, secret);
    }
    const result = await this._account.updatePhoneVerification(userId, secret);
    this.triggerAuthCheck();
    return result;
  }

  /* -------------------------------------------------------------------------- */
  /*                          Additional functionality                          */
  /* -------------------------------------------------------------------------- */

  /**
   * Convert Anonymous account with password
   *
   * This endpoint is a shortcut in order to convert an anonymous account
   * to a permanent one
   *
   * @param {string} email
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async convertAnonymousAccountWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.convertAnonymousAccountWithEmailAndPassword(email, password);
    }
    const session = await this._account.updateEmail(email, password);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Block Account - This is a renaming of the >> Update Status << API method
   *
   * Block the currently logged in user account. Behind the scene, the user
   * record is not deleted but permanently blocked from any access. To
   * completely delete a user, use the Users API instead.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async blockAccount(): Promise<Models.Account<Models.Preferences>> {
    if (!this._account) {
      return this.blockAccount();
    }
    const session = await this._account.updateStatus();
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Logout - Shortcut for  deletesession
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async logout(): Promise<{}> {
    if (!this._account) {
      return this.logout();
    }
    return this.deleteSession('current');
  }

  /**
   * Triggering the Auth Check
   *
   * Trigger a check of all account and
   * session-related actions to enable
   * reactive monitoring of authentication status
   * @returns {void}
   */
  triggerAuthCheck(): void {
    this._triggerManualAuthCheck$.next(true);
  }

  private async _checkIfAuthExists(): Promise<null | Models.Account<Models.Preferences>> {
    try {
      const something = await this._account.get();
      return something;
    } catch (error) {
      console.warn(error);
      return null;
    }
  }
}
