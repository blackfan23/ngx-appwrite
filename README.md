# ngx-appwrite

A wrapper around the Appwrite WebSDK for easier implementation in Angular 16+ projects.
The goal is to make the whole SDK accessible as well as provide some convenience functionality
like RxJS streams where appropriate.

---

## Compatibility

| ngx-appwrite | Appwrite-Server | Angular | Appwrite-Web SDK |
| ------------ | --------------- | ------- | ---------------- |
| 1.7.4        | 1.7.X           | 19+     | 18.1.1           |
| 1.7.0        | 1.6.X           | 16+     | 17.0.0           |
| 1.6.X        | 1.6.X           | 16+     | 16.0.0           |

## Installation

```bash
  npm install ngx-appwrite
```

If you want to use Data replication with RxDB with RXDB (see [here](https://appwrite.io/integrations/replication-rxdb)) you need to install the RXDB dependencies as well

```bash
  npm install rxdb
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

### Alternative A: Use the appwrite services directly to access the SDK

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
      const account: Models.User<{ hello: string }> | null = await this.account.get<{ hello: string }>();
      console.log(account?.prefs.hello);
      // output 'world'

       // observable stream on the users auth session
      this.account.onAuth<{ hello: string }>()
      .subscribe((account: Models.User<{ hello: string }> | null) => {
        console.log(account?.prefs.hello);
      });
    }
}
```

### Alternative B: Use the service adapter to connect to collections

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
export class FriendsService extends AppwriteAdapter<Friend> {
  // required
  protected collectionId = <COLLECTION_ID>;

  // The appwrite adapter implements CRUD operations as well as the ability to validate retrieved data. If the validationFn property is undefined, no validation of incoming data is performed.
  protected validationFn = (data: unknown) =>
    // validate using Valibot parse method
    parse(friendSchema, data);

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
    this.friendsService.documentList$().subscribe((list) => {
      console.log(
        'Friend age:',
        list.documents[0].age,
      );
      console.log(
        'Friend name:',
        list.documents[0].name,
      );
    });

    await this.friendsService.create({
      name: 'Mae Sue',
      age: 18,
    });
  }
}
```

### Alternative C: Use the RXDB replication adapter for an offline-first approach.

Make sure you name your Appwrite databases and collections correctly according to the [official Docs](https://appwrite.io/integrations/replication-rxdb)

```javascript
// friends.service.ts
import { Injectable } from '@angular/core';
import { AppwriteAdapterWithReplication } from 'ngx-appwrite/replication';

// inferred type from schema
export interface Human {
  id: string;
  name: string;
  age: number;
  homeAddress: string;
}

@Injectable({
  providedIn: 'root',
})
export class HumansRxdbService extends AppwriteAdapterWithReplication<Human> {
  constructor() {
    super();
    this.startReplication({
      rxdbDatabasename: 'mydb',
      collectionId: 'humans',
      rxdbSchema: {
        title: 'humans',
        version: 0,
        primaryKey: 'id',
        type: 'object',
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          name: {
            type: 'string',
          },
          age: {
            type: 'number',
          },
          homeAddress: {
            type: 'string',
          },
        },
        required: ['id', 'name', 'age', 'homeAddress'],
      },
    });
  }
}
```

Use the HumansService in your component

```javascript
[...]
export class HumanComponent {
  private formBuilder = inject(FormBuilder);
  private humansService = inject(HumansRxdbService);

  humanForm = this.formBuilder.group({
    id: [''],
    name: ['', Validators.required],
    age: [0, Validators.required],
    homeAddress: ['', Validators.required],
  });

  humans$: Observable<RxDocument<Human>[]> = this.humansService.documentList$();

  saveHuman(): void {
    if (this.humanForm.valid) {
      const humanData = this.humanForm.getRawValue();
      if (!humanData.id) {
        delete (humanData as Partial<Human>).id;
      }
      this.humansService.upsert(humanData as Human);
      this.resetForm();
    }
  }

  editHuman(human: RxDocument<Human>): void {
    this.humanForm.patchValue(human.toJSON());
  }

  deleteHuman(human: RxDocument<Human>): void {
    human.remove();
  }

  resetForm(): void {
    this.humanForm.reset({
      id: '',
      name: '',
      age: 0,
      homeAddress: '',
    });
  }
}
```

---

## License

[MIT](https://choosealicense.com/licenses/mit/)
