import { inject, Injectable, Provider } from '@angular/core';
import { Databases as AppwriteDatabases, Models, Query } from 'appwrite';
import {
  distinctUntilChanged,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { deepEqual, watch } from './helpers';
import { APPWRITE_CLIENT, APPWRITE_DEFAULT_DATABASE } from './setup';
import { AppwriteErrorHandler } from './error-handler';

@Injectable({
  providedIn: 'root',
})
// @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB` instead.
export class Databases {
  private readonly _client = inject(APPWRITE_CLIENT);
  private readonly _defaultDatabaseId = inject(APPWRITE_DEFAULT_DATABASE);
  private readonly _databases = new AppwriteDatabases(this._client);
  private readonly _client$ = of(this._client).pipe(shareReplay(1));
  private readonly _errorHandler = inject(AppwriteErrorHandler);

  /**
   * List transactions across all databases.
   *
   * @param {string[]} params.queries - Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appwrite.io/docs/queries).
   * @throws {AppwriteException}
   * @returns {Promise<Models.TransactionList>}
   */
  listTransactions({
    queries,
  }: {
    queries?: string[];
  }): Promise<Models.TransactionList> {
    return this._errorHandler.wrap(
      this._databases.listTransactions({ queries }),
      {} as Models.TransactionList,
    );
  }

  /**
   * Create a new transaction.
   *
   * @param {number} params.ttl - Seconds before the transaction expires.
   * @throws {AppwriteException}
   * @returns {Promise<Models.Transaction>}
   */
  createTransaction({ ttl }: { ttl: number }): Promise<Models.Transaction> {
    return this._errorHandler.wrap(
      this._databases.createTransaction({ ttl }),
      {} as Models.Transaction,
    );
  }

  /**
   * Get a transaction by its unique ID.
   *
   * @param {string} params.transactionId - Transaction ID.
   * @throws {AppwriteException}
   * @returns {Promise<Models.Transaction>}
   */
  getTransaction({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<Models.Transaction> {
    return this._errorHandler.wrap(
      this._databases.getTransaction({ transactionId }),
      {} as Models.Transaction,
    );
  }

  /**
   * Update a transaction, to either commit or roll back its operations.
   *
   * @param {string} params.transactionId - Transaction ID.
   * @param {boolean} params.commit - Commit transaction?
   * @param {boolean} params.rollback - Rollback transaction?
   * @throws {AppwriteException}
   * @returns {Promise<Models.Transaction>}
   */
  updateTransaction({
    transactionId,
    commit,
    rollback,
  }: {
    transactionId: string;
    commit?: boolean;
    rollback?: boolean;
  }): Promise<Models.Transaction> {
    return this._errorHandler.wrap(
      this._databases.updateTransaction({
        transactionId,
        commit,
        rollback,
      }),
      {} as Models.Transaction,
    );
  }

  /**
   * Delete a transaction by its unique ID.
   *
   * @param {string} params.transactionId - Transaction ID.
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  deleteTransaction({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<Record<string, unknown>> {
    return this._errorHandler.wrap(
      this._databases.deleteTransaction({ transactionId }),
      {},
    );
  }

  /**
   * Create multiple operations in a single transaction.
   *
   * @param {string} params.transactionId - Transaction ID.
   * @param {object[]} params.operations - Array of staged operations.
   * @throws {AppwriteException}
   * @returns {Promise<Models.Transaction>}
   */
  createOperations({
    transactionId,
    operations,
  }: {
    transactionId: string;
    operations: object[];
  }): Promise<Models.Transaction> {
    return this._errorHandler.wrap(
      this._databases.createOperations({ transactionId, operations }),
      {} as Models.Transaction,
    );
  }

  /**
   * Get a list of all the user's documents in a given collection. You can use the query params to filter your results.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.collectionId - Collection ID. You can create a new collection using the Database service [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection).
   * @param {string[]} params.queries - Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appwrite.io/docs/queries). Maximum of 100 queries are allowed, each 4096 characters long.
   * @param {string} params.transactionId - Transaction ID to read uncommitted changes within the transaction.
   * @throws {AppwriteException}
   * @returns {Promise<Models.DocumentList<Document>>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.listRows` instead.
   */
  listDocuments<DocumentShape extends Models.Document>({
    collectionId,
    queries,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Models.DocumentList<DocumentShape>> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.listDocuments<DocumentShape>({
        collectionId,
        queries,
        databaseId,
        transactionId,
      }),
      {
        total: 0,
        documents: [],
      } as unknown as Models.DocumentList<DocumentShape>,
    );
  }

  /**
   * Create a new Document. Before using this route, you should create a new collection resource using either a [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
   *
   * @param {string} params.collectionId - Collection ID. You can create a new collection using the Database service [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection). Make sure to define attributes before creating documents.
   * @param {string} params.documentId - Document ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can't start with a special char. Max length is 36 chars.
   * @param {Document extends Models.DefaultDocument ? Partial<Models.Document> & Record<string, any> : Partial<Models.Document> & Omit<Document, keyof Models.Document>} params.data - Document data as JSON object.
   * @param {string[]} params.permissions - An array of permissions strings. By default, only the current user is granted all permissions. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.createRow` instead.
   */
  createDocument<Document extends Models.Document>({
    collectionId,
    documentId,
    data,
    permissions,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    data: Document extends Models.DefaultDocument
      ? Partial<Models.Document> & Record<string, unknown>
      : Partial<Models.Document> & Omit<Document, keyof Models.Document>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Document> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.createDocument<Document>({
        collectionId,
        documentId,
        data,
        permissions,
        databaseId,
        transactionId,
      }),
      {} as Document,
    );
  }

  /**
   * Get a document by its unique ID. This endpoint response returns a JSON object with the document data.
   *
   * @param {string} params.collectionId - Collection ID. You can create a new collection using the Database service [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection).
   * @param {string} params.documentId - Document ID.
   * @param {string[]} params.queries - Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appwrite.io/docs/queries). Maximum of 100 queries are allowed, each 4096 characters long.
   * @param {string} params.transactionId - Transaction ID to read uncommitted changes within the transaction.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.getRow` instead.
   */
  getDocument<DocumentShape extends Models.Document>({
    collectionId,
    documentId,
    queries,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.getDocument<DocumentShape>({
        collectionId,
        documentId,
        queries,
        databaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Create or update a Document. Before using this route, you should create a new collection resource using either a [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection) API or directly from your database console.
   *
   * @param {string} params.collectionId - Collection ID.
   * @param {string} params.documentId - Document ID.
   * @param {Document extends Models.DefaultDocument ? Partial<Models.Document> & Record<string, any> : Partial<Models.Document> & Partial<Omit<Document, keyof Models.Document>>} params.data - Document data as JSON object. Include all required attributes of the document to be created or updated.
   * @param {string[]} params.permissions - An array of permissions strings. By default, the current permissions are inherited. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.upsertRow` instead.
   */
  upsertDocument<DocumentShape extends Models.Document>({
    collectionId,
    documentId,
    data,
    permissions,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    data: DocumentShape extends Models.DefaultDocument
      ? Partial<Models.Document> & Record<string, unknown>
      : Partial<Models.Document> &
          Partial<Omit<DocumentShape, keyof Models.Document>>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.upsertDocument<DocumentShape>({
        collectionId,
        documentId,
        data,
        permissions,
        databaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Update a document by its unique ID. Using the patch method you can pass only specific fields that will get updated.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.collectionId - Collection ID.
   * @param {string} params.documentId - Document ID.
   * @param {Document extends Models.DefaultDocument ? Partial<Models.Document> & Record<string, any> : Partial<Models.Document> & Partial<Omit<Document, keyof Models.Document>>} params.data - Document data as JSON object. Include only attribute and value pairs to be updated.
   * @param {string[]} params.permissions - An array of permissions strings. By default, the current permissions are inherited. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.updateRow` instead.
   */
  updateDocument<DocumentShape extends Models.Document>({
    collectionId,
    documentId,
    data,
    permissions,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    data?: DocumentShape extends Models.DefaultDocument
      ? Partial<Models.Document> & Record<string, unknown>
      : Partial<Models.Document> &
          Partial<Omit<DocumentShape, keyof Models.Document>>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.updateDocument<DocumentShape>({
        collectionId,
        documentId,
        data,
        permissions,
        databaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Delete a document by its unique ID.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.collectionId - Collection ID. You can create a new collection using the Database service [server integration](https://appwrite.io/docs/server/databases#databasesCreateCollection).
   * @param {string} params.documentId - Document ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.deleteRow` instead.
   */
  deleteDocument({
    collectionId,
    documentId,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Record<string, unknown>> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.deleteDocument({
        collectionId,
        documentId,
        databaseId,
        transactionId,
      }),
      {},
    );
  }

  /**
   * Decrement a specific attribute of a document by a given value.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.collectionId - Collection ID.
   * @param {string} params.documentId - Document ID.
   * @param {string} params.attribute - Attribute key.
   * @param {number} params.value - Value to increment the attribute by. The value must be a number.
   * @param {number} params.min - Minimum value for the attribute. If the current value is lesser than this value, an exception will be thrown.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.decrementRowColumn` instead.
   */
  decrementDocumentAttribute({
    collectionId,
    documentId,
    attribute,
    value,
    min,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    attribute: string;
    value?: number;
    min?: number;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Models.Document> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.decrementDocumentAttribute({
        collectionId,
        documentId,
        attribute,
        value,
        min,
        databaseId,
        transactionId,
      }),
      {} as Models.Document,
    );
  }

  /**
   * Increment a specific attribute of a document by a given value.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.collectionId - Collection ID.
   * @param {string} params.documentId - Document ID.
   * @param {string} params.attribute - Attribute key.
   * @param {number} params.value - Value to increment the attribute by. The value must be a number.
   * @param {number} params.max - Maximum value for the attribute. If the current value is greater than this value, an error will be thrown.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Document>}
   * @deprecated This API has been deprecated since 1.8.0. Please use `TablesDB.incrementRowColumn` instead.
   */
  incrementDocumentAttribute({
    collectionId,
    documentId,
    attribute,
    value,
    max,
    alternateDatabaseId,
    transactionId,
  }: {
    collectionId: string;
    documentId: string;
    attribute: string;
    value?: number;
    max?: number;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Models.Document> {
    const databaseId = alternateDatabaseId ?? this._defaultDatabaseId;

    if (!databaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.incrementDocumentAttribute({
        collectionId,
        documentId,
        attribute,
        value,
        max,
        databaseId,
        transactionId,
      }),
      {} as Models.Document,
    );
  }

  /**
   * This method returns an observable that will emit the collection list
   * and then listen for changes to the collection.
   *
   * @param params.collectionId The collection to watch
   * @param params.queries The queries to apply to the collection
   * @param params.events The events to listen for
   * @param params.alternateDatabaseId The database to use
   * @returns An observable of the collection
   */
  collection$<DocumentShape extends Models.Document>({
    collectionId,
    queries,
    events,
    alternateDatabaseId = this._defaultDatabaseId,
  }: {
    collectionId: string;
    queries: (string | Query)[];
    events?: string | string[];
    alternateDatabaseId?: string;
  }): Observable<Models.DocumentList<DocumentShape>> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${alternateDatabaseId}.collections.${collectionId}.documents`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.listDocuments<DocumentShape>({
          collectionId,
          queries: queries as string[],
          alternateDatabaseId,
        }),
      ),
      distinctUntilChanged(deepEqual),
    );
  }

  /**
   * This method returns an observable that will emit the document
   * and then listen for changes to the document.
   *
   * @param params.collectionId The collection to watch
   * @param params.documentId The document to watch
   * @param params.queries The queries to apply to the document
   * @param params.events The events to listen for
   * @param params.alternateDatabaseId The database to use
   * @returns An observable of the document
   */
  document$<DocumentShape extends Models.Document>({
    collectionId,
    documentId,
    queries,
    events,
    alternateDatabaseId = this._defaultDatabaseId,
  }: {
    collectionId: string;
    documentId: string;
    queries: (string | Query)[];
    events?: string | string[];
    alternateDatabaseId?: string;
  }): Observable<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${alternateDatabaseId}.collections.${collectionId}.documents.${documentId}`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.getDocument<DocumentShape>({
          collectionId,
          documentId,
          queries: queries as string[],
          alternateDatabaseId,
        }),
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
