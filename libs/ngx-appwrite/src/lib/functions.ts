import { Injectable, Provider } from '@angular/core';
import {
  AppwriteException,
  Functions as AppwriteFunctions,
  ExecutionMethod,
  Models,
  Query,
} from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Functions {
  private readonly _functions = new AppwriteFunctions(CLIENT());

  /**
   * A function that wraps a promise and handles AppwriteExceptions.
   *
   * @param promise - The promise to wrap.
   * @returns The result of the promise.
   * @throws If the promise rejects with a non-AppwriteException error.
   */
  private async _call<T>(promise: Promise<T>): Promise<T | null> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof AppwriteException) {
        console.warn(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * List Executions
   *
   * Get a list of all the current user function execution logs. You can use the
   * query params to filter your results.
   *
   * @param functionId The function ID.
   * @param queries The queries to filter the results.
   * @param search The search string to filter the results.
   * @returns A list of executions.
   */
  listExecutions(
    functionId: string,
    queries?: string[],
    search?: string,
  ): Promise<Models.ExecutionList | null> {
    const allQueries = search
      ? [Query.search('search', search), ...(queries ?? [])]
      : queries;

    return this._call(this._functions.listExecutions(functionId, allQueries));
  }

  /**
   * Create Execution
   *
   * Trigger a function execution. The returned object will return you the
   * current execution status. You can ping the `Get Execution` endpoint to get
   * updates on the current execution status. Once this endpoint is called, your
   * function execution process will start asynchronously.
   *
   * @param functionId The function ID.
   * @param body The body of the request.
   * @param async Whether to execute the function asynchronously.
   * @param path The path of the request.
   * @param method The method of the request.
   * @param headers The headers of the request.
   * @returns An execution.
   */
  createExecution(
    functionId: string,
    body?: string,
    async?: boolean,
    path?: string,
    method?: ExecutionMethod,
    headers?: Record<string, string>,
  ): Promise<Models.Execution | null> {
    return this._call(
      this._functions.createExecution(
        functionId,
        body,
        async,
        path,
        method,
        headers,
      ),
    );
  }

  /**
   * Get Execution
   *
   * Get a function execution log by its unique ID.
   *
   * @param functionId The function ID.
   * @param executionId The execution ID.
   * @returns An execution.
   */
  getExecution(
    functionId: string,
    executionId: string,
  ): Promise<Models.Execution | null> {
    return this._call(this._functions.getExecution(functionId, executionId));
  }
}

/**
 * An alias for the Functions class.
 */
export const FunctionsService = Functions;

/**
 * A provider for the Functions class.
 */
export const provideFunctions = (): Provider => {
  return {
    provide: Functions,
    useClass: Functions,
  };
};
