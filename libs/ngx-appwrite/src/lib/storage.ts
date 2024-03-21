import { Injectable } from '@angular/core';
import {
  ID,
  ImageFormat,
  ImageGravity,
  Models,
  Storage,
  UploadProgress,
} from 'appwrite';

import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage = new Storage(CLIENT());

  /* -------------------------------- All Files ------------------------------- */
  /**
   * List Files
   *
   * Get a list of all the user files. You can use the query params to filter
   * your results.
   *
   * @param {string} bucketId
   * @param {string[]} queries
   * @param {string} search
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async listFiles(
    buckedId: string,
    queries?: string[],
    search?: string,
  ): Promise<Models.FileList> {
    return this._storage.listFiles(buckedId, queries, search);
  }
  /* -------------------------------- One File -------------------------------- */
  /**
   * Get File
   *
   * Get a file by its unique ID. This endpoint response returns a JSON object
   * with the file metadata.
   *
   * @param {string} bucketId
   * @param {string} fileId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async getFile(bucketId: string, fileId: string): Promise<Models.File> {
    return this._storage.getFile(bucketId, fileId);
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
   * @param {string} bucketId
   * @param {string} fileId
   * @param {number} width
   * @param {number} height
   * @param {string} gravity
   * @param {number} quality
   * @param {number} borderWidth
   * @param {string} borderColor
   * @param {number} borderRadius
   * @param {number} opacity
   * @param {number} rotation
   * @param {string} background
   * @param {string} output
   * @throws {AppwriteException}
   * @returns {URL}
   */
  async getFilePreview(
    bucketId: string,
    fileId: string,
    width?: number | undefined,
    height?: number | undefined,
    gravity?: ImageGravity | undefined,
    quality?: number | undefined,
    borderWidth?: number | undefined,
    borderColor?: string | undefined,
    borderRadius?: number | undefined,
    opacity?: number | undefined,
    rotation?: number | undefined,
    background?: string | undefined,
    output?: ImageFormat | undefined,
  ): Promise<URL> {
    return this._storage.getFilePreview(
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
    );
  }

  /**
   * Get File for Download
   *
   * Get a file content by its unique ID. The endpoint response return with a
   * 'Content-Disposition: attachment' header that tells the browser to start
   * downloading the file to user downloads directory.
   *
   * @param {string} bucketId
   * @param {string} fileId
   * @throws {AppwriteException}
   * @returns {URL}
   */
  async getFileDownload(bucketId: string, fileId: string): Promise<URL> {
    return this._storage.getFileDownload(bucketId, fileId);
  }

  /**
   * Get File for View
   *
   * Get a file content by its unique ID. This endpoint is similar to the
   * download method but returns with no  'Content-Disposition: attachment'
   * header.
   *
   * @param {string} bucketId
   * @param {string} fileId
   * @throws {AppwriteException}
   * @returns {URL}
   */
  async getFileForView(bucketId: string, fileId: string): Promise<URL> {
    return this._storage.getFileView(bucketId, fileId);
  }

  /* ------------------------------- Create File ------------------------------ */
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
   * @param {string} bucketId
   * @param {string} fileId
   * @param {File} file
   * @param {string[]} permissions
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async createFile(
    bucketId: string,
    file: File,
    fileId: string = ID.unique(),
    permissions?: string[],
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<Models.File> {
    return this._storage.createFile(
      bucketId,
      fileId,
      file,
      permissions,
      onProgress,
    );
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
   * @param {string | undefined} name
   * @param {string[]} permissions
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  async updateFilePermissions(
    bucketId: string,
    fileId: string,
    name?: string,
    permissions?: string[],
  ): Promise<Models.File> {
    return this._storage.updateFile(bucketId, fileId, name, permissions);
  }

  /* ------------------------------- Delete File ------------------------------ */
  /**
   * Delete File
   *
   * Delete a file by its unique ID. Only users with write permissions have
   * access to delete this resource.
   *
   * @param {string} bucketId
   * @param {string} fileId
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  async deleteFile(bucketId: string, fileId: string): Promise<{}> {
    return this._storage.deleteFile(bucketId, fileId);
  }
}
