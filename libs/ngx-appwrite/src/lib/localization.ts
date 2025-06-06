import { Injectable, Provider } from '@angular/core';
import { AppwriteException, Locale as AppwriteLocale, Models } from 'appwrite';
import { CLIENT } from './setup';

@Injectable({
  providedIn: 'root',
})
export class Localization {
  private readonly _locale = new AppwriteLocale(CLIENT());

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
   * Get User Locale
   *
   * Get the current user location based on IP. Returns an object with user
   * country code, country name, continent name, continent code, ip address and
   * suggested currency. You can use the locale header to get the data in a
   * supported language.
   *
   * ([IP Geolocation by DB-IP](https://db-ip.com))
   *
   * @returns The user's locale.
   */
  get(): Promise<Models.Locale | null> {
    return this._call(this._locale.get());
  }

  /**
   * List Continents
   *
   * List of all continents. You can use the locale header to get the data in a
   * supported language.
   *
   * @returns A list of continents.
   */
  listContinents(): Promise<Models.ContinentList | null> {
    return this._call(this._locale.listContinents());
  }

  /**
   * List Countries
   *
   * List of all countries. You can use the locale header to get the data in a
   * supported language.
   *
   * @returns A list of countries.
   */
  listCountries(): Promise<Models.CountryList | null> {
    return this._call(this._locale.listCountries());
  }

  /**
   * List EU Countries
   *
   * List of all countries that are currently members of the EU. You can use the
   * locale header to get the data in a supported language.
   *
   * @returns A list of EU countries.
   */
  listCountriesEU(): Promise<Models.CountryList | null> {
    return this._call(this._locale.listCountriesEU());
  }

  /**
   * List Countries Phone Codes
   *
   * List of all countries phone codes. You can use the locale header to get the
   * data in a supported language.
   *
   * @returns A list of phone codes.
   */
  listCountriesPhones(): Promise<Models.PhoneList | null> {
    return this._call(this._locale.listCountriesPhones());
  }

  /**
   * List Currencies
   *
   * List of all currencies, including currency symbol, name, plural, and
   * decimal digits for all major and minor currencies. You can use the locale
   * header to get the data in a supported language.
   *
   * @returns A list of currencies.
   */
  listCurrencies(): Promise<Models.CurrencyList | null> {
    return this._call(this._locale.listCurrencies());
  }

  /**
   * List Languages
   *
   * List of all languages classified by ISO 639-1 including 2-letter code, name
   * in English, and name in the respective language.
   *
   * @returns A list of languages.
   */
  listLanguages(): Promise<Models.LanguageList | null> {
    return this._call(this._locale.listLanguages());
  }
}

/**
 * An alias for the Localization class.
 */
export const LocalizationService = Localization;

/**
 * A provider for the Localization class.
 */
export const provideLocalization = (): Provider => {
  return {
    provide: Localization,
    useClass: Localization,
  };
};
