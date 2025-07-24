import { Injectable, Provider } from '@angular/core';
import {
  Databases as AppwriteDatabases,
  AppwriteException,
  ID,
  Models,
  Query,
} from 'appwrite';
import {
  Observable,
  distinctUntilChanged,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { deepEqual, watch } from './helpers';
import { CLIENT, DEFAULT_DATABASE_ID } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Databases {
  private readonly _databases = new AppwriteDatabases(CLIENT());
  private readonly _client$ = of(CLIENT()).pipe(shareReplay(1));

  /**
   * A function that wraps a promise and handles AppwriteExceptions.
   *
   * @param promise - The promise to wrap.
   * @returns The result of the promise.
   * @throws If the promise rejects with a non-AppwriteException error.
   */
  private async _call<T>(promise: Promise<T>): Promise<T | null> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof AppwriteException) {
        console.warn(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * Create a new Document. Before using this route, you should create a new collection resource using either a [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {Document extends Models.DefaultDocument ? Models.DataWithoutDocumentKeys : Omit<Document, keyof Models.Document>} data
   * @param {string[]} permissions
   * @param {string} alternateDatabaseId
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   */
  createDocument<Document extends Models.Document = Models.DefaultDocument>(
    collectionId: string,
    documentId: string = ID.unique(),
    data: Document extends Models.DefaultDocument
      ? Models.DataWithoutDocumentKeys
      : Omit<Document, keyof Models.Document>,
    permissions?: string[],
    alternateDatabaseId?: string,
  ): Promise<Document> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.createDocument<Document>(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions,
      ),
    ) as Promise<Document>;
  }

  /**
   * **WARNING: Experimental Feature** - This endpoint is experimental and not yet officially supported. It may be subject to breaking changes or removal in future versions.
   *
   * Create or update a Document. Before using this route, you should create a new collection resource using either a [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {object} data
   * @param {string[]} permissions
   * @param {string} alternateDatabaseId
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   */
  upsertDocument<Document extends Models.Document = Models.DefaultDocument>(
    collectionId: string,
    documentId: string,
    data: object,
    permissions?: string[],
    alternateDatabaseId?: string,
  ): Promise<Document> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.upsertDocument<Document>(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions,
      ),
    ) as Promise<Document>;
  }

  /**
   * Get Document
   *
   * Get a document by its unique ID. This endpoint response returns a JSON
   * object with the document data.
   *
   * @param collectionId
   * @param documentId
   * @param queries
   * @param alternateDatabaseId
   * @returns
   */
  getDocument<DocumentShape extends Models.Document>(
    collectionId: string,
    documentId: string,
    queries?: string[],
    alternateDatabaseId?: string,
  ): Promise<DocumentShape | null> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.getDocument<DocumentShape>(
        databaseId,
        collectionId,
        documentId,
        queries,
      ),
    );
  }

  /**
   * List Documents
   *
   * Get a list of all the user's documents in a given collection. You can use
   * the query params to filter your results.
   *
   * @param collectionId
   * @param queries
   * @param alternateDatabaseId
   * @returns
   */
  listDocuments<DocumentShape extends Models.Document>(
    collectionId: string,
    queries?: string[],
    alternateDatabaseId?: string,
  ): Promise<Models.DocumentList<DocumentShape> | null> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.listDocuments<DocumentShape>(
        databaseId,
        collectionId,
        queries,
      ),
    );
  }
  /**
   * Update Document
   *
   * Update a document by its unique ID. Using the patch method you can pass
   * only specific fields that will get updated.
   *
   * @param collectionId
   * @param documentId
   * @param data
   * @param permissions
   * @param alternateDatabaseId
   * @returns
   */
  updateDocument<Document extends Models.Document = Models.DefaultDocument>(
    collectionId: string,
    documentId: string,
    data: Partial<
      Document extends Models.DefaultDocument
        ? Models.DataWithoutDocumentKeys
        : Omit<Document, keyof Models.Document>
    >,
    permissions?: string[],
    alternateDatabaseId?: string,
  ): Promise<Document | null> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.updateDocument<Document>(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions,
      ),
    );
  }

  /**
   * Delete Document
   *
   * Delete a document by its unique ID.
   *
   * @param collectionId
   * @param documentId
   * @param alternateDatabaseId
   * @returns
   */
  deleteDocument(
    collectionId: string,
    documentId: string,
    alternateDatabaseId?: string,
  ): Promise<Record<string, unknown> | null> {
    const databaseId = alternateDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._call(
      this._databases.deleteDocument(databaseId, collectionId, documentId),
    );
  }

  /**
   * This method returns an observable that will emit the collection list
   * and then listen for changes to the collection.
   *
   * @param collectionId The collection to watch
   * @param queries The queries to apply to the collection
   * @param events The events to listen for
   * @param alternativeDatabaseId The database to use
   * @returns An observable of the collection
   */
  collection$<DocumentShape extends Models.Document>(
    collectionId: string,
    queries: (string | Query)[] = [],
    events?: string | string[],
    alternativeDatabaseId?: string,
  ): Observable<Models.DocumentList<DocumentShape> | null> {
    const databaseId = alternativeDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${databaseId}.collections.${collectionId}.documents`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.listDocuments<DocumentShape>(collectionId, queries as string[]),
      ),
      distinctUntilChanged(deepEqual),
    );
  }

  /**
   * This method returns an observable that will emit the document
   * and then listen for changes to the document.
   *
   * @param collectionId The collection to watch
   * @param documentId The document to watch
   * @param queries The queries to apply to the document
   * @param events The events to listen for
   * @param alternativeDatabaseId The database to use
   * @returns An observable of the document
   */
  document$<DocumentShape extends Models.Document>(
    collectionId: string,
    documentId: string,
    queries: (string | Query)[] = [],
    events?: string | string[],
    alternativeDatabaseId?: string,
  ): Observable<DocumentShape | null> {
    const databaseId = alternativeDatabaseId ?? DEFAULT_DATABASE_ID();

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${databaseId}.collections.${collectionId}.documents.${documentId}`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.getDocument<DocumentShape>(
          collectionId,
          documentId,
          queries as string[],
        ),
      ),
      distinctUntilChanged(deepEqual),
    );
  }
}

/**
 * An alias for the Databases class.
 */
export const DatabasesService = Databases;

/**
 * A provider for the Databases class.
 */
export const provideDatabases = (): Provider => {
  return {
    provide: Databases,
    useClass: Databases,
  };
};
