import { Injectable } from '@angular/core';
import { AppwriteAdapterWithReplication } from 'ngx-appwrite';

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
  constructor() {
    super();
    this.startReplication({
      rxdbDatabasename: 'mydb',
      collectionId: 'humans',
      rxdbSchema: {
        title: 'humans',
        version: 0,
        primaryKey: 'id',
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
        required: ['id', 'name', 'age', 'homeAddress'],
      },
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class AliensRxdbService extends AppwriteAdapterWithReplication<Alien> {
  constructor() {
    super();
    this.startReplication({
      rxdbDatabasename: 'mydb',
      collectionId: 'aliens',
      rxdbSchema: {
        title: 'aliens',
        version: 0,
        primaryKey: 'id',
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
        required: ['id', 'name', 'planet', 'species'],
      },
    });
  }
}
