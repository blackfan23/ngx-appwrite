import { Injectable, Provider } from '@angular/core';
import {
  AppwriteException,
  Teams as AppwriteTeams,
  ID,
  Models,
} from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Team {
  private readonly _teams = new AppwriteTeams(CLIENT());

  private async _call<T>(promise: Promise<T>): Promise<T | null> {
    try {
      return await promise;
    } catch (e: unknown) {
      if (e instanceof AppwriteException) {
        console.error(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * Create Team
   *
   * Create a new team. The user who creates the team will automatically be
   * assigned as the owner of the team. Only the users with the owner role can
   * invite new members, add new owners and delete or update the team.
   *
   * @param name The team's name.
   * @param roles The team's roles.
   * @param teamId The team's ID.
   * @returns The created team.
   */
  create<TPrefs extends Models.Preferences>(
    name: string,
    roles?: string[],
    teamId: string = ID.unique(),
  ): Promise<Models.Team<TPrefs> | null> {
    return this._call(this._teams.create<TPrefs>(teamId, name, roles));
  }

  /**
   * List Teams
   *
   * Get a list of all the teams in which the current user is a member. You can
   * use the parameters to filter your results.
   *
   * @param queries The queries to filter the results.
   * @param search The search string to filter the results.
   * @returns A list of teams.
   */
  list<TPrefs extends Models.Preferences>(
    queries?: string[],
    search?: string,
  ): Promise<Models.TeamList<TPrefs> | null> {
    return this._call(this._teams.list<TPrefs>(queries, search));
  }

  /**
   * Get Team
   *
   * Get a team by its ID. All team members have read access for this resource.
   *
   * @param teamId The team's ID.
   * @returns A team.
   */
  get<TPrefs extends Models.Preferences>(
    teamId: string,
  ): Promise<Models.Team<TPrefs> | null> {
    return this._call(this._teams.get<TPrefs>(teamId));
  }

  /**
   * Update Team Name
   *
   * Update a team name using its ID. Only members with the owner role can update the
   * team.
   *
   * @param teamId The team's ID.
   * @param name The new name for the team.
   * @returns The updated team.
   */
  updateName<TPrefs extends Models.Preferences>(
    teamId: string,
    name: string,
  ): Promise<Models.Team<TPrefs> | null> {
    return this._call(this._teams.updateName<TPrefs>(teamId, name));
  }

  /**
   * Delete Team
   *
   * Delete a team using its ID. Only team members with the owner role can
   * delete the team.
   *
   * @param teamId The team's ID.
   * @returns An empty object.
   */
  async delete(teamId: string): Promise<Record<string, never> | null> {
    const result = await this._call(this._teams.delete(teamId));
    return result === undefined ? {} : result;
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
   * @param teamId The team's ID.
   * @param email The email of the new member.
   * @param roles The roles of the new member.
   * @param url The URL to redirect the user to after accepting the invitation.
   * @param name The name of the new member.
   * @returns The created membership.
   */
  createMembership(
    teamId: string,
    roles: string[],
    email?: string,
    userId?: string,
    phone?: string,
    url?: string,
    name?: string,
  ): Promise<Models.Membership | null> {
    return this._call(
      this._teams?.createMembership(
        teamId,
        roles,
        email,
        userId,
        phone,
        url,
        name,
      ),
    );
  }

  /**
   * List Team Memberships
   *
   * Use this endpoint to list a team's members using the team's ID. All team
   * members have read access to this endpoint.
   *
   * @param teamId The team's ID.
   * @param queries The queries to filter the results.
   * @param search The search string to filter the results.
   * @returns A list of memberships.
   */
  listMemberships(
    teamId: string,
    queries?: string[],
    search?: string,
  ): Promise<Models.MembershipList | null> {
    return this._call(this._teams.listMemberships(teamId, queries, search));
  }

  /**
   * Get Team Membership
   *
   * Get a team member by the membership unique id. All team members have read
   * access for this resource.
   *
   * @param teamId The team's ID.
   * @param membershipId The membership ID.
   * @returns A membership.
   */
  getMembership(
    teamId: string,
    membershipId: string,
  ): Promise<Models.Membership | null> {
    return this._call(this._teams.getMembership(teamId, membershipId));
  }

  /**
   * Update Membership
   *
   * Modify the roles of a team member. Only team members with the owner role
   * have access to this endpoint. Learn more about [roles and
   * permissions](/docs/permissions).
   *
   * @param teamId The team's ID.
   * @param membershipId The membership ID.
   * @param roles The new roles for the member.
   * @returns The updated membership.
   */
  updateMembership(
    teamId: string,
    membershipId: string,
    roles: string[],
  ): Promise<Models.Membership | null> {
    return this._call(
      this._teams.updateMembership(teamId, membershipId, roles),
    );
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
   * @param teamId The team's ID.
   * @param membershipId The membership ID.
   * @param userId The user's ID.
   * @param secret The secret from the invitation.
   * @returns The updated membership.
   */
  updateMembershipStatus(
    teamId: string,
    membershipId: string,
    userId: string,
    secret: string,
  ): Promise<Models.Membership | null> {
    return this._call(
      this._teams.updateMembershipStatus(teamId, membershipId, userId, secret),
    );
  }

  /**
   * Delete Team Membership
   *
   * This endpoint allows a user to leave a team or for a team owner to delete
   * the membership of any other team member. You can also use this endpoint to
   * delete a user membership even if it is not accepted.
   *
   * @param teamId The team's ID.
   * @param membershipId The membership ID.
   * @returns An empty object.
   */
  async deleteMembership(
    teamId: string,
    membershipId: string,
  ): Promise<Record<string, never> | null> {
    const result = await this._call(
      this._teams.deleteMembership(teamId, membershipId),
    );
    return result === undefined ? {} : result;
  }
}

export const TeamsService = Team;

export const provideTeams = (): Provider => {
  return {
    provide: Team,
    useClass: Team,
  };
};
