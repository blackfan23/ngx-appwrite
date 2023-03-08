import { Component } from '@angular/core';
import { Appwrite } from 'ngx-appwrite';
import { filter } from 'rxjs';
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
      .onAuth()
      .pipe(filter(Boolean))
      .subscribe((res) => console.log(res));
  }
}
