import { Component, OnInit, inject } from '@angular/core';
import { Account } from 'ngx-appwrite';
import { HumanComponent } from './human.component';
import { SECRETS } from './secrets.env';

@Component({
  standalone: true,
  imports: [HumanComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private account = inject(Account);

  // login to appwrite
  async ngOnInit() {
    let account = await this.account.get<{ hello: string }>();
    console.log('🚀 ~ AppComponent ~ ngOnInit ~ account:', account);
    if (!account) {
      // login if account can't be retrieved
      await this.account.createEmailPasswordSession(
        SECRETS.EMAIL,
        SECRETS.PASSWORD,
      );
      account = await this.account.get<{ hello: string }>();
    }
  }
}
