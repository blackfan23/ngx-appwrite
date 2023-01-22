import { Inject, Injectable } from '@angular/core';
import { Client } from 'appwrite';
import { AppwriteConfig, APPWRITE_CONFIG } from './appwrite.config';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  public client!: Client;

  constructor(@Inject(APPWRITE_CONFIG) public config: AppwriteConfig) {
    if (!config) {
      throw new Error('No AppwriteConfig provided for NgxAppwriteModule');
    }

    this.client = this._loadClient(config);
  }

  private _loadClient(config: AppwriteConfig) {
    const client = new Client();
    // Init your web SDK
    client
      .setEndpoint(config.endpoint) // Your API Endpoint
      .setProject(config.project); // Your project ID
    return client;
  }
}
