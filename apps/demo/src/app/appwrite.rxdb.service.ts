import { inject, Injectable } from '@angular/core';
import {
  AppwriteAdapterWithReplication,
  ReplicationManager,
} from 'ngx-appwrite';

// inferred type from schema
export interface Human {
  id: string;
  name: string;
  age: number;
  homeAddress: string;
}

export interface Alien {
  id: string;
  name: string;
  planet: string;
  species: string;
}

const dbs = {};

@Injectable({
  providedIn: 'root',
})
export class HumansRxdbService extends AppwriteAdapterWithReplication<Human> {
  private replicationManager = inject(ReplicationManager);

  private readonly humansSchema = {
    title: 'humans',
    version: 0,
    primaryKey: 'id' as const,
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 100,
      },
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
      homeAddress: {
        type: 'string',
      },
    },
    required: ['id', 'name', 'age', 'homeAddress'] as (keyof Human)[],
  };

  constructor() {
    super();
    this.initializeReplication();
  }

  async initializeReplication() {
    const { replicationState, db, collection } =
      await this.replicationManager.startReplication({
        rxdbDatabasename: 'mydb',
        collectionId: 'humans',
        rxdbSchema: this.humansSchema,
        adapterReplicationFunction: async (options) => {
          // Call the adapter's startReplication with the database instance
          return await super.replicate(options);
        },
      });

    // You can now use replicationState, db, and collection
    // For example, to react to replication changes:
    replicationState.error$.subscribe((err: any) => console.error(err));
  }
}

@Injectable({
  providedIn: 'root',
})
export class AliensRxdbService extends AppwriteAdapterWithReplication<Alien> {
  private replicationManager = inject(ReplicationManager);

  private readonly aliensSchema = {
    title: 'aliens',
    version: 0,
    primaryKey: 'id' as const,
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: 100,
      },
      name: {
        type: 'string',
      },
      planet: {
        type: 'string',
      },
      species: {
        type: 'string',
      },
    },
    required: ['id', 'name', 'planet', 'species'] as (keyof Alien)[],
  };

  constructor() {
    super();
    this.initializeReplication();
  }

  async initializeReplication() {
    await this.replicationManager.startReplication({
      rxdbDatabasename: 'mydb',
      collectionId: 'aliens',
      rxdbSchema: this.aliensSchema,
      adapterReplicationFunction: async (options) => {
        return await super.replicate(options);
      },
    });
  }
}
