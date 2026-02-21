import { Client, RealtimeResponseEvent } from 'appwrite';
import { Observable } from 'rxjs';

export const watch = <T>(
  client: Client,
  channel: string | string[],
  events?: string | string[],
): Observable<RealtimeResponseEvent<T>> => {
  return new Observable<RealtimeResponseEvent<T>>((observer) => {
    const handleResponse = (response: RealtimeResponseEvent<T>): void => {
      if (!events) {
        observer.next(response);
        return;
      }

      const eventList = Array.isArray(events) ? events : [events];
      const hasMatchingEvent = eventList.some((event) =>
        response.events.includes(event),
      );

      if (hasMatchingEvent) {
        observer.next(response);
      }
    };

    try {
      const unsubscribe = client.subscribe<T>(channel, handleResponse);

      // Cleanup function
      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error while unsubscribing:', error);
        }
      };
    } catch (error) {
      console.error('Error while watching channel:', channel, error);
      observer.error(error);
      return undefined;
    }
  });
};

export const wait = (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const deepEqual = <T>(obj1: T, obj2: T): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

