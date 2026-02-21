import {
  Injectable,
  ResourceRef,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ID, Models } from 'appwrite';
import { Observable, map } from 'rxjs';
import { TablesDBService } from './tablesdb';

// ! Do not remove this line, needed for build process
const rxResourceWrapper = <ParamsType, ReturnType>(
  $params: Signal<ParamsType>,
  stream: (resource: { params: ParamsType }) => Observable<ReturnType>,
  defaultValue: NoInfer<ReturnType> | (undefined & NoInfer<ReturnType>),
): {
  isLoading: Signal<boolean>;
  error: Signal<unknown>;
  data: Signal<ReturnType>;
  resource: ResourceRef<ReturnType>;
} => {
  const resourceRef = rxResource({
    params: () => $params(),
    stream: (resource) => stream(resource),
    defaultValue,
  });

  return {
    isLoading: computed(() => resourceRef.isLoading()),
    error: computed(() => resourceRef.error()),
    data: computed(() => resourceRef.value()),
    resource: resourceRef,
  };
};

@Injectable({
  providedIn: 'root',
})
export abstract class AppwriteAdapter<DocumentShape extends Models.Row> {
  private tables = inject(TablesDBService);
  protected abstract tablesId: string;
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
   * @param {DocumentShape} params.data
   * @param {string[]} [params.permissions]
   * @param {string} [params.rowId]
   * @param {string} [params.alternateDatabaseId]
   * @param {string} [params.transactionId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async createRow(params: {
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Omit<DocumentShape, keyof Models.Row>;
    rowId?: string;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    // remove all appwrite keys with an empty string
    const data = Object.fromEntries(
      Object.entries(params.data).filter(([key]) => !key.startsWith('$')),
    ) as DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Omit<DocumentShape, keyof Models.Row>;

    const result = await this.tables.createRow<DocumentShape>({
      tableId: this.tablesId,
      rowId: params.rowId ?? ID.unique(),
      data,
      permissions: params.permissions,
      alternateDatabaseId: params.alternateDatabaseId,
      transactionId: params.transactionId,
    });

    if (this.validationFn) {
      return this.validationFn(result);
    }
    return result;
  }

  /**
   * Update Row
   *
   * Updates a Row. Before using this route, you should create a new
   * collection resource using either a [server
   * integration](/docs/server/databases#databasesCreateCollection) API or
   * directly from your database console.
   * @param {Row extends Models.DefaultRow ? Partial<Models.Row> & Record<string, any> : Partial<Models.Row> & Partial<Omit<Row, keyof Models.Row>>} params.data - Row data as JSON object. Include only columns and value pairs to be updated.
   * @param {string} params.rowId - Row ID.
   * @param {string[]} [params.permissions]
   * @param {string} [params.alternateDatabaseId]
   * @param {string} [params.transactionId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async updateRow(params: {
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Partial<Omit<DocumentShape, keyof Models.Row>>;
    rowId: string;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    const result = await this.tables.updateRow<DocumentShape>({
      tableId: this.tablesId,
      rowId: params.rowId,
      data: params.data,
      permissions: params.permissions,
      alternateDatabaseId: params.alternateDatabaseId,
      transactionId: params.transactionId,
    });

    if (this.validationFn) {
      return this.validationFn(result);
    }
    return result;
  }

  /**
   * Upsert Row
   *
   * Create or update a Row. Before using this route, you should create a new table resource using either a [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable) API or directly from your database console.
   * @param {Row extends Models.DefaultRow ? Partial<Models.Row> & Record<string, any> : Partial<Models.Row> & Partial<Omit<Row, keyof Models.Row>>} params.data - Row data as JSON object. Include only columns and value pairs to be updated.
   * @param {string} params.rowId - Row ID.
   * @param {string[]} [params.permissions]
   * @param {string} [params.alternateDatabaseId]
   * @param {string} [params.transactionId]
   * @throws {AppwriteException}
   * @returns {Promise<DocumentShape>}
   */
  public async upsertRow(params: {
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Partial<Omit<DocumentShape, keyof Models.Row>>;
    rowId: string;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }) {
    const result = await this.tables.upsertRow<DocumentShape>({
      tableId: this.tablesId,
      rowId: params.rowId,
      data: params.data,
      permissions: params.permissions,
      alternateDatabaseId: params.alternateDatabaseId,
      transactionId: params.transactionId,
    });

    if (this.validationFn) {
      return this.validationFn(result);
    }
    return result;
  }

  /**
   * Delete Row
   *
   * Deletes a Row.
   * Takes either a document id or a document object with an id
   * @param {string} params.rowId - Row ID.
   * @param {string} [params.alternateDatabaseId] - Alternate database ID.
   * @throws {AppwriteException}
   * @returns {Promise<T & Models.Row>}
   */
  public async deleteRow(params: {
    rowId: string;
    alternateDatabaseId?: string;
  }) {
    if (!params.rowId) {
      throw new Error('Row must have an id to be deleted');
    }
    return this.tables.deleteRow({
      tableId: this.tablesId,
      rowId: params.rowId,
      alternateDatabaseId: params.alternateDatabaseId,
    });
  }

  public async getRow({
    rowId,
    queries,
    alternateDatabaseId,
    transactionId,
  }: {
    rowId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    const data = await this.tables.getRow<DocumentShape>({
      tableId: this.tablesId,
      rowId,
      queries,
      alternateDatabaseId,
      transactionId,
    });

    if (!data) {
      throw new Error(`Row with id ${rowId} not found`);
    }

    if (this.validationFn) {
      return this.validationFn(data);
    }
    return data;
  }

  public async listRows({
    queries,
    alternateDatabaseId,
    transactionId,
  }: {
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Models.RowList<DocumentShape>> {
    const list = await this.tables.listRows<DocumentShape>({
      tableId: this.tablesId,
      queries,
      alternateDatabaseId,
      transactionId,
    });

    if (!list) {
      return {
        total: 0,
        rows: [],
      };
    }

    const validationFn = this.validationFn;

    if (validationFn) {
      list.rows = list.rows.map((item) => validationFn(item));
    }
    return list;
  }

  // RXJS
  public listRows$({
    queries,
    events,
    alternateDatabaseId,
    transactionId,
  }: {
    queries?: string[];
    events?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Observable<Models.RowList<DocumentShape>> {
    return this.tables
      .listRows$<DocumentShape>({
        tableId: this.tablesId,
        queries,
        events,
        alternateDatabaseId,
        transactionId,
      })
      .pipe(
        map((list) => {
          if (!list) {
            return {
              total: 0,
              rows: [],
            };
          }

          const validationFn = this.validationFn;

          if (validationFn) {
            list.rows = list.rows.map((item) => validationFn(item));
          }
          return list;
        }),
      );
  }

  public row$({
    rowId,
    queries,
    alternateDatabaseId,
    transactionId,
  }: {
    rowId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Observable<DocumentShape | null> {
    return this.tables
      .row$<DocumentShape>({
        tableId: this.tablesId,
        rowId,
        queries,
        alternateDatabaseId,
        transactionId,
      })
      .pipe(
        map((item) => {
          if (item && this.validationFn) {
            return this.validationFn(item);
          }
          return item;
        }),
      );
  }
  // Signals
  public $listRows(
    params: Signal<{
      queries?: string[];
      events?: string[];
      alternateDatabaseId?: string;
      transactionId?: string;
    }>,
  ): {
    isLoading: Signal<boolean>;
    error: Signal<unknown>;
    data: Signal<Models.RowList<DocumentShape>>;
    resource: ResourceRef<Models.RowList<DocumentShape>>;
  } {
    return rxResourceWrapper(
      params,
      (params) => this.listRows$(params.params),
      {
        total: 0,
        rows: [],
      } as Models.RowList<DocumentShape>,
    );
  }

  public $row(
    params: Signal<{
      rowId: string;
      queries?: string[];
      alternateDatabaseId?: string;
      transactionId?: string;
    }>,
  ): {
    isLoading: Signal<boolean>;
    error: Signal<unknown>;
    data: Signal<DocumentShape | null>;
    resource: ResourceRef<DocumentShape | null>;
  } {
    return rxResourceWrapper(
      params,
      (params) => this.row$(params.params),
      null,
    );
  }
}
