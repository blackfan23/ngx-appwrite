import { Inject, Injectable } from '@angular/core';
import { Client } from 'appwrite';
import { BehaviorSubject, filter, map, Observable, shareReplay } from 'rxjs';
import { AppwriteConfig, APPWRITE_CONFIG } from './appwrite.config';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private _config$ = new BehaviorSubject<AppwriteConfig | undefined>(undefined);

  public client$: Observable<Client> = this._config$.pipe(
    filter(Boolean),
    map((config) => {
      const client = new Client();
      // Init your web SDK
      client
        .setEndpoint(config.endpoint) // Your API Endpoint
        .setProject(config.project); // Your project ID

      return client;
    }),
    shareReplay(1)
  );

  constructor(@Inject(APPWRITE_CONFIG) public config: AppwriteConfig) {
    if (!config) {
      throw new Error('No AppwriteConfig provided for NgxAppwriteModule');
    }
    this._config$.next(config);
  }

  public setConfig(config: AppwriteConfig): void {
    this._config$.next(config);
  }
}
