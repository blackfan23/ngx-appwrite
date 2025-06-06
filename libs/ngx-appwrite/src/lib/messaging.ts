import { Injectable, Provider } from '@angular/core';
import {
  AppwriteException,
  Messaging as AppwriteMessaging,
  Models,
} from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Messaging {
  private readonly _messaging = new AppwriteMessaging(CLIENT());

  /**
   * A function that wraps a promise and handles AppwriteExceptions.
   *
   * @param promise - The promise to wrap.
   * @returns The result of the promise.
   * @throws If the promise rejects with a non-AppwriteException error.
   *
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
   * Create subscriber
   *
   * Create a new subscriber.
   *
   * @param topicId The topic ID.
   * @param subscriberId The subscriber ID.
   * @param targetId The target ID.
   * @returns The created subscriber.
   */
  createSubscriber(
    topicId: string,
    subscriberId: string,
    targetId: string,
  ): Promise<Models.Subscriber | null> {
    return this._call(
      this._messaging.createSubscriber(topicId, subscriberId, targetId),
    );
  }

  /**
   * Delete subscriber
   *
   * Delete a subscriber by its unique ID.
   *
   * @param topicId The topic ID.
   * @param subscriberId The subscriber ID.
   * @returns An empty object.
   */
  deleteSubscriber(
    topicId: string,
    subscriberId: string,
  ): Promise<Record<string, never> | null> {
    return this._call(this._messaging.deleteSubscriber(topicId, subscriberId));
  }
}

/**
 * An alias for the Messaging class.
 */
export const MessagingService = Messaging;

/**
 * A provider for the Messaging class.
 */
export const provideMessaging = (): Provider => {
  return {
    provide: Messaging,
    useClass: Messaging,
  };
};
