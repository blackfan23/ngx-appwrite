/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@angular/core';
import { Databases, ID, Models, Query } from 'appwrite';
import {
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { z, ZodRawShape } from 'zod';
import { AccountService } from './account.service';
import { AppwriteConfig } from './appwrite.config';
import { ClientService } from './client.service';
import { deepEqual, ObjectValidationType, watch } from './helpers';
import { AppwriteDocumentSchema } from './schemas/document.schema';

const DATABASE_ERROR =
  'No Database ID provided or database not initialized, use alternateDatabaseId argument';

@Injectable({
  providedIn: 'root',
})
export class DatabasesService {
  private _databases: Databases;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));
  private _config: AppwriteConfig;

  private databases$ = this._client$.pipe(
    map(() => this._databases),
    shareReplay(1)
  );

  constructor(
    private clientService: ClientService,
    private accountService: AccountService
  ) {
    this._config = this.clientService.config;
    this._databases = new Databases(this.clientService.client);
  }

  /* -------------------------------------------------------------------------- */
  /*     Databases - Appwrite API https://appwrite.io/docs/client/databases     */
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
   * @param {unknown} data
   * @param {string[]} [permissions] 
   * @param {string} [documentId]
   * defaults to ID.unique()
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async createDocument(
    collectionId: string,
    data: Omit<Models.Document, keyof Models.Document>,
    permissions?: string[],
    documentId: string = ID.unique(),
    alternateDatabaseId?: string
  ) {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.createDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
      );
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
   * @param {ObjectValidationType<ZodShape>} validationSchema
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async getDocument<ZodShape extends z.ZodRawShape>(
    collectionId: string,
    documentId: string,
    validationSchema: ObjectValidationType<ZodShape>,
    alternateDatabaseId?: string
  ) {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();

      const resultingDocument = await this._databases.getDocument(
        databaseId,
        collectionId,
        documentId
      );

      return AppwriteDocumentSchema.merge(validationSchema).parse(
        resultingDocument
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
   * @param {ObjectValidationType<ZodShape>} validationSchema
   * @param {string[]} queries
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async listDocuments<ZodShape extends z.ZodRawShape>(
    collectionId: string,
    validationSchema: ObjectValidationType<ZodShape>,
    queries?: string[],
    alternateDatabaseId?: string
  ) {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      const listedDocuments = await this._databases.listDocuments<
        ZodShape & Models.Document
      >(databaseId, collectionId, queries);

      const validatedListedDocuments = {
        total: listedDocuments.total,
        documents: listedDocuments.documents.map((doc) => {
          return AppwriteDocumentSchema.merge(validationSchema).parse(doc);
        }),
      };

      return validatedListedDocuments;
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
   * @returns {Promise}
   */
  public async updateDocument(
    collectionId: string,
    documentId: string,
    data: Partial<Omit<Models.Document, keyof Models.Document>> | undefined,
    permissions?: string[],
    alternateDatabaseId?: string
  ) {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();

      return this._databases.updateDocument(
        databaseId,
        collectionId,
        documentId,
        data,
        permissions
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
   * @returns {Promise}
   */
  public async deleteDocument(
    collectionId: string,
    documentId: string,
    alternateDatabaseId?: string
  ): Promise<Record<string, unknown> | undefined> {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.deleteDocument(
        databaseId,
        collectionId,
        documentId
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
   * @param {ObjectValidationType<ZodShape>} validationSchema
   * @param {string[]} [queries]
   * @param {string | string[]} [events]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public collection$<ZodShape extends ZodRawShape>(
    collectionId: string,
    validationSchema: ObjectValidationType<ZodShape>,
    queries: string[] = [],
    events?: string | string[],
    alternativeDatabaseId?: string
  ) {
    // check if required data is present runtime
    const { path } = this._generatePath(alternativeDatabaseId, collectionId);
    return this._client$.pipe(
      switchMap((client) => watch<Models.Document>(client, path, events)),
      startWith(true),
      switchMap(() => {
        return this.listDocuments(collectionId, validationSchema, queries);
      }),
      distinctUntilChanged((a, b) => deepEqual(a, b)),
      map((res) => res.documents),
      shareReplay(1)
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
   * @param {ObjectValidationType<ZodShape>} validationSchema
   * @param {string | string[]} [events]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public document$<DocumentType extends ZodRawShape>(
    collectionId: string,
    documentId: string,
    validationSchema: ObjectValidationType<DocumentType>,
    events?: string | string[],
    alternativeDatabaseId?: string
  ) {
    return this.collection$<DocumentType>(
      collectionId,
      validationSchema,
      [Query.equal('$id', documentId)],
      events,
      alternativeDatabaseId
    ).pipe(
      map((res) => {
        if (res[0]) {
          return res[0];
        } else {
          return null;
        }
      }),
      shareReplay(1)
    );
  }

  // query listening is done manually for now
  // watch this Issue
  // https://github.com/appwrite/appwrite/issues/2490
  // https://appwrite.io/docs/databases#querying-documents
  // right now this is resolved by only watching ids of the original query list

  /* ----------------------------- Private Helpers ---------------------------- */

  private _generatePath(
    alternativeDatabaseId: string | undefined,
    collectionId: string
  ) {
    const databaseId = this._config?.defaultDatabase ?? alternativeDatabaseId;
    if (!databaseId) {
      throw new Error(
        'No Database ID provided or database not initialized, use alternateDatabaseId argument'
      );
    }
    // generate collection path
    const path = `databases.${databaseId}.collections.${collectionId}.documents`;
    return { path, databaseId };
  }
}
