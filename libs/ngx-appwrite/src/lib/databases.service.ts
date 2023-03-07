import { Injectable } from '@angular/core';
import { Databases, ID, Models, Query, RealtimeResponseEvent } from 'appwrite';
import { produce } from 'immer';
import { map, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';
import { AccountService } from './account.service';
import { AppwriteConfig } from './appwrite.config';
import { ClientService } from './client.service';
import { watch } from './helpers';

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
   
   * @param {Omit<Document, keyof Models.Document>} data
   * @param {string[]} [permissions] 
   * @param {string} [documentId]
   * defaults to ID.unique()
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async createDocument<DocumentType>(
    collectionId: string,
    data: Omit<DocumentType & Models.Document, keyof Models.Document>,
    permissions?: string[],
    documentId: string = ID.unique(),
    alternateDatabaseId?: string
  ): Promise<DocumentType & Models.Document> {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.createDocument<DocumentType & Models.Document>(
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
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async getDocument<DocumentType>(
    collectionId: string,
    documentId: string = ID.unique(),
    alternateDatabaseId?: string
  ): Promise<DocumentType & Models.Document> {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.getDocument<DocumentType & Models.Document>(
        databaseId,
        collectionId,
        documentId
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
   * @returns {Promise}
   */
  public async listDocuments<DocumentType>(
    collectionId: string,
    queries?: string[],
    alternateDatabaseId?: string
  ): Promise<Models.DocumentList<DocumentType & Models.Document>> {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.listDocuments<DocumentType & Models.Document>(
        databaseId,
        collectionId,
        queries
      );
    }
  }
  /**
   * Update Document
   *
   * Update a document by its unique ID. Using the patch method you can pass
   * only specific fields that will get updated.
   *
   * @param {string} databaseId
   * @param {string} collectionId
   * @param {string} documentId
   * @param {Partial<Omit<Document, keyof Models.Document>>} data
   * @param {string[]} permissions
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public async updateDocument<DocumentType>(
    collectionId: string,
    documentId: string,
    data: Omit<DocumentType & Models.Document, keyof Models.Document>,
    permissions?: string[],
    alternateDatabaseId?: string
  ): Promise<(DocumentType & Models.Document) | undefined> {
    const databaseId = this._config?.defaultDatabase ?? alternateDatabaseId;
    if (!databaseId) {
      throw new Error(DATABASE_ERROR);
    } else {
      this.accountService.triggerAuthCheck();
      return this._databases.updateDocument<DocumentType & Models.Document>(
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
   * @param {string} databaseId
   * @param {string} collectionId
   * @param {string} documentId
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
   * @param {string[]} queries
   * @param {string | string[]} events
   * @param {string} alternativeDatabaseId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public collection$<DocumentType>(
    collectionId: string,
    queries: string[] = [],
    events?: string | string[],
    alternativeDatabaseId?: string
  ): Observable<(DocumentType & Models.Document)[]> {
    // check if required data is present runtime
    const { path, databaseId } = this._generatePath(
      alternativeDatabaseId,
      collectionId
    );
    return this.databases$.pipe(
      switchMap((databases) => {
        return databases.listDocuments(databaseId, collectionId, queries);
      }),
      // the original retrieved object is not extendible, which is, however, requiered in order to make an extensible document list
      switchMap((initialList: Models.DocumentList<Models.Document>) =>
        this._collectionDataStream(path, events, initialList)
      ),
      map(
        (res: Models.DocumentList<Models.Document>) =>
          res.documents as (DocumentType & Models.Document)[]
      ),
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
   * @param {string | string[]} events
   * @param {string} alternativeDatabaseId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  public document$<DocumentType>(
    collectionId: string,
    documentId: string,
    events?: string | string[],
    alternativeDatabaseId?: string
  ): Observable<(DocumentType & Models.Document) | null> {
    return this.collection$<DocumentType>(
      collectionId,
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
      })
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

  private _collectionDataStream(
    path: string,
    events: string | string[] | undefined,
    initialList: Models.DocumentList<Models.Document>
  ): Observable<Models.DocumentList<Models.Document>> {
    return this._client$.pipe(
      switchMap((client) => watch<Models.Document>(client, path, events)),
      map((res: RealtimeResponseEvent<Models.Document>) => {
        return produce(initialList, (draft) => {
          if (res.events.includes(`${path}.${res.payload.$id}.update`)) {
            this._replaceDocument(
              res.payload.$id,
              draft.documents,
              res.payload
            );
          }

          if (res.events.includes(`${path}.${res.payload.$id}.create`)) {
            draft.documents.push(res.payload);
          }

          if (res.events.includes(`${path}.${res.payload.$id}.delete`)) {
            this._removeDocument(res.payload.$id, draft.documents);
          }
        });
      }),
      startWith(initialList)
    );
  }

  private _removeDocument(
    $id: string,
    list: Models.Document[]
  ): Models.Document[] {
    const index = list.findIndex((x) => x.$id === $id);
    list.splice(index, 1);
    return list;
  }

  private _replaceDocument(
    $id: string,
    list: Models.Document[],
    newDocument: Models.Document
  ): Models.Document[] {
    const index = list.findIndex((x) => x.$id === $id);
    list[index] = newDocument;
    return list;
  }
}
