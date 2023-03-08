import { Component } from '@angular/core';
import { random } from 'lodash';
import { Appwrite } from 'ngx-appwrite';
import { filter } from 'rxjs';
import { z } from 'zod';
import { USER_DATA } from '../../test-db';

@Component({
  selector: 'ngx-temp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'appwrite-demo';
  constructor(private aw: Appwrite) {
    this.aw.account.createEmailSession(USER_DATA.email, USER_DATA.password);
    this.aw.account
      .onAuth(z.object({ favoriteColor: z.string() }))
      .pipe(filter(Boolean))
      .subscribe((res) => console.log(res));

    const schema = z.strictObject({
      firstKey: z.string(),
      secondKey: z.number(),
    });

    this.aw.databases
      .createDocument(
        '64086041caa9ac247081',
        {
          firstKey: 'hello',
          secondKey: random(300),
        },
        schema
      )
      .then((res) => console.log(res));

    // this.aw.databases
    //   .updateDocument(
    //     '64086041caa9ac247081',
    //     '64086041caa9ac247081',
    //     {
    //       firstKey: 'hello',
    //       secondKey: random(300),
    //     },
    //     schema
    //   )
    //   .then((res) => console.log(res));

    this.aw.databases
      .listDocuments('64086041caa9ac247081', z.object({ otherkey: z.string() }))
      .then((res) => console.log(res));
  }
}
