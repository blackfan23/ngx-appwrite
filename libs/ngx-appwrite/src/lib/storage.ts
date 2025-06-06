import { Injectable, Provider } from '@angular/core';
import {
  AppwriteException,
  Storage as AppwriteStorage,
  ID,
  ImageFormat,
  ImageGravity,
  Models,
  UploadProgress,
} from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Storage {
  private readonly _storage = new AppwriteStorage(CLIENT());

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
   * List Files
   *
   * Get a list of all the user files. You can use the query params to filter
   * your results.
   *
   * @param buckedId The bucket ID.
   * @param queries The queries to filter the results.
   * @param search The search string to filter the results.
   * @returns A list of files.
   */
  listFiles(
    buckedId: string,
    queries?: string[],
    search?: string,
  ): Promise<Models.FileList | null> {
    return this._call(this._storage.listFiles(buckedId, queries, search));
  }

  /**
   * Get File
   *
   * Get a file by its unique ID. This endpoint response returns a JSON object
   * with the file metadata.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @returns A file.
   */
  getFile(bucketId: string, fileId: string): Promise<Models.File | null> {
    return this._call(this._storage.getFile(bucketId, fileId));
  }

  /**
   * Get File Preview
   *
   * Get a file preview image. Currently, this method supports preview for image
   * files (jpg, png, and gif), other supported formats, like pdf, docs, slides,
   * and spreadsheets, will return the file icon image. You can also pass query
   * string arguments for cutting and resizing your preview image. Preview is
   * supported only for image files smaller than 10MB.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @param width The width of the preview image.
   * @param height The height of the preview image.
   * @param gravity The gravity of the preview image.
   * @param quality The quality of the preview image.
   * @param borderWidth The border width of the preview image.
   * @param borderColor The border color of the preview image.
   * @param borderRadius The border radius of the preview image.
   * @param opacity The opacity of the preview image.
   * @param rotation The rotation of the preview image.
   * @param background The background color of the preview image.
   * @param output The output format of the preview image.
   * @returns A URL to the file preview.
   */
  getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number,
    gravity?: ImageGravity,
    quality?: number,
    borderWidth?: number,
    borderColor?: string,
    borderRadius?: number,
    opacity?: number,
    rotation?: number,
    background?: string,
    output?: ImageFormat,
  ): string | null {
    try {
      return this._storage
        .getFilePreview(
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
          output,
        )
        .toString();
    } catch (e) {
      if (e instanceof AppwriteException) {
        console.warn(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * Get File for Download
   *
   * Get a file content by its unique ID. The endpoint response return with a
   * 'Content-Disposition: attachment' header that tells the browser to start
   * downloading the file to user downloads directory.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @returns A URL to the file.
   */
  getFileDownload(bucketId: string, fileId: string): string | null {
    try {
      return this._storage.getFileDownload(bucketId, fileId).toString();
    } catch (e) {
      if (e instanceof AppwriteException) {
        console.warn(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * Get File for View
   *
   * Get a file content by its unique ID. This endpoint is similar to the
   * download method but returns with no  'Content-Disposition: attachment'
   * header.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @returns A URL to the file.
   */
  getFileForView(bucketId: string, fileId: string): string | null {
    try {
      return this._storage.getFileView(bucketId, fileId).toString();
    } catch (e) {
      if (e instanceof AppwriteException) {
        console.warn(e.message);
        return null;
      }
      throw e;
    }
  }

  /**
   * Create File
   *
   * Create a new file. Before using this route, you should create a new bucket
   * resource using either a [server
   * integration](/docs/server/storage#storageCreateBucket) API or directly from
   * your Appwrite console.
   *
   * Larger files should be uploaded using multiple requests with the
   * [content-range](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Range)
   * header to send a partial request with a maximum supported chunk of `5MB`.
   * The `content-range` header values should always be in bytes.
   *
   * When the first request is sent, the server will return the **File** object,
   * and the subsequent part request must include the file's **id** in
   * `x-appwrite-id` header to allow the server to know that the partial upload
   * is for the existing file and not for a new one.
   *
   * If you're creating a new file using one of the Appwrite SDKs, all the
   * chunking logic will be managed by the SDK internally.
   *
   *
   * @param bucketId The bucket ID.
   * @param file The file to create.
   * @param fileId The file ID.
   * @param permissions The permissions for the file.
   * @param onProgress A callback to track the upload progress.
   * @returns The created file.
   */
  createFile(
    bucketId: string,
    file: File,
    fileId: string = ID.unique(),
    permissions?: string[],
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<Models.File | null> {
    return this._call(
      this._storage.createFile(bucketId, fileId, file, permissions, onProgress),
    );
  }

  /**
   * Update File Permissions
   *
   * Update a file by its unique ID. Only users with write permissions have
   * access to update this resource.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @param name The new name for the file.
   * @param permissions The new permissions for the file.
   * @returns The updated file.
   */
  updateFilePermissions(
    bucketId: string,
    fileId: string,
    name?: string,
    permissions?: string[],
  ): Promise<Models.File | null> {
    return this._call(
      this._storage.updateFile(bucketId, fileId, name, permissions),
    );
  }

  /**
   * Delete File
   *
   * Delete a file by its unique ID. Only users with write permissions have
   * access to delete this resource.
   *
   * @param bucketId The bucket ID.
   * @param fileId The file ID.
   * @returns An empty object.
   */
  deleteFile(
    bucketId: string,
    fileId: string,
  ): Promise<Record<string, never> | null> {
    return this._call(this._storage.deleteFile(bucketId, fileId));
  }
}

/**
 * An alias for the Storage class.
 */
export const StorageService = Storage;

/**
 * A provider for the Storage class.
 */
export const provideStorage = (): Provider => {
  return {
    provide: Storage,
    useClass: Storage,
  };
};
