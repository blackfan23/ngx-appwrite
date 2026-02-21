import { inject, Injectable, Provider } from '@angular/core';
import { TablesDB as AppwriteTablesDB, ID, Models, Query } from 'appwrite';
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
export class TablesDB {
  private readonly _client = inject(APPWRITE_CLIENT);
  private readonly _defaultDatabaseId = inject(APPWRITE_DEFAULT_DATABASE);
  private readonly _databases = new AppwriteTablesDB(this._client);
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
   * Get a list of all the user's rows in a given table. You can use the query params to filter your results.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.tableId - Table ID. You can create a new table using the TablesDB service [server integration](https://appwrite.io/docs/products/databases/tables#create-table).
   * @param {string[]} params.queries - Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appwrite.io/docs/queries). Maximum of 100 queries are allowed, each 4096 characters long.
   * @param {string} params.transactionId - Transaction ID to read uncommitted changes within the transaction.
   * @param {boolean} params.total - When set to false, the total count returned will be 0 and will not be calculated.
   * @throws {AppwriteException}
   * @returns {Promise<Models.RowList<Row>>}
   */
  async listRows<DocumentShape extends Models.Row>({
    tableId,
    queries,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Models.RowList<DocumentShape>> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    const data = await this._errorHandler.wrap(
      this._databases.listRows<DocumentShape>({
        tableId,
        queries,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      { total: 0, rows: [] } as unknown as Models.RowList<DocumentShape>,
    );

    return data;
  }

  /**
   * Create a new Row. Before using this route, you should create a new table resource using either a [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable) API or directly from your database console.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.tableId - Table ID. You can create a new table using the Database service [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable). Make sure to define columns before creating rows.
   * @param {string} params.rowId - Row ID. Choose a custom ID or generate a random ID with `ID.unique()`. Valid chars are a-z, A-Z, 0-9, period, hyphen, and underscore. Can't start with a special char. Max length is 36 chars.
   * @param {Row extends Models.DefaultRow ? Partial<Models.Row> & Record<string, any> : Partial<Models.Row> & Omit<Row, keyof Models.Row>} params.data - Row data as JSON object.
   * @param {string[]} params.permissions - An array of permissions strings. By default, only the current user is granted all permissions. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  createRow<DocumentShape extends Models.Row>({
    tableId,
    rowId = ID.unique(),
    data,
    permissions,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId?: string;
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, unknown>
      : Partial<Models.Row> & Omit<DocumentShape, keyof Models.Row>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.createRow<DocumentShape>({
        tableId,
        rowId,
        data,
        databaseId: alternateDatabaseId,
        permissions,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Get a row by its unique ID. This endpoint response returns a JSON object with the row data.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.tableId - Table ID. You can create a new table using the Database service [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable).
   * @param {string} params.rowId - Row ID.
   * @param {string[]} params.queries - Array of query strings generated using the Query class provided by the SDK. [Learn more about queries](https://appwrite.io/docs/queries). Maximum of 100 queries are allowed, each 4096 characters long.
   * @param {string} params.transactionId - Transaction ID to read uncommitted changes within the transaction.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  getRow<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    queries,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    queries?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.getRow<DocumentShape>({
        tableId,
        rowId,
        queries,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Create or update a Row. Before using this route, you should create a new table resource using either a [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable) API or directly from your database console.
   *
   * @param {string} params.tableId - Table ID.
   * @param {string} params.rowId - Row ID.
   * @param {Row extends Models.DefaultRow ? Partial<Models.Row> & Record<string, any> : Partial<Models.Row> & Partial<Omit<Row, keyof Models.Row>>} params.data - Row data as JSON object. Include all required columns of the row to be created or updated.
   * @param {string[]} params.permissions - An array of permissions strings. By default, the current permissions are inherited. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.alternateDatabaseId - Database ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  upsertRow<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    data,
    permissions,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Partial<Omit<DocumentShape, keyof Models.Row>>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.upsertRow<DocumentShape>({
        tableId,
        rowId,
        data,
        permissions,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Update a row by its unique ID. Using the patch method you can pass only specific fields that will get updated.
   *
   * @param {string} params.tableId - Table ID.
   * @param {string} params.rowId - Row ID.
   * @param {Row extends Models.DefaultRow ? Partial<Models.Row> & Record<string, any> : Partial<Models.Row> & Partial<Omit<Row, keyof Models.Row>>} params.data - Row data as JSON object. Include only columns and value pairs to be updated.
   * @param {string[]} params.permissions - An array of permissions strings. By default, the current permissions are inherited. [Learn more about permissions](https://appwrite.io/docs/permissions).
   * @param {string} params.alternateDatabaseId - Database ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  updateRow<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    data,
    permissions,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    data: DocumentShape extends Models.DefaultRow
      ? Partial<Models.Row> & Record<string, any>
      : Partial<Models.Row> & Partial<Omit<DocumentShape, keyof Models.Row>>;
    permissions?: string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.updateRow<DocumentShape>({
        tableId,
        rowId,
        data,
        permissions,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Delete a row by its unique ID.
   *
   * @param {string} params.tableId - Table ID. You can create a new table using the Database service [server integration](https://appwrite.io/docs/references/cloud/server-dart/tablesDB#createTable).
   * @param {string} params.rowId - Row ID.
   * @param {string} params.alternateDatabaseId - Database ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<{}>}
   */
  deleteRow({
    tableId,
    rowId,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<Record<string, unknown>> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.deleteRow({
        tableId,
        rowId,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {},
    );
  }

  /**
   * Decrement a specific column of a row by a given value.
   *
   * @param {string} params.tableId - Table ID.
   * @param {string} params.rowId - Row ID.
   * @param {string} params.column - Column key.
   * @param {number} params.value - Value to increment the column by. The value must be a number.
   * @param {number} params.min - Minimum value for the column. If the current value is lesser than this value, an exception will be thrown.
   * @param {string} params.alternateDatabaseId - Database ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  decrementRowColumn<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    column,
    value,
    min,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    column: string;
    value: number;
    min?: number;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.decrementRowColumn<DocumentShape>({
        tableId,
        rowId,
        column,
        value,
        min,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * Increment a specific column of a row by a given value.
   *
   * @param {string} params.databaseId - Database ID.
   * @param {string} params.tableId - Table ID.
   * @param {string} params.rowId - Row ID.
   * @param {string} params.column - Column key.
   * @param {number} params.value - Value to increment the column by. The value must be a number.
   * @param {number} params.max - Maximum value for the column. If the current value is greater than this value, an error will be thrown.
   * @param {string} params.alternateDatabaseId - Database ID.
   * @param {string} params.transactionId - Transaction ID for staging the operation.
   * @throws {AppwriteException}
   * @returns {Promise<Row>}
   */
  incrementRowColumn<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    column,
    value,
    max,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    column: string;
    value: number;
    max?: number;
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Promise<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    return this._errorHandler.wrap(
      this._databases.incrementRowColumn<DocumentShape>({
        tableId,
        rowId,
        column,
        value,
        max,
        databaseId: alternateDatabaseId,
        transactionId,
      }),
      {} as DocumentShape,
    );
  }

  /**
   * This method returns an observable that will emit the table list
   * and then listen for changes to the table.
   *
   * @param params.tableId The table to watch
   * @param params.queries The queries to apply to the table
   * @param params.events The events to listen for
   * @param params.alternateDatabaseId The database to use
   * @returns An observable of the collection
   */
  listRows$<DocumentShape extends Models.Row>({
    tableId,
    queries,
    events,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    queries?: (string | Query)[];
    events?: string | string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Observable<Models.RowList<DocumentShape>> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${alternateDatabaseId}.tables.${tableId}.rows`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.listRows<DocumentShape>({
          tableId,
          queries: queries as string[],
          alternateDatabaseId,
          transactionId,
        }),
      ),
      distinctUntilChanged(deepEqual),
    );
  }

  /**
   * This method returns an observable that will emit the row
   * and then listen for changes to the row.
   *
   * @param params.tableId The table to watch
   * @param params.rowId The row to watch
   * @param params.queries The queries to apply to the row
   * @param params.events The events to listen for
   * @param params.alternateDatabaseId The database to use
   * @returns An observable of the document
   */
  row$<DocumentShape extends Models.Row>({
    tableId,
    rowId,
    queries,
    events,
    alternateDatabaseId = this._defaultDatabaseId,
    transactionId,
  }: {
    tableId: string;
    rowId: string;
    queries?: (string | Query)[];
    events?: string | string[];
    alternateDatabaseId?: string;
    transactionId?: string;
  }): Observable<DocumentShape> {
    if (!alternateDatabaseId) {
      throw new Error('Database ID is not set.');
    }

    const path = `databases.${alternateDatabaseId}.tables.${tableId}.rows.${rowId}`;

    return this._client$.pipe(
      switchMap((client) => watch(client, events ?? path)),
      startWith(null), // Emit on subscription
      switchMap(() =>
        this.getRow<DocumentShape>({
          tableId,
          rowId,
          queries: queries as string[],
          alternateDatabaseId,
          transactionId,
        }),
      ),
      distinctUntilChanged(deepEqual),
    );
  }
}

/**
 * An alias for the Databases class.
 */
export const TablesDBService = TablesDB;

/**
 * A provider for the Databases class.
 */
export const provideTablesDB = (): Provider => {
  return {
    provide: TablesDB,
    useClass: TablesDB,
  };
};
