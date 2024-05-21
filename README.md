# ngx-appwrite

A wrapper around the Appwrite WebSDK for easier implementation in Angular 16+ projects.
The goal is to make the whole SDK accessible as well as provide some convenience functionality
like RxJS streams where appropriate.

---

## Compatibility

| ngx-appwrite | Appwrite-Server | Angular | Appwrite-Web SDK |
| ------------ | --------------- | ------- | ---------------- |
| 1.5.5        | 1.5.5           | 16+     | 14.0.1           |
| 1.5.4        | 1.5.4           | 16+     | 14.0.0           |

## Installation

```bash
  npm install ngx-appwrite
```

---

## Usage/Examples

1 - The package is using an Angular standalone configuration.

```javascript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideAppwrite } from 'ngx-appwrite';
import { SECRETS } from '../secrets.env';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAppwrite({
      endpoint: SECRETS.SERVER_URL,
      project: SECRETS.PROJECT_ID,
      defaultDatabase: SECRETS.DEFAULT_DATABASE,
    }),
  ],
};
```

2 - Alternative A: Use the appwrite services to access the SDK

```javascript
import { Component, OnInit, inject } from '@angular/core';
import { Account } from 'ngx-appwrite';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private account = inject(Account);

  // login to appwrite
  async ngOnInit() {

      // login
      const session = await this.account.createEmailPasswordSession(
        SECRETS.EMAIL,
        SECRETS.PASSWORD,
      );

      console.log(session);

      // provide the prefs structure
      const account = await this.account.get<{ hello: string }>();
      console.log(account.prefs.hello);
      // output 'world'

       // observable stream on the users auth session
      this.account.onAuth<{ hello: string }>()
      .subscribe((account: Models.User<{ hello: string }> | null) => {
        console.log(account?.prefs.hello);
      });
    }
}
```

2 - Alternative B: Use the service adapter to connect to collections

```javascript
// friends.service.ts
import { Injectable } from '@angular/core';
import { AppwriteAdapter } from 'ngx-appwrite';
import { Input, array, merge, number, object, parse, string } from 'valibot';

// Validation is optional, this example uses Valibot, but you can use any validation library or implement your own logic

// Valibot reference schema for the Appwrite base document
const AppwriteDocumentSchema = object({
  $id: string(),
  $collectionId: string(),
  $databaseId: string(),
  $createdAt: string(),
  $updatedAt: string(),
  $permissions: array(string()),
});

// Valibot schema for friends, merges base document
const friendSchema = merge([
  object({
    name: string(),
    age: number(),
  }),
  AppwriteDocumentSchema,
]);

// inferred type from Valibot schema
export type Friend = Input<typeof friendSchema>;

@Injectable({
  providedIn: 'root',
})
export class FriendsService extends AppwriteAdapter {
  // required
  protected collectionId = <COLLECTION_ID>;

  // The appwrite adapter implements CRUD operations as well as the ability to validate retrieved data. If the validationFn property is undefined, no validation of incoming data is performed.
  protected validationFn = <Friend>(friend: Friend) =>
    // validate using Valibot parse method
    parse(friendSchema, friend) as Friend;

  // AppwriteAdapter provides the following methods
  // create
  // update
  // upsert
  // delete
  //
  // document (Promise)
  // document$ (Observable)
  // documentList (Promise)
  // documentList$ (Observable)
}
```

Use the FriendsService in your component

```javascript
import { Component, OnInit, inject } from '@angular/core';
import { Account } from 'ngx-appwrite';
import { Friend, FriendsService } from './appwrite.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private friendsService = inject(FriendsService);

  // login to appwrite
  async ngOnInit() {
    this.friendsService.documentList$<Friend>().subscribe((list) => {
      console.log(
        'Friend age:',
        list.documents[0].age,
      );
      console.log(
        'Friend name:',
        list.documents[0].name,
      );
    });

    await this.friendsService.create<Friend>({
      name: 'Mae Sue',
      age: 18,
    });
  }
}
```

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
