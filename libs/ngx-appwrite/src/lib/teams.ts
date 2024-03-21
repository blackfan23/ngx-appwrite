import { Injectable } from '@angular/core';
import { ID, Models, Teams } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private _teams: Teams = new Teams(CLIENT());

  /**
   * Create Team
   *
   * Create a new team. The user who creates the team will automatically be
   * assigned as the owner of the team. Only the users with the owner role can
   * invite new members, add new owners and delete or update the team.
   *
   * @param {string} teamId
   * @param {string} name
   * @param {string[]} roles
   * @throws {AppwriteException}
   * @returns {Promise<Models.Team<TPrefs>>}
   */
  async create<TPrefs extends Models.Preferences>(
    name: string,
    roles?: string[],
    teamId: string = ID.unique(),
  ): Promise<Models.Team<TPrefs>> {
    return this._teams?.create<TPrefs>(teamId, name, roles);
  }
  /**
   * List Teams
   *
   * Get a list of all the teams in which the current user is a member. You can
   * use the parameters to filter your results.
   *
   * @param {string[]} queries
   * @param {string} search
   * @throws {Promise<Models.TeamList<TPrefs>>}
   * @returns {Promise}
   */
  async list<TPrefs extends Models.Preferences>(
    queries?: string[] | undefined,
    search?: string | undefined,
  ): Promise<Models.TeamList<TPrefs>> {
    return this._teams?.list<TPrefs>(queries, search);
  }
  /**
   * Get Team
   *
   * Get a team by its ID. All team members have read access for this resource.
   *
   * @param {string} teamId
   * @throws {AppwriteException}
   * @returns {Promise<Models.Team<TPrefs>>}
   */
  async get<TPrefs extends Models.Preferences>(
    teamId: string,
  ): Promise<Models.Team<TPrefs>> {
    return this._teams?.get<TPrefs>(teamId);
  }
  /**
   * Update Team Name
   *
   * Update a team name using its ID. Only members with the owner role can update the
   * team.
   *
   * @param {string} teamId
   * @param {string} name
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateName<TPrefs extends Models.Preferences>(
    teamId: string,
    name: string,
  ): Promise<Models.Team<TPrefs>> {
    return this._teams?.updateName<TPrefs>(teamId, name);
  }
  /**
   * Delete Team
   *
   * Delete a team using its ID. Only team members with the owner role can
   * delete the team.
   *
   * @param {string} teamId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async delete(teamId: string): Promise<{}> {
    return this._teams.delete(teamId);
  }
  /**
   * Create Team Membership
   *
   * Invite a new member to join your team. If initiated from the client SDK, an
   * email with a link to join the team will be sent to the member's email
   * address and an account will be created for them should they not be signed
   * up already. If initiated from server-side SDKs, the new member will
   * automatically be added to the team.
   *
   * Use the 'url' parameter to redirect the user from the invitation email back
   * to your app. When the user is redirected, use the [Update Team Membership
   * Status](/docs/client/teams#teamsUpdateMembershipStatus) endpoint to allow
   * the user to accept the invitation to the team.
   *
   * Please note that to avoid a [Redirect
   * Attack](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.md)
   * the only valid redirect URL's are the once from domains you have set when
   * adding your platforms in the console interface.
   *
   * @param {string} teamId
   * @param {string} email
   * @param {string[]} roles
   * @param {string} url
   * @param {string} name
   * @throws {AppwriteException}
   * @returns {Promise<Models.Membership>}
   */
  async createMembership(
    teamId: string,
    roles: string[],
    email?: string,
    url?: string,
    name?: string | undefined,
  ): Promise<Models.Membership> {
    return this._teams?.createMembership(teamId, roles, email, url, name);
  }
  /**
   * List Team Memberships
   *
   * Use this endpoint to list a team's members using the team's ID. All team
   * members have read access to this endpoint.
   *
   * @param {string} teamId
   * @param {string[]} queries
   * @param {string} search
   * @throws {AppwriteException}
   * @returns {Promise<Models.MembershipList>}
   */
  async listMemberships(
    teamId: string,
    queries?: string[] | undefined,
    search?: string | undefined,
  ): Promise<Models.MembershipList> {
    return this._teams?.listMemberships(teamId, queries, search);
  }
  /**
   * Get Team Membership
   *
   * Get a team member by the membership unique id. All team members have read
   * access for this resource.
   *
   * @param {string} teamId
   * @param {string} membershipId
   * @throws {AppwriteException}
   * @returns {Promise<Models.Membership>}
   */
  async getMembership(
    teamId: string,
    membershipId: string,
  ): Promise<Models.Membership> {
    return this._teams?.getMembership(teamId, membershipId);
  }
  /**
   * Update Membership
   *
   * Modify the roles of a team member. Only team members with the owner role
   * have access to this endpoint. Learn more about [roles and
   * permissions](/docs/permissions).
   *
   * @param {string} teamId
   * @param {string} membershipId
   * @param {string[]} roles
   * @throws {AppwriteException}
   * @returns {Promise<Models.Membership>}
   */
  async updateMembership(
    teamId: string,
    membershipId: string,
    roles: string[],
  ): Promise<Models.Membership> {
    return this._teams?.updateMembership(teamId, membershipId, roles);
  }
  /**
   * Update Team Membership Status
   *
   * Use this endpoint to allow a user to accept an invitation to join a team
   * after being redirected back to your app from the invitation email received
   * by the user.
   *
   * If the request is successful, a session for the user is automatically
   * created.
   *
   *
   * @param {string} teamId
   * @param {string} membershipId
   * @param {string} userId
   * @param {string} secret
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateMembershipStatus(
    teamId: string,
    membershipId: string,
    userId: string,
    secret: string,
  ): Promise<Models.Membership> {
    return this._teams?.updateMembershipStatus(
      teamId,
      membershipId,
      userId,
      secret,
    );
  }
  /**
   * Delete Team Membership
   *
   * This endpoint allows a user to leave a team or for a team owner to delete
   * the membership of any other team member. You can also use this endpoint to
   * delete a user membership even if it is not accepted.
   *
   * @param {string} teamId
   * @param {string} membershipId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async deleteMembership(
    teamId: string,
    membershipId: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<{}> {
    return this._teams?.deleteMembership(teamId, membershipId);
  }
}
