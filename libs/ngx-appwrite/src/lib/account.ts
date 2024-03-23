import { Injectable } from '@angular/core';
import {
  Account as AppwriteAccount,
  AuthenticationFactor,
  AuthenticatorType,
  ID,
  Models,
  OAuthProvider,
} from 'appwrite';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { deepEqual, watch } from './helpers';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Account {
  /* -------------------------------------------------------------------------- */
  /*                                    Setup                                   */
  /* -------------------------------------------------------------------------- */

  private _account!: AppwriteAccount;
  private _client$ = of(CLIENT()).pipe(shareReplay(1));
  private _watchAuthChannel$ = this._client$.pipe(
    switchMap((client) => watch(client, 'account').pipe(startWith(null))),
  );
  private _triggerManualAuthCheck$ = new Subject<boolean>();

  private _auth$: unknown | undefined;

  /* -------------------------------------------------------------------------- */
  /*                                  Reactive                                  */
  /* -------------------------------------------------------------------------- */

  // eslint-disable-next-line @typescript-eslint/ban-types

  constructor() {
    this._account = new AppwriteAccount(CLIENT());
  }

  onAuth<
    TPrefs extends Models.Preferences,
  >(): Observable<Models.User<TPrefs> | null> {
    try {
      if (!this._auth$) {
        this._auth$ = merge(
          this._watchAuthChannel$,
          this._triggerManualAuthCheck$,
        ).pipe(
          switchMap(() => this._checkIfAuthExists()),
          debounceTime(50),
          map((account) => {
            if (!account) return null;
            return account as Models.User<TPrefs>;
          }),
          distinctUntilChanged(deepEqual),
          shareReplay(1),
        );
      }

      return this._auth$ as Observable<Models.User<TPrefs> | null>;
    } catch (error) {
      console.error('Error in Account > onAuth');
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*    Default API - https://appwrite.io/docs/client/account?sdk=web-default   */
  /* -------------------------------------------------------------------------- */

  /**
   * Get Account
   *
   * Get currently logged in user data as JSON object.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async get<TPrefs extends Models.Preferences>() {
    try {
      const account = await this._account.get();
      return account as Models.User<TPrefs>;
    } catch (error) {
      console.error('Error fetching account');
      throw error;
    }
  }

  /**
   * Create Account
   *
   * Use this endpoint to allow a new user to register a new account in your project.
   * After the user registration completes successfully, you can use the /account/verfication route
   * to start verifying the user email address. To allow the new user to login to their new account,
   * you need to create a new account session.
   *
   * @param {string} email
   * @param {string} password
   * @param {Models.Preferences} defaultPrefs
   * @param {string} name
   * @param {string} userId
   * Defaults to ID.unique()
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<T>>}
   */
  async create<T extends Models.Preferences>(
    email: string,
    password: string,
    defaultPrefs: T = {} as T,
    name?: string,
    userId: string = ID.unique(),
  ): Promise<Models.User<T>> {
    const account = await this._account.create(userId, email, password, name);
    this.triggerAuthCheck();
    await this.updatePrefs(defaultPrefs);
    return account as Models.User<T>;
  }

  /**
   * Update Email
   *
   * Update currently logged in user account email address.
   * After changing user address, the user confirmation status will get reset.
   * A new confirmation email is not sent automatically however you can use the
   * send confirmation email endpoint again to send the confirmation email.
   * For security measures, user password is required to complete this request.
   * This endpoint can also be used to convert an anonymous account to a normal one,
   * by passing an email address and a new password.
   *
   *
   * @param {string} email
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updateEmail<TPrefs extends Models.Preferences>(
    email: string,
    password: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updateEmail(email, password);
  }

  /**
   * List Identities
   *
   * Get the list of identities for the currently logged in user.
   *
   *
   * @param {string[]} queries
   * @throws {AppwriteException}
   * @returns {Promise<Models.IdentityList>}
   */
  async listIdentities(queries: string[] = []): Promise<Models.IdentityList> {
    return this._account.listIdentities(queries);
  }

  /**
   * Delete Identity
   *
   * Delete a user identity by id.
   *
   *
   * @param {string} id
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async deleteIdentity(id: string): Promise<{}> {
    return this._account.deleteIdentity(id);
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
   * @returns {Promise<Models.Jwt>}
   */
  async createJWT(): Promise<Models.Jwt> {
    return await this._account.createJWT();
  }

  /**
   * List Logs
   *
   * Get the list of latest security activity logs for the currently logged in user.
   * Each log returns user IP address, location and date and time of log.
   *
   * @param {string[]} queries
   * @throws {AppwriteException}
   * @returns {Promise<AppwriteLogListObject>}
   */
  async listLogs(queries: string[] = []): Promise<Models.LogList> {
    return this._account.listLogs(queries);
  }

  /**
   * Update MFA
   *
   * Enable or disable MFA on an account.
   *
   * @param {boolean} enableMFA
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updateMFA<TPrefs extends Models.Preferences>(
    enableMFA: boolean,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updateMFA(enableMFA);
  }

  /**
   * Add Authenticator
   *
   * Add an authenticator app to be used as an MFA factor.
   * Verify the authenticator using the verify authenticator method.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaType>}
   */
  async createMfaAuthenticator(): Promise<Models.MfaType> {
    return this._account.createMfaAuthenticator(AuthenticatorType.Totp);
  }

  /**
   * Verify Authenticator
   *
   * Verify an authenticator app after adding it using the add authenticator method.
   *
   * @param {string} otp
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updateMfaAuthenticator<TPrefs extends Models.Preferences>(
    otp: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updateMfaAuthenticator(
      AuthenticatorType.Totp, // type
      otp, // otp
    );
  }

  /**
   * Delete Authenticator
   *
   * Delete an authenticator for a user.
   * Verify the authenticator using the verify authenticator method.
   * @param {string} otp
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async deleteMfaAuthenticator<TPrefs extends Models.Preferences>(
    otp: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.deleteMfaAuthenticator(AuthenticatorType.Totp, otp);
  }

  /**
   * Create 2FA Challenge
   *
   * Begin the process of MFA verification after sign-in.
   * Finish the flow with updateMfaChallenge method.
   *
   * @param {AuthenticationFactor} factor
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaChallenge>}
   */
  async createMfaChallenge(
    factor: AuthenticationFactor,
  ): Promise<Models.MfaChallenge> {
    return this._account.createMfaChallenge(factor);
  }

  /**
   * Create MFA Challenge (confirmation)
   *
   * Complete the MFA challenge by providing the one-time password.
   * Finish the process of MFA verification by providing the one-time password.
   * To begin the flow, use createMfaChallenge method.
   *
   * @param {string} challengeId
   * @param {string} otp
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  async updateMfaChallenge(
    challengeId: string,
    otp: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<{}> {
    return this._account.updateMfaChallenge(challengeId, otp);
  }

  /**
   * List Factors
   *
   * List the factors available on the account to be used as a MFA challange.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaFactors>}
   */
  async listMfaFactors(): Promise<Models.MfaFactors> {
    return this._account.listMfaFactors();
  }

  /**
   * Get MFA Recovery Codes
   *
   * Get recovery codes that can be used as backup for MFA flow.
   * Before getting codes, they must be generated using createMfaRecoveryCodes method.
   * An OTP challenge is required to read recovery codes.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaRecoveryCodes>}
   */
  async getMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.getMfaRecoveryCodes();
  }

  /**
   * Create MFA Recovery Codes
   *
   * Generate recovery codes as backup for MFA flow.
   * It's recommended to generate and show then immediately after user
   * successfully adds their authehticator. Recovery codes can be used as a MFA
   * verification type in createMfaChallenge method.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaRecoveryCodes>}
   */
  async createMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.createMfaRecoveryCodes();
  }

  /**
   * Regenerate MFA Recovery Codes
   *
   * Regenerate recovery codes that can be used as backup for MFA flow.
   * Before regenerating codes, they must be first generated using
   * createMfaRecoveryCodes method. An OTP challenge is required to regenreate
   * recovery codes.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.MfaRecoveryCodes>}
   */
  async updateMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.updateMfaRecoveryCodes();
  }

  /**
   * Update Name
   *
   * Update currently logged in user account name.
   *
   * @param {string} name
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updateName<TPrefs extends Models.Preferences>(
    name: string,
  ): Promise<Models.User<TPrefs>> {
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
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updatePassword<TPrefs extends Models.Preferences>(
    password: string,
    oldPassword?: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePassword(password, oldPassword);
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
   * @param {string} phoneNumber
   * @param {string} password
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updatePhone<TPrefs extends Models.Preferences>(
    phoneNumber: string,
    password: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePhone(phoneNumber, password);
  }

  /**
   * Get Account Preferences
   *
   * Get the preferences as a key-value object for the currently logged in user.
   *
   * @throws {AppwriteException}
   * @returns {Promise<TPrefs>}
   */
  async getPrefs<TPrefs extends Models.Preferences>(): Promise<TPrefs> {
    return this._account.getPrefs() as Promise<TPrefs>;
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
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updatePrefs<TPrefs extends Models.Preferences>(
    prefs: TPrefs,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePrefs(prefs) as Promise<Models.User<TPrefs>>;
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
   * @returns {Promise<Models.Token>}
   */
  async createRecovery(
    email: string,
    url: string,
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
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
   * @throws {AppwriteException}
   * @returns {Promise<Models.Toke>}
   */
  async updateRecovery(
    userId: string,
    secret: string,
    password: string,
  ): Promise<Models.Token> {
    const result = await this._account.updateRecovery(userId, secret, password);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * List Sessions
   *
   * Get currently logged in user list of active sessions across different
   * devices.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.SessionList>}
   */
  async listSessions(): Promise<Models.SessionList> {
    return this._account.listSessions();
  }

  /**
   * Delete Sessions
   *
   * Delete all sessions from the user account and remove any sessions cookies
   * from the end client.
   *
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  async deleteSessions(): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<{}> {
    const result = await this._account.deleteSessions();
    this.triggerAuthCheck();
    return result;
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
   * @returns {Promise<Models.Session>}
   */
  async createAnonymousSession(): Promise<Models.Session> {
    const session = await this._account.createAnonymousSession();
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create email password session
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
   * @returns {Promise<Models.Session>}
   */
  async createEmailPasswordSession(
    email: string,
    password: string,
  ): Promise<Models.Session> {
    const session = await this._account.createEmailPasswordSession(
      email,
      password,
    );
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Magic URL session (confirmation)
   *
   * Use this endpoint to create a session from token.
   * Provide the userId and secret parameters from the successful response
   * of authentication flows initiated by token creation. For example,
   * magic URL and phone login.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise<Models.Session>}
   */
  async updateMagicURLSession(
    userId: string,
    secret: string,
  ): Promise<Models.Session> {
    const session = await this._account.updateMagicURLSession(userId, secret);
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
   * @param {OAuthProvider} provider
   * @param {string} success
   * @param {string} failure
   * @param {string[]} scopes
   * @throws {AppwriteException}
   * @returns {void|string}
   */
  createOAuth2Session(
    provider: OAuthProvider,
    success?: string,
    failure?: string,
    scopes?: string[],
  ): URL | void {
    const url = this._account.createOAuth2Session(
      provider,
      success,
      failure,
      scopes,
    );
    return url;
  }

  /**
   * Update phone session
   *
   * Use this endpoint to create a session from token.
   * Provide the userId and secret parameters from the successful
   * response of authentication flows initiated by token creation.
   * For example, magic URL and phone login.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise<Models.Session>}
   */
  async updatePhoneSession(
    userId: string,
    secret: string,
  ): Promise<Models.Session> {
    const session = await this._account.updatePhoneSession(userId, secret);
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create session
   *
   * Use this endpoint to create a session from token.
   * Provide the userId and secret parameters from the successful
   * response of authentication flows initiated by token creation.
   * For example, magic URL and phone login.
   *
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise<Models.Session>}
   */
  async createSession(userId: string, secret: string): Promise<Models.Session> {
    const session = await this._account.createSession(userId, secret);
    this.triggerAuthCheck();
    return session;
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
   * @returns {Promise<Models.Session>}
   */
  async getSession(sessionId = 'current'): Promise<Models.Session> {
    try {
      const session = await this._account.getSession(sessionId);
      return session;
    } catch (error) {
      throw new Error(
        `Could not retrieve Appwrite session for id: ${sessionId} `,
      );
    }
  }

  /**
   * Update session
   *
   * Use this endpoint to extend a session's length.
   * Extending a session is useful when session expiry is short.
   * If the session was created using an OAuth provider,
   * this endpoint refreshes the access token from the provider.
   *
   * @param {string} sessionId
   * defaults to 'current'
   * @throws {AppwriteException}
   * @returns {Promise<Models.Session>}
   */
  async updateSession(
    sessionId = 'current',
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Session> {
    const result = await this._account.updateSession(sessionId);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Delete Session
   *
   * Logout the user. Use 'current' as the session ID to logout on this device,
   * use a session ID to logout on another device.
   * If you're looking to logout the user on all devices, use Delete Sessions instead.
   *
   *
   * @param {string} sessionId
   * defaults to 'current'
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  async deleteSession(
    sessionId = 'current',
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<{}> {
    const result = await this._account.deleteSession(sessionId);
    this.triggerAuthCheck();
    return result;
  }

  /**
   * Update status
   *
   * Block the currently logged in user account. Behind the scene, the user
   * record is not deleted but permanently blocked from any access. To
   * completely delete a user, use the Users API instead.
   *
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<TPrefs>>}
   */
  async updateStatus<TPrefs extends Models.Preferences>(): Promise<
    Models.User<TPrefs>
  > {
    const account = await this._account.updateStatus();
    this.triggerAuthCheck();
    return account as Models.User<TPrefs>;
  }

  /**
   * Create push target
   *
   * No description at this moment
   *
   * @param {string} targetId
   * @param {string} identifier
   * @param {string} providerId
   * @throws {AppwriteException}
   * @returns {Promise<Models.Target>}
   */
  async createPushTarget(
    targetId: string,
    identifier: string,
    providerId?: string,
  ): Promise<Models.Target> {
    const account = await this._account.createPushTarget(
      targetId,
      identifier,
      providerId,
    );
    this.triggerAuthCheck();
    return account;
  }

  /**
   * Update push target
   *
   * No description at this moment
   *
   * @param {string} targetId
   * @param {string} identifier
   * @throws {AppwriteException}
   * @returns {Promise<Models.Target>}
   */
  async updatePushTarget(
    targetId: string,
    identifier: string,
  ): Promise<Models.Target> {
    const account = await this._account.updatePushTarget(targetId, identifier);
    this.triggerAuthCheck();
    return account;
  }

  /**
   * Delete push target
   *
   * No description at this moment
   *
   * @param {string} targetId
   * @throws {AppwriteException}
   * @returns {Promise<Models.Target>}
   */
  async deletePushTarget(
    targetId: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<{}> {
    const account = await this._account.deletePushTarget(targetId);
    this.triggerAuthCheck();
    return account;
  }

  /**
   * Create email token (OTP)
   *
   * Sends the user an email with a secret key for creating a session.
   * If the provided user ID has not be registered, a new user will be created.
   *  Use the returned user ID and secret and submit a request to the
   * POST /v1/account/sessions/token endpoint to complete the login process.
   * The secret sent to the user's email is valid for 15 minutes.
   *
   * A user is limited to 10 active sessions at a time by default. Learn more about session limits.
   *
   * @param {string} userId
   * @param {string} email
   * @param {boolean} phrase
   * @throws {AppwriteException}
   * @returns {Promise<Models.Token>}
   */
  async createEmailToken(
    userId: string,
    email: string,
    phrase = false,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<Models.Token> {
    const account = await this._account.createEmailToken(userId, email, phrase);
    this.triggerAuthCheck();
    return account;
  }

  /**
   * Create magic URL token
   *
   * Sends the user an email with a secret key for creating a session.
   * If the provided user ID has not been registered, a new user will be created.
   * When the user clicks the link in the email, the user is redirected back to
   * the URL you provided with the secret key and userId values attached to
   * the URL query string. Use the query string parameters to submit a request
   * to the POST /v1/account/sessions/token endpoint to complete the login process.
   *
   * The link sent to the user's email address is valid for 1 hour.
   * If you are on a mobile device you can leave the URL parameter empty,
   * so that the login completion will be handled by your Appwrite instance
   * by default.
   *
   * A user is limited to 10 active sessions at a time by default. Learn more about session limits.
   *
   * @param {string} userId
   * @param {string} email
   * @param {string} url
   * Defaults to ID.unique()
   * @throws {AppwriteException}
   * @returns {Promise<Models.Token>}
   */
  async createMagicURLToken(
    email: string,
    url?: string,
    userId: string = ID.unique(),
    phrase = true,
  ): Promise<Models.Token> {
    const session = await this._account.createMagicURLToken(
      userId,
      email,
      url,
      phrase,
    );
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create OAuth2 token
   *
   * Allow the user to login to their account using the OAuth2 provider of their choice.
   *  Each OAuth2 provider should be enabled from the Appwrite console first.
   * Use the success and failure arguments to provide a redirect URL's back to
   * your app when login is completed.
   *
   * If authentication succeeds, userId and secret of a token will be appended to the success URL as query parameters. These can be used to create a new session using the Create session endpoint.
   *
   * A user is limited to 10 active sessions at a time by default. Learn more about session limits.
   *
   *
   * @param {OAuthProvider} provider
   * @param {string} success
   * @param {string} failure
   * @param {string[]} scopes
   * @throws {AppwriteException}
   * @returns {void|string}
   */
  createOAuth2Token(
    provider: OAuthProvider,
    success?: string,
    failure?: string,
    scopes?: string[],
  ): URL | void {
    const url = this._account.createOAuth2Token(
      provider,
      success,
      failure,
      scopes,
    );
    return url;
  }

  /**
   * Create Phone token
   *
   * Sends the user an SMS with a secret key for creating a session.
   * If the provided user ID has not be registered, a new user will be created.
   * Use the returned user ID and secret and submit a request to the
   * POST /v1/account/sessions/token endpoint to complete the login process.
   * The secret sent to the user's phone is valid for 15 minutes.
   *
   * A user is limited to 10 active sessions at a time by default. Learn more about session limits.
   *
   * @param {string} userId
   * @param {string} phone
   * @throws {AppwriteException}
   * @returns {Promise<Models.Token>}
   */
  async createPhoneToken(userId: string, phone: string): Promise<Models.Token> {
    const session = await this._account.createPhoneToken(userId, phone);
    this.triggerAuthCheck();
    return session;
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
   * @returns {Promise<Models.Token>}
   */
  async createVerification(
    url: string,
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
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
   * @returns {Promise<Models.Token>}
   */
  async updateVerification(
    userId: string,
    secret: string,
  ): // eslint-disable-next-line @typescript-eslint/ban-types
  Promise<Models.Token> {
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
   * @returns {Promise<Models.Token>}
   */
  async createPhoneVerification(): Promise<Models.Token> {
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
   * @returns {Promise<Models.Token>}
   */
  async updatePhoneVerification(
    userId: string,
    secret: string,
  ): Promise<Models.Token> {
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
   * @param {ObjectSchema<TPrefs>} prefsSchema
   * @throws {AppwriteException}
   * @returns {Promise<Models.User<T>>}
   */
  async convertAnonymousAccountWithEmailAndPassword<
    T extends Models.Preferences,
  >(email: string, password: string): Promise<Models.User<T>> {
    const account = await this._account.updateEmail(email, password);
    this.triggerAuthCheck();
    return account as Models.User<T>;
  }

  /**
   * Logout - Shortcut for  deletesession
   *
   * @throws {AppwriteException}
   * @returns {Promise<{}> }
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async logout(): Promise<{}> {
    return this.deleteSession('current');
  }

  /**
   * Triggering an auth-check
   *
   * Trigger a check of all account and
   * session-related actions to enable
   * reactive monitoring of authentication status
   * @returns {void}
   */
  triggerAuthCheck(): void {
    this._triggerManualAuthCheck$.next(true);
  }

  private async _checkIfAuthExists(): Promise<null | Models.User<Models.Preferences>> {
    try {
      const account = await this._account.get();
      return account;
    } catch (error) {
      console.warn(error);
      return null;
    }
  }
}
