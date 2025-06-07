# Changelog

All notable changes to this project will be documented in this file.

## [1.7.4] - 2025-06-07

- Implemented RXDB local replication (also known as offline persistence) using the secondary entrypoint ngx-appwrite/replication (see the README).
- Updated the Appwrite Web SDK to version 18.1.1, which works with server version 1.7.4.
- Remove the search parameter from the listExecutions method.
- Added a token parameter to the getFilePreview and getFileView methods for file token usage.
- Updated dependencies.

## [1.7.0] - 2025-02-04

- **BREAKING**: AppwriteAdapter class now takes a generic type. This simplifies the use of all methods inside, which don't need to be passed a generic type anymore. (See README.md for instructions)
- Improved typing in general

- Updated dependencies, works with appwrite server 1.6.X
- Updated to appwrite Web-SDK version 17.0.0 ([Changes in appwrite sdk-for-web](https://github.com/appwrite/sdk-for-web/releases/tag/17.0.0))

## [1.6.2] - 2024-12-21

- Updated dependencies, works with appwrite server 1.6.0
- Updated to appwrite Web-SDK version 16.1.0

## [1.6.1] - 2024-09-12

- Updated dependencies, works with appwrite server 1.6.0
- Updated to appwrite Web-SDK version 16.0.0

## [1.6.0] - 2024-09-12

- Updated dependencies, works with appwrite server 1.5.11

## [1.5.8] - 2024-06-01

- Updated appwrite sdk to 15.0.0 ([Changes in appwrite sdk-for-web](https://github.com/appwrite/sdk-for-web/releases/tag/15.0.0))

Breaking changes

- Renamed CreditCard.Consosud to CreditCard.Cencosud
- Removed return type for Account.deleteMfaAuthenticator()

Notable changes

- Added Flag.FrenchPolynesia
- Added MfaFactors.recoveryCode

Fixes

- Prevent manually set X-Fallback-Cookies from being wiped
- Miscellaneous
- Remove cross-fetch and isomorphic-form-data packages

## [1.5.7] - 2024-05-25

- Fixed bug, missing customId param [#4](https://github.com/blackfan23/ngx-appwrite/issues/4#issue-2313805238)
- Fixed bug, missing function execution settings [#3](https://github.com/blackfan23/ngx-appwrite/issues/3#issue-2313780308)

## [1.5.5] - 2024-05-21

- Updated dependencies
- Updated Appwrite Web SDK to 14.0.1
- Fixed a bug in lists observable, when using alternativeDatabaseId

## [1.5.4] - 2024-03-29

Added messaging service. See https://appwrite.io/docs/references/1.5.x/client-web/messaging

Updated dependencies.

## [1.5.3] - 2024-03-23

Changed some method names in account service to mirror the official names from the Appwrite Web SDK version 14.0.0

Added this changelog file.

## [1.5.2] - 2024-03-21

Inital release

[1.7.0]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.7.0
[1.6.2]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.6.2
[1.6.1]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.6.1
[1.6.0]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.6.0
[1.5.8]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.8
[1.5.7]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.7
[1.5.6]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.6
[1.5.5]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.5
[1.5.4]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.4
[1.5.3]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.3
[1.5.2]: https://github.com/blackfan23/ngx-appwrite/releases/tag/v1.5.2
