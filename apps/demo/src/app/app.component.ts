import { Component, OnInit, inject, signal } from '@angular/core';
import { Account } from 'ngx-appwrite';
import { HumansRxdbService } from './appwrite.rxdb.service';
import { FriendsService } from './appwrite.service';
import { NxWelcomeComponent } from './nx-welcome.component';
import { SECRETS } from './secrets.env';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private account = inject(Account);
  private friendsService = inject(FriendsService);
  private humansService = inject(HumansRxdbService);
  title = signal(SECRETS.TITLE);

  // login to appwrite
  async ngOnInit() {
    setTimeout(() => {
      this.title.set('no title');
    }, 2500);

    let account = await this.account.get<{ hello: string }>();
    if (!account) {
      // login if account can't be retrieved
      await this.account.createEmailPasswordSession(
        SECRETS.EMAIL,
        SECRETS.PASSWORD,
      );
      account = await this.account.get<{ hello: string }>();
    }

    console.log(account?.prefs.hello);

    this.account.onAuth<{ hello: string }>().subscribe((account) => {
      console.log(account?.prefs.hello);
    });

    const list$ = this.humansService.raw.documentList$({
      age: {
        $eq: 55,
      },
    });

    list$.subscribe((list) => {
      console.log('🚀 ~ AppComponent ~ ngOnInit ~ list:', list);
    });

    // add two humans that are 55 years old
    await this.humansService.create({
      name: 'Jon Doe',
      age: 55,
      homeAddress: '123 Main St',
    });

    await this.humansService.create({
      name: 'Jane Doe',
      age: 55,
      homeAddress: '123 Main St',
    });
  }
}
