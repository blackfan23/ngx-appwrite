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
    const prefsSchema = z.object({ favoriteColor: z.string() });
    this.aw.account
      .onAuth(prefsSchema)
      .pipe(filter(Boolean))
      .subscribe((res) => console.log(res));

    setTimeout(() => {
      const res = this.aw.account.updateName(
        `Mark Madlock ${random(100)}`,
        prefsSchema
      );
    }, 2000);

    const schema = z.strictObject({
      firstKey: z.string(),
      secondKey: z.number(),
    });

    // this.aw.databases
    //   .createDocument(
    //     '64086041caa9ac247081',
    //     {
    //       firstKey: 'hello',
    //       secondKey: random(300),
    //     },
    //     schema
    //   )
    //   .then((res) => console.log(res));

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
      .listDocuments('64086041caa9ac247081', schema)
      .then((res) => console.log(res));

    this.aw.databases
      .document$('64086041caa9ac247081', '64086078c2a4cd184587', schema)
      .subscribe((res) => console.log(res));

    // this.aw.databases
    //   .collection$('64086041caa9ac247081', schema, [
    //     Query.equal('firstKey', 'queryKey'),
    //   ])
    //   .subscribe((res) => console.log(res));

    setTimeout(async () => {
      const res = await this.aw.databases.updateDocument(
        '64086041caa9ac247081',
        '64086078c2a4cd184587',
        { secondKey: random(50) }
      );
    }, 5000);
  }
}
