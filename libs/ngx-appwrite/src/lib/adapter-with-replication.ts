/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { ID } from 'appwrite';
import {
  createRxDatabase,
  MangoQuerySelector,
  RxCollection,
  RxDocument,
  RxJsonSchema,
  StringKeys,
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
  private _collection: RxCollection<DocumentShape> | undefined;
  private _isReady$ = new BehaviorSubject<boolean>(false);
  private isReady$ = this._isReady$.asObservable().pipe(filter(Boolean));
  private _primaryKey: StringKeys<DocumentShape> | undefined;

  // * Create and return the replication state
  public async startReplication(rxdbReplication: {
    rxdbDatabasename: string;
    collectionId: string;
    rxdbSchema: RxJsonSchema<DocumentShape>;
  }) {
    this._primaryKey = rxdbReplication.rxdbSchema
      .primaryKey as StringKeys<DocumentShape>;

    const db = await createRxDatabase<
      Record<string, RxCollection<DocumentShape>>
    >({
      name: rxdbReplication.rxdbDatabasename,
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageLocalstorage(),
      }),
      multiInstance: true,
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
    return { replicationState, db };
  }

  public async create(
    data: Omit<DocumentShape, StringKeys<DocumentShape>>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    const document: RxDocument<DocumentShape> = await this._collection!.insert({
      [this._primaryKey as string]: ID.unique(),
      ...data,
    } as unknown as DocumentShape);
    return document;
  }

  public async update(
    document: DocumentShape,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    if (!this._primaryKey || !document[this._primaryKey]) {
      throw new Error(
        `Can not update a document that has no ${this._primaryKey}`,
      );
    }

    return this.upsert(document as DocumentShape);
  }

  public async upsert(
    data: DocumentShape | Omit<DocumentShape, StringKeys<DocumentShape>>,
  ): Promise<RxDocument<DocumentShape>> {
    this._checkForCollection();

    // make sure the document has an id
    if (!(data as any)[this._primaryKey]) {
      (data as any)[this._primaryKey] = ID.unique();
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

    let finalSelector: MangoQuerySelector<DocumentShape>;

    if (typeof idOrQuery === 'string') {
      finalSelector = {
        [this._primaryKey as string]: { $eq: idOrQuery },
      } as MangoQuerySelector<DocumentShape>;
    } else {
      finalSelector = idOrQuery;
    }

    const foundDocuments = await this._collection!.find({
      selector: finalSelector,
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
        let finalSelector: MangoQuerySelector<DocumentShape> | undefined;
        if (typeof queryObj === 'string') {
          finalSelector = {
            [this._primaryKey as string]: queryObj,
          } as MangoQuerySelector<DocumentShape>;
        } else {
          finalSelector = queryObj;
        }
        return this._collection!.find({
          selector: finalSelector,
        }).$;
      }),
    );

    return documentList$.pipe(map((documents) => documents[0] ?? null));
  }

  // return the raw data directly instead of RxDocument
  public raw = {
    create: async (data: Omit<DocumentShape, StringKeys<DocumentShape>>) => {
      const document: RxDocument<DocumentShape> = await this.create(data);
      return document.toJSON();
    },
    update: async (document: RxDocument<DocumentShape>) => {
      const updatedDocument: RxDocument<DocumentShape> =
        await this.update(document);
      return updatedDocument.toJSON();
    },
    upsert: async (
      data: DocumentShape | Omit<DocumentShape, StringKeys<DocumentShape>>,
    ) => {
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
