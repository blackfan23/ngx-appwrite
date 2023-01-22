import { Injectable } from '@angular/core';
import { Databases, ID, Models, Query, RealtimeResponseEvent } from 'appwrite';
import { produce } from 'immer';
import {
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
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
  private _databases: Databases | undefined;
  private _client$ = of(this.clientService.client).pipe(shareReplay(1));

  config: AppwriteConfig | undefined;

  databases$ = this._client$.pipe(
    map((client) => {
      if (!this._databases) {
        this._databases = new Databases(client);
      }
      return this._databases;
    }),
    shareReplay(1)
  );

  constructor(
    private clientService: ClientService,
    private accountService: AccountService
  ) {
    this.config = this.clientService.config;
  }

  /* -------------------------------------------------------------------------- */
  /*                              Databases Realtime                             */
  /* -------------------------------------------------------------------------- */
  /* --------------- https://appwrite.io/docs/realtime#channels --------------- */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                                Database CRUD                               */
  /* -------------------------------------------------------------------------- */

  public async createDocument<DocumentType>(
    collectionId: string,
    data: Omit<DocumentType & Models.Document, keyof Models.Document>,
    permissions?: string[],
    documentId: string = ID.unique(),
    alternateDatabaseId?: string
  ): Promise<(DocumentType & Models.Document) | undefined> {
    try {
      const databaseId = this.config?.defaultDatabase ?? alternateDatabaseId;
      if (!databaseId) {
        throw new Error(DATABASE_ERROR);
      } else {
        this.accountService.triggerAuthCheck();
        return firstValueFrom(
          this.databases$.pipe(
            switchMap((db) =>
              db.createDocument<DocumentType & Models.Document>(
                databaseId,
                collectionId,
                documentId,
                data,
                permissions
              )
            )
          )
        );
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async updateDocument<DocumentType>(
    collectionId: string,
    documentId: string,
    data: Omit<DocumentType & Models.Document, keyof Models.Document>,
    permissions?: string[],
    alternateDatabaseId?: string
  ): Promise<(DocumentType & Models.Document) | undefined> {
    try {
      const databaseId = this.config?.defaultDatabase ?? alternateDatabaseId;
      if (!databaseId) {
        throw new Error(DATABASE_ERROR);
      } else {
        this.accountService.triggerAuthCheck();
        return firstValueFrom(
          this.databases$.pipe(
            switchMap((db) =>
              db.updateDocument<DocumentType & Models.Document>(
                databaseId,
                collectionId,
                documentId,
                data,
                permissions
              )
            )
          )
        );
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public async deleteDocument(
    collectionId: string,
    documentId: string,
    alternateDatabaseId?: string
  ): Promise<Record<string, unknown> | undefined> {
    try {
      const databaseId = this.config?.defaultDatabase ?? alternateDatabaseId;
      if (!databaseId) {
        throw new Error(DATABASE_ERROR);
      } else {
        this.accountService.triggerAuthCheck();
        return firstValueFrom(
          this.databases$.pipe(
            switchMap((db) =>
              db.deleteDocument(databaseId, collectionId, documentId)
            )
          )
        );
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  /* ----------------------------- Private Helpers ---------------------------- */

  private _generatePath(
    alternativeDatabaseId: string | undefined,
    collectionId: string
  ) {
    const databaseId = this.config?.defaultDatabase ?? alternativeDatabaseId;
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
