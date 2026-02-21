import { Models } from 'appwrite';

export interface AppwriteDocumentModel extends Models.Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $sequence: number;
}
export interface AppwriteRowModel extends Models.Row {
  $id: string;
  $tableId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $sequence: number;
}

// type that takes the input type and removes all keys that start with a $ sign
export type WithoutAppwriteDocumentKeys<T> = Omit<T, keyof Models.Document>;
export type WithoutAppwriteRowKeys<T> = Omit<T, keyof Models.Row>;
