/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, inject } from '@angular/core';
import { ID, Models } from 'appwrite';
import { RxCollection, RxJsonSchema, createRxDatabase } from 'rxdb';
import { replicateAppwrite } from 'rxdb/plugins/replication-appwrite';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { Observable, map } from 'rxjs';
import { Databases } from './databases';
import { CLIENT } from './setup';

export interface RxDBReplication {
  rxdbDatabasename: string;
  rxdbSchema: RxJsonSchema<any>;
}

@Injectable()
export abstract class AppwriteAdapter<DocumentShape extends Models.Document> {
  private databases = inject(Databases);
  protected abstract collectionId: string;
  protected abstract validationFn:
    | undefined
    | ((data: unknown) => DocumentShape);
  private collection: RxCollection | undefined = undefined;

  public async activateReplication(rxdbReplication: RxDBReplication) {
    if (rxdbReplication) {
      const db = await createRxDatabase({
        name: rxdbReplication.rxdbDatabasename,
        storage: getRxStorageLocalstorage(),
      });

      await db.addCollections({
        [this.collectionId]: {
          schema: rxdbReplication.rxdbSchema,
        },
      });

      this.collection = db[this.collectionId];

      // start replication
      const replicationState = replicateAppwrite({
        replicationIdentifier: `appwrite-replication-${this.collectionId}`,
        client: CLIENT(),
        databaseId: rxdbReplication.rxdbDatabasename,
        collectionId: this.collectionId,
        deletedField: 'deleted', // Field that represents deletion in Appwrite
        collection: this.collection,
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
    }
  }

  /**
   * Create Document
   *
   * Create a new Document. Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   * @param {DocumentShape} awDocument
   * @param {string[]} [permissions]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async create(
    awDocument: Omit<
      DocumentShape,
      | '$id'
      | '$collectionId'
      | '$databaseId'
      | '$updatedAt'
      | '$createdAt'
      | '$permissions'
    >,
    permissions: string[] = [],
    documentId: string = ID.unique(),
    alternativeDatabaseId?: string,
  ): Promise<DocumentShape> {
    let data: unknown;

    if (this.collection) {
      data = await this.collection.insert(awDocument);
    } else {
      data = await this.databases.createDocument<
        Omit<
          DocumentShape,
          | '$id'
          | '$collectionId'
          | '$databaseId'
          | '$updatedAt'
          | '$createdAt'
          | '$permissions'
        >
      >(
        this.collectionId,
        awDocument,
        permissions,
        documentId,
        alternativeDatabaseId,
      );
    }

    if (this.validationFn) {
      return this.validationFn(data);
    }
    return data as DocumentShape;
  }

  /**
   * Update Document
   *
   * Updates a Document. Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   * @param {Partial<DocumentShape>} awDocument
   * @param {string[]} [permissions]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<T & Models.Document>}
   */
  public async update(
    awDocument: Partial<DocumentShape> & { $id: string },
    permissions: string[] = [],
    alternativeDatabaseId?: string,
  ) {
    console.log(awDocument);
    if (!awDocument.$id) {
      throw new Error('Document must have an id');
    }

    let data = undefined;
    if (this.collection) {
      const foundDocuments = await this.collection
        .find({
          selector: {
            $id: {
              $eq: awDocument.$id,
            },
          },
        })
        .exec();
      console.log(
        '🚀 ~ AppwriteAdapter<DocumentShape ~ foundDocuments:',
        foundDocuments,
      );

      if (foundDocuments.length === 0) {
        throw new Error('Document not found');
      } else {
        data = await foundDocuments[0].patch(awDocument);
      }
    } else {
      data = await this.databases.updateDocument<DocumentShape>(
        this.collectionId,
        awDocument.$id,
        awDocument,
        permissions,
        alternativeDatabaseId,
      );
    }

    if (this.validationFn) {
      return this.validationFn(data);
    }
    return data;
  }

  /**
   * Upsert Document
   *
   * Upserts a Document. If an { $id: string } exists on the document, it is updated, otherwise a new document is created
   * Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   * @param {DocumentShape} awDocument
   * @param {string[]} [permissions]
   * @param {string} [alternativeDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<T & Models.Document>}
   */
  public async upsert(
    awDocument: Partial<DocumentShape>,
    permissions: string[] = [],
    alternativeDatabaseId?: string,
  ) {
    const data = await this.databases.upsertDocument<DocumentShape>(
      this.collectionId,
      awDocument,
      permissions,
      alternativeDatabaseId,
    );

    if (this.validationFn) {
      return this.validationFn(data);
    }
    return data;
  }
  /**
   * Delete Document
   *
   * Deletes a Document.
   * Takes either a document id or a document object with an id
   * @param {DocumentShape | string} awDocumentIdOrAwDocument
   * @param {string} [alternateDatabaseId]
   * @throws {AppwriteException}
   * @returns {Promise<T & Models.Document>}
   */
  public async delete(
    awDocumentIdOrAwDocument:
      | string
      | (Partial<DocumentShape> & { $id: string }),
    alternateDatabaseId?: string,
  ) {
    const id =
      typeof awDocumentIdOrAwDocument === 'string'
        ? awDocumentIdOrAwDocument
        : awDocumentIdOrAwDocument.$id;

    if (!id) {
      throw new Error('Document must have an id to be deleted');
    }
    return this.databases.deleteDocument(
      this.collectionId,
      id,
      alternateDatabaseId,
    );
  }

  public async document(
    documentId: string,
    alternativeDatabaseId?: string,
  ): Promise<DocumentShape> {
    const data = await this.databases.getDocument<DocumentShape>(
      this.collectionId,
      documentId,
      alternativeDatabaseId,
    );

    if (this.validationFn) {
      return this.validationFn(data);
    }
    return data;
  }

  public async documentList(
    queries: string[] = [],
    alternativeDatabaseId?: string,
  ): Promise<Models.DocumentList<DocumentShape>> {
    const list = await this.databases.listDocuments<DocumentShape>(
      this.collectionId,
      queries,
      alternativeDatabaseId,
    );

    const validationFn = this.validationFn;

    if (validationFn) {
      list.documents = list.documents.map((item) => validationFn(item));
    }
    return list;
  }

  public documentList$(
    queries: string[] = [],
    events: string[] = [],
    alternativeDatabaseId?: string,
  ): Observable<Models.DocumentList<DocumentShape>> {
    return this.databases
      .collection$<DocumentShape>(
        this.collectionId,
        queries,
        events,
        alternativeDatabaseId,
      )
      .pipe(
        map((list) => {
          const validationFn = this.validationFn;

          if (validationFn) {
            list.documents = list.documents.map((item) => validationFn(item));
          }
          return list;
        }),
      );
  }

  public document$(
    documentId: string,
    queries: string[] = [],
    alternativeDatabaseId?: string,
  ): Observable<DocumentShape | null> {
    return this.databases
      .document$<DocumentShape>(
        this.collectionId,
        documentId,
        queries,
        alternativeDatabaseId,
      )
      .pipe(
        map((item) => {
          if (item && this.validationFn) {
            return this.validationFn(item);
          }
          return item;
        }),
      );
  }
}
