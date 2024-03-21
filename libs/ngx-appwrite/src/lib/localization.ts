import { Injectable } from '@angular/core';
import { Locale, Models } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  private _locale: Locale = new Locale(CLIENT());

  /**
   * Get User Locale
   *
   * Get the current user location based on IP. Returns an object with user
   * country code, country name, continent name, continent code, ip address and
   * suggested currency. You can use the locale header to get the data in a
   * supported language.
   *
   * ([IP Geolocation by DB-IP](https://db-ip.com))
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  get(): Promise<Models.Locale> {
    return this._locale.get();
  }
  /**
   * List Continents
   *
   * List of all continents. You can use the locale header to get the data in a
   * supported language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listContinents(): Promise<Models.ContinentList> {
    return this._locale.listContinents();
  }
  /**
   * List Countries
   *
   * List of all countries. You can use the locale header to get the data in a
   * supported language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listCountries(): Promise<Models.CountryList> {
    return this._locale.listCountries();
  }
  /**
   * List EU Countries
   *
   * List of all countries that are currently members of the EU. You can use the
   * locale header to get the data in a supported language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listCountriesEU(): Promise<Models.CountryList> {
    return this._locale.listCountriesEU();
  }
  /**
   * List Countries Phone Codes
   *
   * List of all countries phone codes. You can use the locale header to get the
   * data in a supported language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listCountriesPhones(): Promise<Models.PhoneList> {
    return this._locale.listCountriesPhones();
  }
  /**
   * List Currencies
   *
   * List of all currencies, including currency symbol, name, plural, and
   * decimal digits for all major and minor currencies. You can use the locale
   * header to get the data in a supported language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listCurrencies(): Promise<Models.CurrencyList> {
    return this._locale.listCurrencies();
  }
  /**
   * List Languages
   *
   * List of all languages classified by ISO 639-1 including 2-letter code, name
   * in English, and name in the respective language.
   *
   * @throws {AppwriteException}
   * @returns {Promise}
   */
  listLanguages(): Promise<Models.LanguageList> {
    return this._locale.listLanguages();
  }
}
