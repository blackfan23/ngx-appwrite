# ngx-appwrite (WIP)

A wrapper around the Appwrite WebSDK for easier implementation in Angular 13+ projects.
The goal is to make the whole SDK accessible as well as provide some convenience functionality
like RxJS streams where appropriate.

## API Reference

For now, you can find the API reference directly at
[appwrite.io](https://appwrite.io/docs)

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
## Currently implemented

[appwrite.io](https://appwrite.io/docs)

---
### Account
See [Account API](https://appwrite.io/docs/client/account)

_Observe auth state_

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

  // Monitors the current authentication state of users and fires on changes
  // CAUTION: This may not work under all circumstances at this time.
  auth$: Observable<null | Models.Account<Models.Preferences>> = 
    this.appwrite.account.auth$;



  triggerAuthCheck(): void {
    // Triggers an auth check manually
    this.appwrite.account.triggerAuthCheck()
  }
}
```

---
### Avatars
See [Avatars API](https://appwrite.io/docs/client/avatars)

### Databases
See [Databases API](https://appwrite.io/docs/client/databases)

[Appwrite Realtime](https://appwrite.io/docs/realtime#channels)




### Functions

### Localization
### Storage
### Teams

## License

[MIT](https://choosealicense.com/licenses/mit/)
