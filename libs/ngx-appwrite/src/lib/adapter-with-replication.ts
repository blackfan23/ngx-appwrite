/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { ID } from 'appwrite';
import {
  createRxDatabase,
  MangoQuerySelector,
  RxCollection,
  RxDocument,
  RxJsonSchema,
} from 'rxdb';
import { replicateAppwrite } from 'rxdb/plugins/replication-appwrite';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import {
  BehaviorSubject,
  filter,
  firstValueFrom,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { CLIENT } from './setup';

@Injectable()
export abstract class AppwriteAdapterWithReplication<DocumentShape> {
  private _collection: RxCollection | undefined;
  private _isReady$ = new BehaviorSubject<boolean>(false);
  private isReady$ = this._isReady$.asObservable().pipe(filter(Boolean));

  // * Create and return the replication state
  public async startReplication(rxdbReplication: {
    rxdbDatabasename: string;
    collectionId: string;
    rxdbSchema: RxJsonSchema<DocumentShape>;
  }) {
    const db = await createRxDatabase({
      name: rxdbReplication.rxdbDatabasename,
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageLocalstorage(),
      }),
    });

    await db.addCollections({
      [rxdbReplication.collectionId]: {
        schema: rxdbReplication.rxdbSchema,
      },
    });

    this._collection = db[rxdbReplication.collectionId];

    // start replication
    const replicationState = replicateAppwrite({
      replicationIdentifier: `appwrite-replication-${rxdbReplication.collectionId}`,
      client: CLIENT(),
      databaseId: rxdbReplication.rxdbDatabasename,
      collectionId: rxdbReplication.collectionId,
      deletedField: 'deleted', // Field that represents deletion in Appwrite
      collection: this._collection,
      pull: {
        batchSize: 10,
      },
      push: {
        batchSize: 10,
      },
      /*
       * ...
       * You can set all other options for RxDB replication states
       * like 'live' or 'retryTime'
       * ...
       */
    });
    this._isReady$.next(true);
    return replicationState;
  }

  public async create<PrimaryKey extends string = 'id'>(
    data: Omit<DocumentShape, PrimaryKey>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    const document: RxDocument<DocumentShape> = await this._collection!.insert({
      id: ID.unique(),
      ...data,
    });
    return document;
  }

  public async update(
    document: RxDocument<DocumentShape>,
    newData: Partial<DocumentShape>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    const data: RxDocument<DocumentShape> = await document.patch(newData);
    return data;
  }

  public async upsert<PrimaryKey extends string = 'id'>(
    data: DocumentShape | Omit<DocumentShape, PrimaryKey>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    // make sure the document has an id
    if (!(data as any).id) {
      (data as any).id = ID.unique();
    }

    const document: RxDocument<DocumentShape> = await this._collection!.upsert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data as Partial<any>,
    );

    return document;
  }

  // this does not actually delete the document on appwrite, it only marks it so
  public async delete(
    document: RxDocument<DocumentShape>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();
    return document.remove();
  }

  public async document(
    idOrQuery: string | MangoQuerySelector<DocumentShape>,
  ): Promise<RxDocument<DocumentShape> | null> {
    await firstValueFrom(this.isReady$);
    this._checkForCollection();
    const foundDocuments = await this._collection!.find({
      selector: {
        id:
          typeof idOrQuery === 'string'
            ? {
                $eq: idOrQuery,
              }
            : idOrQuery,
      },
    }).exec();
    if (foundDocuments.length > 0) {
      return foundDocuments[0];
    } else {
      return null;
    }
  }

  public async documentList(
    queryObj?: MangoQuerySelector<DocumentShape> | undefined,
  ): Promise<RxDocument<DocumentShape>[]> {
    await firstValueFrom(this.isReady$);
    this._checkForCollection();
    const foundDocuments = await this._collection!.find({
      selector: queryObj,
    }).exec();

    return foundDocuments;
  }

  public documentList$(
    queryObj?: MangoQuerySelector<DocumentShape> | undefined,
  ): Observable<RxDocument<DocumentShape>[]> {
    const documentList$ = this._isReady$.pipe(
      filter(Boolean),
      switchMap(() => {
        return this._collection!.find({
          selector: queryObj,
        }).$;
      }),
    );

    return documentList$;
  }

  public document$(
    queryObj?: string | MangoQuerySelector<DocumentShape> | undefined,
  ): Observable<RxDocument<DocumentShape> | null> {
    const documentList$ = this._isReady$.pipe(
      filter(Boolean),
      switchMap(() => {
        return this._collection!.find({
          selector: typeof queryObj === 'string' ? { id: queryObj } : queryObj,
        }).$;
      }),
    );

    return documentList$.pipe(map((documents) => documents[0] ?? null));
  }

  // return the raw data directly instead of RxDocument
  public raw = {
    create: async (data: Omit<DocumentShape, 'id'>) => {
      const document: RxDocument<DocumentShape> = await this.create(data);
      return document.toJSON();
    },
    update: async (
      document: RxDocument<DocumentShape>,
      newData: Partial<DocumentShape>,
    ) => {
      const updatedDocument: RxDocument<DocumentShape> = await this.update(
        document,
        newData,
      );
      return updatedDocument.toJSON();
    },
    upsert: async (data: DocumentShape | Omit<DocumentShape, 'id'>) => {
      const document: RxDocument<DocumentShape> = await this.upsert(data);
      return document.toJSON();
    },
    delete: async (document: RxDocument<DocumentShape>) => {
      const deletedDocument: RxDocument<DocumentShape> =
        await this.delete(document);
      return deletedDocument.toJSON();
    },
    document: async (idOrQuery: string | MangoQuerySelector<DocumentShape>) => {
      const document: RxDocument<DocumentShape> | null =
        await this.document(idOrQuery);
      return document?.toJSON() ?? null;
    },
    documentList: async (
      queryObj?: MangoQuerySelector<DocumentShape> | undefined,
    ) => {
      const documents: RxDocument<DocumentShape>[] =
        await this.documentList(queryObj);
      return documents.map((document) => document.toJSON());
    },
    document$: (
      queryObj?: string | MangoQuerySelector<DocumentShape> | undefined,
    ) => {
      const document$: Observable<RxDocument<DocumentShape> | null> =
        this.document$(queryObj);
      return document$.pipe(map((document) => document?.toJSON() ?? null));
    },
    documentList$: (
      queryObj?: MangoQuerySelector<DocumentShape> | undefined,
    ) => {
      const documentList$: Observable<RxDocument<DocumentShape>[]> =
        this.documentList$(queryObj);
      return documentList$.pipe(
        map((documents) => documents.map((document) => document.toJSON())),
      );
    },
  };

  private _checkForCollection() {
    if (!this._collection) {
      throw new Error(
        'RxDB collection not found, did you remember to call startReplication and are the ids for the database and collection the same on your appwrite server?',
      );
    }
  }
}
