import { Injectable } from '@angular/core';
import { AccountService } from './account.service';
import { AvatarsService } from './avatars.service';
import { DatabasesService } from './databases.service';
import { FunctionsService } from './functions.service';
import { LocalizationService } from './localization.service';
import { StorageService } from './storage.service';
import { TeamsService } from './teams.service';

@Injectable({
  providedIn: 'root',
})
export class Appwrite {
  public readonly databases = this._databases;
  public readonly teams = this._teams;
  public readonly account = this._account;
  public readonly avatars = this._avatars;
  public readonly functions = this._functions;
  public readonly localization = this._localization;
  public readonly storage = this._storage;

  constructor(
    private _databases: DatabasesService,
    private _teams: TeamsService,
    private _account: AccountService,
    private _avatars: AvatarsService,
    private _functions: FunctionsService,
    private _localization: LocalizationService,
    private _storage: StorageService
  ) {}

  /* -------------------------------------------------------------------------- */
  /*      Expose these in order to allow full interaction with the web SDK      */
  /* -------------------------------------------------------------------------- */

  // get account(): Account {
  //   if (!this._account) {
  //     this._account = new Account(this.client);
  //   }
  //   return this._account;
  // }

  // get teams(): Teams {
  //   if (!this._teams) {
  //     this._teams = new Teams(this.client);
  //   }
  //   this._checkAuth$.next(true);
  //   return this._teams;
  // }

  // get storage(): Storage {
  //   if (!this._storage) {
  //     this._storage = new Storage(this.client);
  //   }
  //   this._checkAuth$.next(true);
  //   return this._storage;
  // }

  // get functions(): Functions {
  //   if (!this._functions) {
  //     this._functions = new Functions(this.client);
  //   }
  //   this._checkAuth$.next(true);
  //   return this._functions;
  // }

  // files	Any create/update/delete events to any file
  // public files$<T>(events?: string | string[]): Observable<T> {
  //   return this._watch<T>('files', events);
  // }

  // NOT DONE YET
  // buckets.[ID].files.[ID]	Any update/delete events to a given file of the given bucket
  // buckets.[ID].files	Any update/delete events to any file of the given bucket
  // teams	Any create/update/delete events to a any team
  // teams.[ID]	Any update/delete events to a given team
  // memberships	Any create/update/delete events to a any membership
  // memberships.[ID]	Any update/delete events to a given membership
  // executions	Any update to executions
  // executions.[ID]	Any update to a given execution
  // functions.[ID]	Any execution event to a given function
}
