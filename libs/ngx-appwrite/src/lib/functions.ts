import { Injectable } from '@angular/core';
import { ExecutionMethod, Functions, Models } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class FunctionsService {
  private _functions: Functions = new Functions(CLIENT());

  /**
   * List Executions
   *
   * Get a list of all the current user function execution logs. You can use the
   * query params to filter your results.
   *
   * @param {string} functionId
   * @param {string[]} queries
   * @param {string} search
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listExecutions(
    functionId: string,
    queries?: string[],
    search?: string,
  ): Promise<Models.ExecutionList> {
    return this._functions.listExecutions(functionId, queries, search);
  }
  /**
   * Create Execution
   *
   * Trigger a function execution. The returned object will return you the
   * current execution status. You can ping the `Get Execution` endpoint to get
   * updates on the current execution status. Once this endpoint is called, your
   * function execution process will start asynchronously.
   *
   * @param {string} functionId
   * @param {string} data
   * @param {boolean} async
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createExecution(
    functionId: string,
    data?: string,
    async?: boolean,
    path = '/',
    method?: ExecutionMethod,
    headers?: Record<string, string>,
  ): Promise<Models.Execution> {
    return this._functions.createExecution(
      functionId,
      data,
      async,
      path,
      method,
      headers,
    );
  }
  /**
   * Get Execution
   *
   * Get a function execution log by its unique ID.
   *
   * @param {string} functionId
   * @param {string} executionId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  getExecution(
    functionId: string,
    executionId: string,
  ): Promise<Models.Execution> {
    return this._functions.getExecution(functionId, executionId);
  }
}
