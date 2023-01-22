import { Injectable } from '@angular/core';
import { ID, Models, Storage, UploadProgress } from 'appwrite';
import { map, shareReplay } from 'rxjs';
import { AccountService } from './account.service';
import { AppwriteConfig } from './appwrite.config';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | undefined;
  config: AppwriteConfig | undefined;

  storage$ = this.clientService.client$.pipe(
    map((client) => {
      if (!this._storage) {
        this._storage = new Storage(client);
      }
      return this._storage;
    }),
    shareReplay(1)
  );

  constructor(private clientService: ClientService, private accountService: AccountService) {
    this.config = this.clientService.config;
  }
  /* -------------------------------- All Files ------------------------------- */
  async listFiles(
    buckedId: string,
    queries?: string[],
    search?: string
  ): Promise<Models.FileList | undefined> {
    try {
      return this._storage?.listFiles(buckedId, queries, search);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }
  /* -------------------------------- One File -------------------------------- */
  async getFile(bucketId: string, fileId: string): Promise<Models.File | undefined> {
    try {
      return this._storage?.getFile(bucketId, fileId);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  async downloadFile(bucketId: string, fileId: string): Promise<URL | undefined> {
    try {
      return this._storage?.getFileDownload(bucketId, fileId);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  async getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number | undefined,
    height?: number | undefined,
    gravity?: string | undefined,
    quality?: number | undefined,
    borderWidth?: number | undefined,
    borderColor?: string | undefined,
    borderRadius?: number | undefined,
    opacity?: number | undefined,
    rotation?: number | undefined,
    background?: string | undefined,
    output?: string | undefined
  ): Promise<URL | undefined> {
    try {
      return this._storage?.getFilePreview(
        bucketId,
        fileId,
        width,
        height,
        gravity,
        quality,
        borderWidth,
        borderColor,
        borderRadius,
        opacity,
        rotation,
        background,
        output
      );
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  async getFileForView(bucketId: string, fileId: string): Promise<URL | undefined> {
    try {
      return this._storage?.getFileView(bucketId, fileId);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  /* ------------------------------- Create File ------------------------------ */
  async saveFile(
    bucketId: string,
    file: File,
    fileId: string = ID.unique(),
    permissions?: string[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Models.File | undefined> {
    try {
      return this._storage?.createFile(bucketId, fileId, file, permissions, onProgress);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  /* ------------------------------- UpdatePermissions ------------------------------ */
  /**
   * Update File
   *
   * Update a file by its unique ID. Only users with write permissions have
   * access to update this resource.
   *
   * @param {string} bucketId
   * @param {string} fileId
   * @param {string[]} permissions
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateFilePermissions(
    bucketId: string,
    fileId: string,
    permissions?: string[]
  ): Promise<Models.File | undefined> {
    try {
      return this._storage?.updateFile(bucketId, fileId, permissions);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }

  /* ------------------------------- Delete File ------------------------------ */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async deleteFile(buckedId: string, fileId: string): Promise<{} | undefined> {
    try {
      return this._storage?.deleteFile(buckedId, fileId);
    } catch (error) {
      if (error instanceof Error) console.error(error);
      return undefined;
    }
  }
}
