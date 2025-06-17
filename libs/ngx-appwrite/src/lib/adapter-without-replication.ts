import { Injectable, inject } from '@angular/core';
import { ID, Models } from 'appwrite';
import { Observable, map } from 'rxjs';
import { Databases } from './databases';

@Injectable({
  providedIn: 'root',
})
export abstract class AppwriteAdapter<DocumentShape extends Models.Document> {
  private databases = inject(Databases);
  protected abstract collectionId: string;
  protected abstract validationFn:
    | undefined
    | ((data: unknown) => DocumentShape);

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
    const data = await this.databases.createDocument<
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
    if (!awDocument.$id) {
      throw new Error('Document must have an id');
    }

    const data = await this.databases.updateDocument<DocumentShape>(
      this.collectionId,
      awDocument.$id,
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
      [],
      alternativeDatabaseId,
    );

    if (!data) {
      throw new Error(`Document with id ${documentId} not found`);
    }

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

    if (!list) {
      return {
        total: 0,
        documents: [],
      };
    }

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
          if (!list) {
            return {
              total: 0,
              documents: [],
            };
          }
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
