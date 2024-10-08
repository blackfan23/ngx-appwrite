import { Injectable } from '@angular/core';
import { Avatars, Browser, CreditCard, Flag } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class AvatarsService {
  private _avatars: Avatars = new Avatars(CLIENT());

  /**
   * Get Browser Icon
   *
   * You can use this endpoint to show different browser icons to your users.
   * The code argument receives the browser code as it appears in your user [GET
   * /account/sessions](/docs/client/account#accountGetSessions) endpoint. Use
   * width, height and quality arguments to change the output settings.
   *
   * When one dimension is specified and the other is 0, the image is scaled
   * with preserved aspect ratio. If both dimensions are 0, the API provides an
   * image at source quality. If dimensions are not specified, the default size
   * of image returned is 100x100px.
   *
   * @param {string} code
   * @param {number} width
   * @param {number} height
   * @param {number} quality
   * @throws {AppwriteException}
   * @returns {string}
   */
  getBrowser(
    code: Browser,
    width?: number,
    height?: number,
    quality?: number,
  ): string {
    return this._avatars.getBrowser(code, width, height, quality);
  }
  /**
   * Get Credit Card Icon
   *
   * The credit card endpoint will return you the icon of the credit card
   * provider you need. Use width, height and quality arguments to change the
   * output settings.
   *
   * When one dimension is specified and the other is 0, the image is scaled
   * with preserved aspect ratio. If both dimensions are 0, the API provides an
   * image at source quality. If dimensions are not specified, the default size
   * of image returned is 100x100px.
   *
   *
   * @param {string} code
   * @param {number} width
   * @param {number} height
   * @param {number} quality
   * @throws {AppwriteException}
   * @returns {string}
   */
  getCreditCard(
    code: CreditCard,
    width?: number,
    height?: number,
    quality?: number,
  ): string {
    return this._avatars.getCreditCard(code, width, height, quality);
  }
  /**
   * Get Favicon
   *
   * Use this endpoint to fetch the favorite icon (AKA favicon) of any remote
   * website URL.
   *
   *
   * @param {string} url
   * @throws {AppwriteException}
   * @returns {string}
   */
  getFavicon(url: string): string {
    return this._avatars.getFavicon(url);
  }
  /**
   * Get Country Flag
   *
   * You can use this endpoint to show different country flags icons to your
   * users. The code argument receives the 2 letter country code. Use width,
   * height and quality arguments to change the output settings. Country codes
   * follow the [ISO 3166-1](http://en.wikipedia.org/wiki/ISO_3166-1) standard.
   *
   * When one dimension is specified and the other is 0, the image is scaled
   * with preserved aspect ratio. If both dimensions are 0, the API provides an
   * image at source quality. If dimensions are not specified, the default size
   * of image returned is 100x100px.
   *
   *
   * @param {string} code
   * @param {number} width
   * @param {number} height
   * @param {number} quality
   * @throws {AppwriteException}
   * @returns {string}
   */
  getFlag(
    code: Flag,
    width?: number,
    height?: number,
    quality?: number,
  ): string {
    return this._avatars.getFlag(code, width, height, quality);
  }
  /**
   * Get Image from URL
   *
   * Use this endpoint to fetch a remote image URL and crop it to any image size
   * you want. This endpoint is very useful if you need to crop and display
   * remote images in your app or in case you want to make sure a 3rd party
   * image is properly served using a TLS protocol.
   *
   * When one dimension is specified and the other is 0, the image is scaled
   * with preserved aspect ratio. If both dimensions are 0, the API provides an
   * image at source quality. If dimensions are not specified, the default size
   * of image returned is 400x400px.
   *
   *
   * @param {string} url
   * @param {number} width
   * @param {number} height
   * @throws {AppwriteException}
   * @returns {string}
   */
  getImage(url: string, width?: number, height?: number): string {
    return this._avatars.getImage(url, width, height);
  }
  /**
   * Get User Initials
   *
   * Use this endpoint to show your user initials avatar icon on your website or
   * app. By default, this route will try to print your logged-in user name or
   * email initials. You can also overwrite the user name if you pass the 'name'
   * parameter. If no name is given and no user is logged, an empty avatar will
   * be returned.
   *
   * You can use the color and background params to change the avatar colors. By
   * default, a random theme will be selected. The random theme will persist for
   * the user's initials when reloading the same theme will always return for
   * the same initials.
   *
   * When one dimension is specified and the other is 0, the image is scaled
   * with preserved aspect ratio. If both dimensions are 0, the API provides an
   * image at source quality. If dimensions are not specified, the default size
   * of image returned is 100x100px.
   *
   *
   * @param {string} name
   * @param {number} width
   * @param {number} height
   * @param {string} background
   * @throws {AppwriteException}
   * @returns {string}
   */
  getInitials(
    name?: string,
    width?: number,
    height?: number,
    background?: string,
  ): string {
    return this._avatars.getInitials(name, width, height, background);
  }
  /**
   * Get QR Code
   *
   * Converts a given plain text to a QR code image. You can use the query
   * parameters to change the size and style of the resulting image.
   *
   *
   * @param {string} text
   * @param {number} size
   * @param {number} margin
   * @param {boolean} download
   * @throws {AppwriteException}
   * @returns {string}
   */
  getQR(
    text: string,
    size?: number,
    margin?: number,
    download?: boolean,
  ): string {
    return this._avatars.getQR(text, size, margin, download);
  }
}
