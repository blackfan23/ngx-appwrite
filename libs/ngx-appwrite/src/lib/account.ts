import { Injectable, Provider } from '@angular/core';
import {
  Account as AppwriteAccount,
  AppwriteException,
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
  from,
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

  private readonly _account = new AppwriteAccount(CLIENT());
  private readonly _client$ = of(CLIENT()).pipe(shareReplay(1));
  private readonly _watchAuthChannel$ = this._client$.pipe(
    switchMap((client) => watch(client, 'account').pipe(startWith(null))),
  );
  private readonly _triggerManualAuthCheck$ = new Subject<boolean>();

  private _auth$:
    | Observable<Models.User<Models.Preferences> | null>
    | undefined;

  /* -------------------------------------------------------------------------- */
  /*                                  Reactive                                  */
  /* -------------------------------------------------------------------------- */

  constructor() {
    this._account = new AppwriteAccount(CLIENT());
  }

  /**
   * Emits the currently logged in user, or null if no user is logged in.
   *
   * @template TPrefs - The type of the user's preferences.
   * @returns An observable that emits the currently logged in user, or null.
   */
  onAuth<
    TPrefs extends Models.Preferences,
  >(): Observable<Models.User<TPrefs> | null> {
    if (!this._auth$) {
      this._auth$ = merge(
        this._watchAuthChannel$,
        this._triggerManualAuthCheck$,
      ).pipe(
        switchMap(() => from(this.get<TPrefs>())),
        debounceTime(50),
        distinctUntilChanged(deepEqual),
        shareReplay(1),
      );
    }

    return this._auth$ as Observable<Models.User<TPrefs> | null>;
  }

  /* -------------------------------------------------------------------------- */
  /*    Default API - https://appwrite.io/docs/client/account?sdk=web-default   */
  /* -------------------------------------------------------------------------- */

  /**
   * Get Account
   *
   * Get currently logged in user data as JSON object.
   *
   * @template TPrefs The type of the user's preferences.
   * @returns The user's data.
   */
  get<TPrefs extends Models.Preferences>(): Promise<Models.User<TPrefs>> {
    return this._account.get<TPrefs>();
  }

  /**
   * Create Account
   *
   * Use this endpoint to allow a new user to register a new account in your project.
   * After the user registration completes successfully, you can use the /account/verfication route
   * to start verifying the user email address. To allow the new user to login to their new account,
   * you need to create a new account session.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @param defaultPrefs The user's default preferences.
   * @param name The user's name.
   * @param userId The user's ID.
   * @returns The newly created user.
   */
  async create<T extends Models.Preferences>(
    email: string,
    password: string,
    defaultPrefs: T = {} as T,
    name?: string,
    userId: string = ID.unique(),
  ): Promise<Models.User<T>> {
    const account = await this._account.create(userId, email, password, name);
    if (account) {
      this.triggerAuthCheck();
      await this.updatePrefs(defaultPrefs);
    }

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
   * @param email The user's new email address.
   * @param password The user's password.
   * @returns The updated user.
   */
  updateEmail<TPrefs extends Models.Preferences>(
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
   * @param queries An array of queries to filter the results.
   * @returns The list of identities.
   */
  listIdentities(queries: string[] = []): Promise<Models.IdentityList> {
    return this._account.listIdentities(queries);
  }

  /**
   * Delete Identity
   *
   * Delete a user identity by id.
   *
   * @param id The ID of the identity to delete.
   * @returns An empty object.
   */
  async deleteIdentity(id: string): Promise<Record<string, never>> {
    const result = await this._account.deleteIdentity(id);

    return result === undefined ? {} : result;
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
   * @returns A JSON Web Token.
   */
  createJWT(): Promise<Models.Jwt> {
    return this._account.createJWT();
  }

  /**
   * List Logs
   *
   * Get the list of latest security activity logs for the currently logged in user.
   * Each log returns user IP address, location and date and time of log.
   *
   * @param queries An array of queries to filter the results.
   * @returns A list of security logs.
   */
  listLogs(queries: string[] = []): Promise<Models.LogList> {
    return this._account.listLogs(queries);
  }

  /**
   * Update MFA
   *
   * Enable or disable MFA on an account.
   *
   * @param enableMFA Whether to enable or disable MFA.
   * @returns The updated user.
   */
  updateMFA<TPrefs extends Models.Preferences>(
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
   * @returns The MFA type.
   */
  createMfaAuthenticator(): Promise<Models.MfaType> {
    return this._account.createMfaAuthenticator(AuthenticatorType.Totp);
  }

  /**
   * Verify Authenticator
   *
   * Verify an authenticator app after adding it using the add authenticator method.
   *
   * @param otp The one-time password from the authenticator app.
   * @returns An empty object.
   */
  updateMfaAuthenticator<TPrefs extends Models.Preferences>(
    otp: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updateMfaAuthenticator(AuthenticatorType.Totp, otp);
  }

  /**
   * Delete Authenticator
   *
   * Delete an authenticator app.
   *
   * @returns An empty object.
   */
  async deleteMfaAuthenticator(): Promise<void> {
    await this._account.deleteMfaAuthenticator(AuthenticatorType.Totp);
  }

  /**
   * Create Challenge
   *
   * Create a challenge to be solved before continuing to a protected route.
   *
   * @param factor The authentication factor to use for the challenge.
   * @returns The MFA challenge.
   */
  createMfaChallenge(
    factor: AuthenticationFactor,
  ): Promise<Models.MfaChallenge> {
    return this._account.createMfaChallenge(factor);
  }

  /**
   * Verify Challenge
   *
   * Verify a challenge to continue to a protected route.
   *
   * @param challengeId The ID of the challenge to verify.
   * @param otp The one-time password from the authenticator app.
   * @returns An empty object.
   */
  async updateMfaChallenge(
    challengeId: string,
    otp: string,
  ): Promise<Models.Session> {
    return this._account.updateMfaChallenge(challengeId, otp);
  }

  /**
   * List Factors
   *
   * List the available MFA factors for the current user.
   *
   * @returns A list of MFA factors.
   */
  listMfaFactors(): Promise<Models.MfaFactors> {
    return this._account.listMfaFactors();
  }

  /**
   * Get Recovery Codes
   *
   * Get the recovery codes for the current user.
   *
   * @returns A list of MFA recovery codes.
   */
  getMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.getMfaRecoveryCodes();
  }

  /**
   * Create Recovery Codes
   *
   * Create a new set of recovery codes for the current user.
   *
   * @returns A list of MFA recovery codes.
   */
  createMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.createMfaRecoveryCodes();
  }

  /**
   * Update Recovery Codes
   *
   * Update the recovery codes for the current user.
   *
   * @returns A list of MFA recovery codes.
   */
  updateMfaRecoveryCodes(): Promise<Models.MfaRecoveryCodes> {
    return this._account.updateMfaRecoveryCodes();
  }

  /**
   * Update Name
   *
   * Update currently logged in user account name.
   *
   * @param name The user's new name.
   * @returns The updated user.
   */
  updateName<TPrefs extends Models.Preferences>(
    name: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updateName(name);
  }

  /**
   * Update Password
   *
   * Update currently logged in user account password.
   * For validation, user is required to pass the password twice.
   *
   * @param password The user's new password.
   * @param oldPassword The user's old password.
   * @returns The updated user.
   */
  updatePassword<TPrefs extends Models.Preferences>(
    password: string,
    oldPassword?: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePassword(password, oldPassword);
  }

  /**
   * Update Phone
   *
   * Update currently logged in user account phone number.
   *
   * @param phoneNumber The user's new phone number.
   * @param password The user's password.
   * @returns The updated user.
   */
  updatePhone<TPrefs extends Models.Preferences>(
    phoneNumber: string,
    password: string,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePhone(phoneNumber, password);
  }

  /**
   * Get Preferences
   *
   * Get currently logged in user preferences as a JSON object.
   *
   * @returns The user's preferences.
   */
  getPrefs<TPrefs extends Models.Preferences>(): Promise<TPrefs> {
    return this._account.getPrefs<TPrefs>();
  }

  /**
   * Update Preferences
   *
   * Update currently logged in user preferences.
   * You can pass only the specific settings you wish to update.
   *
   * @param prefs The user's new preferences.
   * @returns The updated user.
   */
  updatePrefs<TPrefs extends Models.Preferences>(
    prefs: TPrefs,
  ): Promise<Models.User<TPrefs>> {
    return this._account.updatePrefs<TPrefs>(prefs);
  }

  /**
   * Create Recovery
   *
   * Sends the user an email with a temporary secret key for password reset.
   *
   * @param email The user's email address.
   * @param url The URL to redirect the user to after the password reset.
   * @returns A token object.
   */
  createRecovery(email: string, url: string): Promise<Models.Token> {
    return this._account.createRecovery(email, url);
  }

  /**
   * Update Recovery
   *
   * Use this endpoint to complete the user account password reset.
   *
   * @param userId The user's ID.
   * @param secret The secret key from the recovery email.
   * @param password The user's new password.
   * @returns A token object.
   */
  updateRecovery(
    userId: string,
    secret: string,
    password: string,
  ): Promise<Models.Token> {
    return this._account.updateRecovery(userId, secret, password);
  }

  /**
   * List Sessions
   *
   * Get the list of all the user sessions.
   *
   * @returns A list of sessions.
   */
  listSessions(): Promise<Models.SessionList> {
    return this._account.listSessions();
  }

  /**
   * Delete Sessions
   *
   * Delete all the user sessions.
   *
   * @returns An empty object.
   */
  async deleteSessions(): Promise<Record<string, never>> {
    const deleted = await this._account.deleteSessions();
    this.triggerAuthCheck();

    return deleted === undefined ? {} : deleted;
  }

  /**
   * Create Anonymous Session
   *
   * Use this endpoint to create a new anonymous account.
   * After the user registration completes successfully, you can use the
   * /account/verfication route to start verifying the user email address.
   * To allow the new user to login to their new account,
   * you need to create a new account session.
   *
   * @returns A session object.
   */
  async createAnonymousSession(): Promise<Models.Session> {
    const session = await this._account.createAnonymousSession();
    this.triggerAuthCheck();
    return session;
  }

  /**
   * Create Email/Password Session
   *
   * Allow the user to login into his account by providing his email and password.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns A session object.
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
   * Update Magic URL Session
   *
   * Use this endpoint to login the user with a magic URL.
   *
   * @param userId The user's ID.
   * @param secret The secret from the magic URL.
   * @returns A session object.
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
   * Allow the user to login to his account using the OAuth2 provider of his choice.
   * Each OAuth2 provider should be enabled from the Appwrite console.
   *
   * @param provider The OAuth2 provider to use.
   * @param success The URL to redirect the user to after a successful login.
   * @param failure The URL to redirect the user to after a failed login.
   * @param scopes An array of scopes to request.
   * @returns The OAuth2 session.
   */
  async createOAuth2Session(
    provider: OAuthProvider,
    success?: string,
    failure?: string,
    scopes?: string[],
  ): Promise<string | void> {
    const res = this._account.createOAuth2Session(
      provider,
      success,
      failure,
      scopes,
    );
    this.triggerAuthCheck();
    return res;
  }

  /**
   * Update Phone Session
   *
   * Use this endpoint to login the user with a phone number and secret.
   *
   * @param userId The user's ID.
   * @param secret The secret from the SMS.
   * @returns A session object.
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
   * Create Session
   *
   * Use this endpoint to create a new session.
   *
   * @param userId The user's ID.
   * @param secret The secret from the token.
   * @returns A session object.
   */
  createSession(userId: string, secret: string): Promise<Models.Session> {
    return this._account.createSession(userId, secret);
  }

  /**
   * Get Session
   *
   * Get the session for the current user.
   *
   * @param sessionId The ID of the session to get.
   * @returns A session object.
   */
  getSession(sessionId = 'current'): Promise<Models.Session> {
    return this._account.getSession(sessionId);
  }

  /**
   * Update Session
   *
   * Update the session for the current user.
   *
   * @param sessionId The ID of the session to update.
   * @returns A session object.
   */
  updateSession(sessionId = 'current'): Promise<Models.Session> {
    return this._account.updateSession(sessionId);
  }

  /**
   * Delete Session
   *
   * Delete the session for the current user.
   *
   * @param sessionId The ID of the session to delete.
   * @returns An empty object.
   */
  async deleteSession(sessionId = 'current'): Promise<Record<string, never>> {
    const deleted = await this._account.deleteSession(sessionId);
    this.triggerAuthCheck();

    return deleted === undefined ? {} : deleted;
  }

  /**
   * Update Status
   *
   * Update the user's status.
   *
   * @returns The updated user.
   */
  updateStatus<TPrefs extends Models.Preferences>(): Promise<
    Models.User<TPrefs>
  > {
    return this._account.updateStatus();
  }

  /**
   * Create Push Target
   *
   * Create a new push target for the current user.
   *
   * @param targetId The ID of the push target.
   * @param identifier The identifier of the push target.
   * @param providerId The ID of the provider to use.
   * @returns A push target object.
   */
  createPushTarget(
    targetId: string,
    identifier: string,
    providerId?: string,
  ): Promise<Models.Target> {
    return this._account.createPushTarget(targetId, identifier, providerId);
  }

  /**
   * Update Push Target
   *
   * Update a push target for the current user.
   *
   * @param targetId The ID of the push target.
   * @param identifier The identifier of the push target.
   * @returns A push target object.
   */
  updatePushTarget(
    targetId: string,
    identifier: string,
  ): Promise<Models.Target> {
    return this._account.updatePushTarget(targetId, identifier);
  }

  /**
   * Delete Push Target
   *
   * Delete a push target for the current user.
   *
   * @param targetId The ID of the push target.
   * @returns An empty object.
   */
  async deletePushTarget(targetId: string): Promise<Record<string, never>> {
    const result = await this._account.deletePushTarget(targetId);

    return result === undefined ? {} : result;
  }

  /**
   * Create Email Token
   *
   * Use this endpoint to create a new email token.
   *
   * @param userId The user's ID.
   * @param email The user's email address.
   * @param phrase Whether to use a phrase or a secret.
   * @returns A token object.
   */
  createEmailToken(
    userId: string,
    email: string,
    phrase = false,
  ): Promise<Models.Token> {
    return this._account.createEmailToken(userId, email, phrase);
  }

  /**
   * Create Magic URL Token
   *
   * Use this endpoint to create a new magic URL token.
   *
   * @param email The user's email address.
   * @param url The URL to redirect the user to after the magic URL is used.
   * @param userId The user's ID.
   * @param phrase Whether to use a phrase or a secret.
   * @returns A token object.
   */
  createMagicURLToken(
    userId: string = ID.unique(),
    email: string,
    url?: string,
    phrase = true,
  ): Promise<Models.Token> {
    return this._account.createMagicURLToken(userId, email, url, phrase);
  }

  /**
   * Create OAuth2 Token
   *
   * Use this endpoint to create a new OAuth2 token.
   *
   * @param provider The OAuth2 provider to use.
   * @param success The URL to redirect the user to after a successful login.
   * @param failure The URL to redirect the user to after a failed login.
   * @param scopes An array of scopes to request.
   * @returns A new session.
   */
  async createOAuth2Token(
    provider: OAuthProvider,
    success?: string,
    failure?: string,
    scopes?: string[],
  ): Promise<string | void> {
    return this._account.createOAuth2Token(provider, success, failure, scopes);
  }

  /**
   * Create Phone Token
   *
   * Use this endpoint to create a new phone token.
   *
   * @param userId The user's ID.
   * @param phone The user's phone number.
   * @returns A token object.
   */
  createPhoneToken(userId: string, phone: string): Promise<Models.Token> {
    return this._account.createPhoneToken(userId, phone);
  }

  /**
   * Create Verification
   *
   * Use this endpoint to send a verification email to the user.
   *
   * @param url The URL to redirect the user to after the verification.
   * @returns A token object.
   */
  createVerification(url: string): Promise<Models.Token> {
    return this._account.createVerification(url);
  }

  /**
   * Update Verification
   *
   * Use this endpoint to complete the email verification process.
   *
   * @param userId The user's ID.
   * @param secret The secret from the verification email.
   * @returns A token object.
   */
  updateVerification(userId: string, secret: string): Promise<Models.Token> {
    return this._account.updateVerification(userId, secret);
  }

  /**
   * Create Phone Verification
   *
   * Use this endpoint to send a verification SMS to the user.
   *
   * @returns A token object.
   */
  createPhoneVerification(): Promise<Models.Token> {
    return this._account.createPhoneVerification();
  }

  /**
   * Update Phone Verification
   *
   * Use this endpoint to complete the phone verification process.
   *
   * @param userId The user's ID.
   * @param secret The secret from the verification SMS.
   * @returns A token object.
   */
  updatePhoneVerification(
    userId: string,
    secret: string,
  ): Promise<Models.Token> {
    return this._account.updatePhoneVerification(userId, secret);
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
   * @returns An empty object.
   */
  async logout(): Promise<Record<string, never>> {
    return this.deleteSession();
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
}

/**
 * An alias for the Account class.
 */
export const AccountService = Account;

/**
 * A provider for the Account class.
 */
export const provideAccount = (): Provider => {
  return {
    provide: Account,
    useClass: Account,
  };
};
