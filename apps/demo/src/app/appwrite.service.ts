import { Injectable } from '@angular/core';
import { AppwriteAdapter } from 'ngx-appwrite';
import {
  array,
  fallback,
  InferInput,
  number,
  object,
  parse,
  string,
} from 'valibot';
import { TEST_COLLECTION } from './app.config';

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
const friendSchema = object({
  ...object({
    name: string(),
    age: number(),
  }).entries,
  ...AppwriteDocumentSchema.entries,
});

// inferred type from schema
export type Friend = InferInput<typeof friendSchema>;

@Injectable({
  providedIn: 'root',
})
export class FriendsService extends AppwriteAdapter<Friend> {
  protected collectionId = TEST_COLLECTION;
  protected validationFn = (friend: unknown) => parse(friendSchema, friend);
}
