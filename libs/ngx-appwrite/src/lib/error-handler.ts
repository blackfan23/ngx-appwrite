import { Injectable, InjectionToken, Provider } from '@angular/core';
import { AppwriteException } from 'appwrite';

/**
 * Configuration options for the AppwriteErrorHandler.
 */
export interface AppwriteErrorHandlerConfig {
  /**
   * Whether to log errors to console. Default: true
   */
  logErrors?: boolean;

  /**
   * Whether to rethrow non-Appwrite errors. Default: true
   */
  rethrowUnknownErrors?: boolean;

  /**
   * Custom error handler callback for Appwrite exceptions.
   */
  onAppwriteError?: (error: AppwriteException) => void;

  /**
   * Custom error handler callback for unknown errors.
   */
  onUnknownError?: (error: unknown) => void;
}

/**
 * Injection token for AppwriteErrorHandler configuration.
 */
export const APPWRITE_ERROR_HANDLER_CONFIG =
  new InjectionToken<AppwriteErrorHandlerConfig>(
    'APPWRITE_ERROR_HANDLER_CONFIG',
  );

/**
 * Centralized error handling service for Appwrite operations.
 *
 * This service provides consistent error handling across all Appwrite services.
 * It can be configured to log errors, rethrow unknown errors, and call custom
 * error handlers.
 *
 * @example
 * ```typescript
 * // In a service
 * private errorHandler = inject(AppwriteErrorHandler);
 *
 * async fetchData(): Promise<Data | null> {
 *   try {
 *     return await this.databases.listDocuments(...);
 *   } catch (error) {
 *     return this.errorHandler.handle(error, null);
 *   }
 * }
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AppwriteErrorHandler {
  private config: AppwriteErrorHandlerConfig = {
    logErrors: true,
    rethrowUnknownErrors: true,
  };

  /**
   * Configure the error handler.
   */
  configure(config: AppwriteErrorHandlerConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Handle an error from an Appwrite operation.
   *
   * @param error - The error to handle
   * @param fallbackValue - The value to return if the error is handled
   * @returns The fallback value if the error is an AppwriteException, otherwise throws
   */
  handle<T>(error: unknown, fallbackValue: T): T {
    if (error instanceof AppwriteException) {
      return this.handleAppwriteError(error, fallbackValue);
    }
    return this.handleUnknownError(error, fallbackValue);
  }

  /**
   * Handle an AppwriteException.
   */
  private handleAppwriteError<T>(error: AppwriteException, fallbackValue: T): T {
    if (this.config.logErrors) {
      console.warn(`[ngx-appwrite] AppwriteException: ${error.message}`, {
        code: error.code,
        type: error.type,
      });
    }

    if (this.config.onAppwriteError) {
      this.config.onAppwriteError(error);
    }

    return fallbackValue;
  }

  /**
   * Handle an unknown error.
   */
  private handleUnknownError<T>(error: unknown, fallbackValue: T): T {
    if (this.config.logErrors) {
      console.error('[ngx-appwrite] Unknown error:', error);
    }

    if (this.config.onUnknownError) {
      this.config.onUnknownError(error);
    }

    if (this.config.rethrowUnknownErrors) {
      throw error;
    }

    return fallbackValue;
  }

  /**
   * Wrap a promise with error handling.
   *
   * @param promise - The promise to wrap
   * @param fallbackValue - The value to return if an error occurs
   * @returns The promise result or fallback value
   */
  async wrap<T>(promise: Promise<T>, fallbackValue: T): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      return this.handle(error, fallbackValue);
    }
  }
}

/**
 * Provider for configuring the AppwriteErrorHandler.
 *
 * @example
 * ```typescript
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideAppwrite({ ... }),
 *     provideAppwriteErrorHandler({
 *       logErrors: true,
 *       rethrowUnknownErrors: false,
 *       onAppwriteError: (error) => console.log('Appwrite error:', error),
 *     }),
 *   ],
 * };
 * ```
 */
export const provideAppwriteErrorHandler = (
  config: AppwriteErrorHandlerConfig,
): Provider => {
  return {
    provide: APPWRITE_ERROR_HANDLER_CONFIG,
    useValue: config,
  };
};
