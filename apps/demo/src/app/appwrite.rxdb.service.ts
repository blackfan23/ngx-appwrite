import { Injectable } from '@angular/core';
import { AppwriteAdapterWithReplication } from 'ngx-appwrite';
import { InferInput, number, object, string } from 'valibot';

// schema for friends, merges base document
const humansSchema = object({
  id: string(),
  name: string(),
  age: number(),
  homeAddress: string(),
});

// inferred type from schema
export type Human = InferInput<typeof humansSchema>;

@Injectable({
  providedIn: 'root',
})
export class HumansRxdbService extends AppwriteAdapterWithReplication<Human> {
  protected collectionId = 'humans';
  protected validationFn = undefined;

  constructor() {
    super();
    this.startReplication({
      rxdbDatabasename: 'mydb',
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
