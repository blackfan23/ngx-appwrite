import { Injectable } from '@angular/core';
import { Messaging, Models } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private _messaging: Messaging = new Messaging(CLIENT());

  /**
   * Create subscriber
   *
   * Create a new subscriber.
   *
   * @param {string} topicId
   * @param {string} subscriberId
   * @param {string} targetId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  createSubscriber(
    topicId: string,
    subscriberId: string,
    targetId: string,
  ): Promise<Models.Subscriber> {
    return this._messaging.createSubscriber(topicId, subscriberId, targetId);
  }
  /**
   * Delete subscriber
   *
   * Delete a subscriber by its unique ID.
   *
   * @param {string} topicId
   * @param {string} subscriberId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  deleteSubscriber(topicId: string, subscriberId: string): Promise<{}> {
    return this._messaging.deleteSubscriber(topicId, subscriberId);
  }
}
