# ngx-appwrite (WIP)

A wrapper around the Appwrite WebSDK for easier implementation in Angular 13+ projects.
The goal is to make the whole SDK accessible as well as to provide some convenience functionality
e.g. RxJS streams where appropriate.

## API Reference

For now please find the API reference directly at
[appwrite.io](https://appwrite.io/docs/client/account)

## Installation

Install appwrite javascript sdk with npm

```bash
  npm install appwrite
```

Install this package

```bash
  npm install ngx-appwrite
```

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

## Currently implemented

Databases
Teams

... more coming soon, hang in there

## License

[MIT](https://choosealicense.com/licenses/mit/)
