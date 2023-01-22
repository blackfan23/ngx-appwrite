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
  switchMap
} from 'rxjs';
import { ClientService } from './client.service';
import { watch } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private _checkAuth$ = new Subject<boolean>();

  public account$: Observable<Models.Account<Models.Preferences>> = this.clientService.client$.pipe(
    map((client) => new Account(client)),
    switchMap((account) => account.get()),
    shareReplay(1)
  );

  public auth$: Observable<null | Models.Account<Models.Preferences>> =
    this.clientService.client$.pipe(
      switchMap((client) =>
        combineLatest([
          watch(client, 'account').pipe(startWith(null)),
          this._checkAuth$.pipe(startWith(null))
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

  constructor(private clientService: ClientService) {}

  triggerAuthCheck(): void {
    this._checkAuth$.next(true);
  }
}
