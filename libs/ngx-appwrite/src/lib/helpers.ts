import { Client, RealtimeResponseEvent } from 'appwrite';
import { Observable, Subscriber } from 'rxjs';

export const watch = <T>(
  client: Client,
  channel: string | string[],
  events?: string | string[],
): Observable<RealtimeResponseEvent<T>> => {
  const observable = new Observable<RealtimeResponseEvent<T>>(
    (observer: Subscriber<RealtimeResponseEvent<T>>) => {
      try {
        client.subscribe<T>(channel, (response: RealtimeResponseEvent<T>) => {
          if (!events) {
            observer.next(response);
          } else if (
            (typeof events === 'string' && response.events.includes(events)) ||
            intersection(response.events, events)
          ) {
            observer.next(response);
          }
        });
      } catch (error) {
        console.error('Error while watching channel: ', channel);
        if (error instanceof Error) observer.error(error.message);
      }
    },
  );
  return observable;
};

export const wait = (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const deepEqual = <T>(obj1: T, obj2: T) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

function intersection(...args: (string | string[])[]): string[] {
  const arrays: string[][] = args.map((arg) =>
    Array.isArray(arg) ? arg : [arg],
  );

  if (arrays.length === 0) {
    return [];
  }

  const firstArray = arrays[0];
  const uniqueValues = new Set(firstArray);

  for (let i = 1; i < arrays.length; i++) {
    const currentArray = arrays[i];

    for (let j = 0; j < currentArray.length; j++) {
      const value = currentArray[j];
      if (!uniqueValues.has(value)) {
        uniqueValues.delete(value);
      }
    }
  }

  return Array.from(uniqueValues);
}
