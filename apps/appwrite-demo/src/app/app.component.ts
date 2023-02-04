import { Component } from '@angular/core';
import { Appwrite } from 'ngx-appwrite';

@Component({
  selector: 'ngx-temp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'appwrite-demo';
  constructor(private aw: Appwrite) {
    this.aw.account.auth$.subscribe(console.log);
  }
}
