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
    try {
      const account = await this.account.get<{ hello: string }>();
      console.log('🚀 ~ AppComponent ~ ngOnInit ~ account:', account);
    } catch (error) {
      console.error('ngx-appwrite: account > ngOnInit:', error);
      await this.account.createEmailPasswordSession(
        SECRETS.EMAIL,
        SECRETS.PASSWORD,
      );
      const account = await this.account.get<{ hello: string }>();
    }
  }
}
