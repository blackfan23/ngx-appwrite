import { Injectable } from '@angular/core';
import { createRxDatabase, RxCollection, RxDatabase, RxJsonSchema } from 'rxdb';
import { RxReplicationState } from 'rxdb/plugins/replication';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

@Injectable({
  providedIn: 'root',
})
export class ReplicationManager<DocumentShape> {
  private _databases: RxDatabase<
    Record<string, RxCollection<DocumentShape>>
  >[] = [];
  private _queuePromise: Promise<any> | null = null;

  private async _getOrCreateDatabase(
    rxdbDatabasename: string,
  ): Promise<RxDatabase<Record<string, RxCollection<DocumentShape>>>> {
    let db = this._databases.find((db) => db.name === rxdbDatabasename);

    if (!db) {
      db = await createRxDatabase<Record<string, RxCollection<DocumentShape>>>({
        name: rxdbDatabasename,
        storage: wrappedValidateAjvStorage({
          storage: getRxStorageLocalstorage(),
        }),
        multiInstance: true,
      });
      this._databases.push(db);
    }
    return db;
  }

  public async startReplication(rxdbReplication: {
    rxdbDatabasename: string;
    collectionId: string;
    rxdbSchema: RxJsonSchema<DocumentShape>;
    adapterReplicationFunction: (options: {
      db: RxDatabase<Record<string, RxCollection<DocumentShape>>>;
      rxdbDatabasename: string;
      collectionId: string;
      rxdbSchema: RxJsonSchema<DocumentShape>;
    }) => Promise<{
      replicationState: RxReplicationState<DocumentShape, any>;
      collection: RxCollection<DocumentShape>;
    }>;
  }) {
    const runReplication = async () => {
      const db = await this._getOrCreateDatabase(
        rxdbReplication.rxdbDatabasename,
      );

      await db.addCollections({
        [rxdbReplication.collectionId]: {
          schema: rxdbReplication.rxdbSchema,
        },
      });

      const { replicationState, collection } =
        await rxdbReplication.adapterReplicationFunction({
          db,
          rxdbDatabasename: rxdbReplication.rxdbDatabasename,
          collectionId: rxdbReplication.collectionId,
          rxdbSchema: rxdbReplication.rxdbSchema,
        });

      return { replicationState, db, collection };
    };

    if (this._queuePromise) {
      this._queuePromise = this._queuePromise.then(runReplication);
    } else {
      this._queuePromise = runReplication();
    }

    try {
      const result = await this._queuePromise;
      this._queuePromise = null;
      return result;
    } catch (error) {
      this._queuePromise = null;
      throw error;
    }
  }
}
