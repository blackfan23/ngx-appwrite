# ngx-appwrite (WIP)

A wrapper around the Appwrite WebSDK for easier implementation in Angular 13+ projects.
The goal is to make the whole SDK accessible as well as provide some convenience functionality
like RxJS streams where appropriate.

The library is opinionated and uses Zod for validation, a Zod schema must be passed to validate all data coming from the Appwrite server.

---

## Installation

Install appwrite javascript sdk with npm

```bash
  npm install appwrite
```

Install this package

```bash
  npm install ngx-appwrite
```

---

## Usage/Examples

1 - Add the module to the app root module. Using your credentials. You can find them in the Appwrite Admin Console.

```javascript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { NgxAppwriteModule } from 'ngx-appwrite';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgxAppwriteModule.forRoot({
      endpoint: 'https://appwrite.mydomain.eg',
      project: '<projectID>',
      defaultDatabase: '<defaultDatabaseID>',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

2 - Example: Use the appwrite service to access the SDK

```javascript
import { Component } from '@angular/core';
import { Appwrite } from 'ngx-appwrite';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private appwrite: Appwrite) {}

  async addDocument(data: Record<string, unknown>): Promise<void> {
    return this.appwrite.databases.createDocument('<collectionID>', data);
  }
}
```

---

## Account

See [Account API](https://appwrite.io/docs/client/account)

_Observe auth state_

```javascript
import { Component } from '@angular/core';
import { Appwrite } from 'ngx-appwrite';
import { z } from 'zod';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private appwrite: Appwrite) {}

  // a zod schema to validate the user preferences
  private prefencesSchema = z.strictObject({
    favoriteColor: z.string()
  })

  // Monitors the current authentication state of users and fires on changes
  // CAUTION: This may not work under all circumstances at this time.
  // It returns the accountObject including the user preferences
  public auth$ = this.appwrite.account.onAuth(prefencesSchema);



  triggerAuthCheck(): void {
    // Triggers an auth check manually
    this.appwrite.account.triggerAuthCheck()
  }

  blockAccount(): void {
    // Suspend the currently logged in user account. Behind the scenes, the
    // user's record is not deleted, but permanently blocked from any access. To
    // completely delete a user, use the Users API instead.
    this.appwrite.account.blockAccount()
  }

  convertAnonymousAccount(): void {

    // This endpoint is a shortcut for converting an anonymous
    // account to a permanent one
    this.appwrite.account
    .convertAnonymousAccountWithEmailAndPassword('<email>', '<password>')

  }
}
```

---

## Avatars

See [Avatars API](https://appwrite.io/docs/client/avatars)

## Databases

See [Databases API](https://appwrite.io/docs/client/databases) & [Appwrite Realtime](https://appwrite.io/docs/realtime#channels)

```javascript
import { Component } from '@angular/core';
import { Appwrite } from 'ngx-appwrite';
import { z } from 'zod';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private appwrite: Appwrite) {}


  // -----------------------------------------------------------------------
  //                                REALTIME
  // -----------------------------------------------------------------------
  ngOnInit(): void {

    // define a schema in order to validate the custom document data received from the server
    const myDocumentSchema = z.strictObject({
      username: z.string(),
      isAdmin: z.boolean(),
      isCool: z.boolean()
    })
    // Monitoring a Collection
    // Accepts Queries, however, listening to queries is done manually for now
    // https://github.com/appwrite/appwrite/issues/2490
    this.appwrite.databases.collection$('<collection-id>', myDocumentSchema)
    .subscribe(data => console.log(docData));

    // Monitor a document
    this.appwrite.databases.document$('<collection-id>', '<document-id>', myDocumentSchema)
    .subscribe(docData => console.log(docData))
  }
}
```

## Functions

See [Functions API](https://appwrite.io/docs/client/functions)

## Localization

See [Localizations API](https://appwrite.io/docs/client/locale)

## Storage

See [Storage API](https://appwrite.io/docs/client/storage)

## Teams

See [Teams API](https://appwrite.io/docs/client/teams)

## License

[MIT](https://choosealicense.com/licenses/mit/)
