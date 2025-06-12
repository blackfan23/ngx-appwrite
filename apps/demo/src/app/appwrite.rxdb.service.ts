import { Injectable } from '@angular/core';
import { AppwriteAdapterWithReplication } from 'ngx-appwrite';

// inferred type from schema
export interface Human {
  id: string;
  name: string;
  age: number;
  homeAddress: string;
}

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
