import { Injectable } from '@angular/core';
import { AppwriteAdapter } from 'ngx-appwrite';
import {
  array,
  boolean,
  fallback,
  InferInput,
  number,
  object,
  string,
} from 'valibot';

// reference schema for the Appwrite base document
const AppwriteDocumentSchema = object({
  $id: string(),
  $collectionId: string(),
  $databaseId: string(),
  $createdAt: string(),
  $updatedAt: string(),
  $permissions: fallback(array(string()), []),
});

// schema for friends, merges base document
const humansSchema = object({
  ...AppwriteDocumentSchema.entries,
  ...object({
    name: string(),
    age: number(),
    homeAdress: string(),
    deleted: boolean(),
  }).entries,
});

// inferred type from schema
export type Human = InferInput<typeof humansSchema>;

@Injectable({
  providedIn: 'root',
})
export class HumansRxdbService extends AppwriteAdapter<Human> {
  protected collectionId = 'humans';
  protected validationFn = undefined;
  protected rxdbReplication = {
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
  };
}
