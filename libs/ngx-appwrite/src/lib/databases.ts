/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, inject } from '@angular/core';
import { Databases as AppwriteDatabases, ID, Models, Query } from 'appwrite';
import {
  Observable,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { Account } from './account';
import { deepEqual, watch } from './helpers';
import { CLIENT, DEFAULT_DATABASE_ID } from './setup';

const DATABASE_ERROR = `No Database ID provided or database not initialized, 
  use >>alternateDatabaseId << param`;

@Injectable({
  providedIn: 'root',
})
export class Databases {
  private accountService = inject(Account);
  private _databases: AppwriteDatabases = new AppwriteDatabases(CLIENT());
  private _client$ = of(CLIENT()).pipe(shareReplay(1));

  /* -------------------------------------------------------------------------- */
  /*     Databases - CRUD - Appwrite API https://appwrite.io/docs/client/databases     */
  /* -------------------------------------------------------------------------- */

  /**
   * Create Document
   *
   * Create a new Document. Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   *
   
   * @param {string} collectionId
   * @param {Record<string, unknown>} data
   * @param {string[]} [permissions] 
   * @param {string} [documentId]
   * defaults to ID.unique()
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async createDocument<DocumentShape extends Record<string, unknown>>(
    collectionId: string,
    data: DocumentShape,
    permissions?: string[],
    documentId: string = ID.unique(),
    alternateDatabaseId?: string,
  ): Promise<DocumentShape & Models.Document> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        this._cleanData(data),
        permissions,
      );
    }
  }

  /**
   * Upsert Document
   *
   * Create a new Document if it can't be found (using $id), otherwise the document is updated.
   *
   * This will use incurr a read and a write to the database.
   *
   * Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   *
   * @param {string} collectionId
   * @param {Record<string, unknown>} data
   * @param {string[]} [permissions]
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async upsertDocument<DocumentShape extends Models.Document>(
    collectionId: string,
    data: Partial<DocumentShape>,
    permissions?: string[],
    alternateDatabaseId?: string,
  ): Promise<Models.Document & DocumentShape> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();

      const id = data.$id ?? ID.unique();
      try {
        // try to retrieve the document if it does exist update it
        const doc = await this.getDocument<DocumentShape>(collectionId, id);

        const merged = { ...doc, ...data };
        return this.updateDocument<DocumentShape>(collectionId, id, merged);
      } catch (error) {
        return this.createDocument(
          collectionId,
          this._cleanData(data),
          permissions,
          ID.unique(),
          databaseId,
        );
      }
    }
  }

  /**
   * Get Document
   *
   * Get a document by its unique ID. This endpoint response returns a JSON
   * object with the document data.
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async getDocument<DocumentShape extends Models.Document>(
    collectionId: string,
    documentId: string,
    alternateDatabaseId?: string,
  ): Promise<DocumentShape> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();

      return this._databases.getDocument<DocumentShape>(
        databaseId,
        collectionId,
        documentId,
      );
    }
  }

  /**
   * List Documents
   *
   * Get a list of all the user's documents in a given collection. You can use
   * the query params to filter your results.
   *
   * @param {string} collectionId
   * @param {string[]} queries
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {PromisePromise<{total: number; documents: (Input<typeof AppwriteDocumentSchema> & Input<typeof  validationSchema>)[]; }>}
   */
  public async listDocuments<DocumentShape extends Models.Document>(
    collectionId: string,
    queries?: string[],
    alternateDatabaseId?: string,
  ): Promise<Models.DocumentList<DocumentShape>> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.listDocuments<DocumentShape>(
        databaseId,
        collectionId,
        queries,
      );
    }
  }
  /**
   * Update Document
   *
   * Update a document by its unique ID. Using the patch method you can pass
   * only specific fields that will get updated.
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {unknown} data
   * @param {string[]} [permissions]
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async updateDocument<DocumentShape extends Models.Document>(
    collectionId: string,
    documentId: string,
    data: Partial<DocumentShape>,
    permissions?: string[],
    alternateDatabaseId?: string,
  ): Promise<DocumentShape> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.updateDocument<DocumentShape>(
        databaseId,
        collectionId,
        documentId,
        this._cleanData(data),
        permissions,
      );
    }
  }

  /**
   * Delete Document
   *
   * Delete a document by its unique ID.
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<void>}
   */
  public async deleteDocument(
    collectionId: string,
    documentId: string,
    alternateDatabaseId?: string,
  ): Promise<Record<string, unknown>> {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.deleteDocument(
        databaseId,
        collectionId,
        documentId,
      );
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                              Databases Realtime                             */
  /* -------------------------------------------------------------------------- */
  /* --------------- https://appwrite.io/docs/realtime#channels --------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * Monitor Collection
   *
   * Monitors real-time changes in a collection. Uses the configured default database
   * An alternate database can be provided if needed
   *
   * @param {string} collectionId
   * @param {string[]} [queries]
   * @param {string | string[]} [events]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Observable<(Input<typeof AppwriteDocumentSchema> & Input<typeof validationSchema>)[]>}
   */
  public collection$<DocumentShape extends Models.Document>(
    collectionId: string,
    queries: string[] = [],
    events?: string | string[],
    alternativeDatabaseId?: string,
  ): Observable<Models.DocumentList<DocumentShape>> {
    // check if required data is present runtime
    const { path } = this._generatePath(alternativeDatabaseId, collectionId);
    return this._client$.pipe(
      switchMap((client) => watch<Models.Document>(client, path, events)),
      startWith(true),
      switchMap(() => {
        return this.listDocuments<DocumentShape>(collectionId, queries);
      }),
      distinctUntilChanged((a, b) => deepEqual(a, b)),
      shareReplay(1),
    );
  }

  /**
   * Monitor Docuemnt
   *
   * Monitors real-time changes in a document. Uses the configured default database
   * An alternate database can be provided if needed
   *
   * @param {string} collectionId
   * @param {string} documentId
   * @param {string | string[]} [events]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Observable<(Input<typeof AppwriteDocumentSchema> & Input<typeof validationSchema>) | null>}
   */
  public document$<DocumentShape extends Models.Document>(
    collectionId: string,
    documentId: string,
    events?: string | string[],
    alternativeDatabaseId?: string,
  ): Observable<DocumentShape | null> {
    return this.collection$<DocumentShape>(
      collectionId,
      [Query.equal('$id', documentId)],
      events,
      alternativeDatabaseId,
    ).pipe(
      map((res: Models.DocumentList<DocumentShape>) => {
        if (res.documents[0]) {
          return res.documents[0];
        } else {
          return null;
        }
      }),
      shareReplay(1),
    );
  }

  // TODO: query listening is done manually for now
  // watch this Issue
  // https://github.com/appwrite/appwrite/issues/2490
  // https://appwrite.io/docs/databases#querying-documents
  // right now this is resolved by only watching ids of the original query list

  /* ----------------------------- Private Helpers ---------------------------- */
  private _generatePath(
    alternativeDatabaseId: string | undefined,
    collectionId: string,
  ) {
    const databaseId = DEFAULT_DATABASE_ID() ?? alternativeDatabaseId;
    if (!databaseId) {
      throw new Error(
        'No Database ID provided or database not initialized, use alternateDatabaseId argument',
      );
    }
    // generate collection path
    const path = `databases.${databaseId}.collections.${collectionId}.documents`;
    return { path, databaseId };
  }

  // remove the document meta data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _cleanData(data: any) {
    delete data.$collectionId;
    delete data.$permissions;
    delete data.$databaseId;
    delete data.$createdAt;
    delete data.$updatedAt;
    delete data.$id;
    return data;
  }
}
