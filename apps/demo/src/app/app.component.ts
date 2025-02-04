import { Component, OnInit, inject, signal } from '@angular/core';
import { Account } from 'ngx-appwrite';
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
  title = signal(SECRETS.TITLE);

  // login to appwrite
  async ngOnInit() {
    setTimeout(() => {
      this.title.set('no title');
    }, 2500);

    try {
      const account = await this.account.get<{ hello: string }>();
      console.log(account.prefs.hello);
    } catch (error) {
      console.log(error);
      // login if account can't be retrieved
      await this.account.createEmailPasswordSession(
        SECRETS.EMAIL,
        SECRETS.PASSWORD,
      );
    }

    this.account.onAuth<{ hello: string }>().subscribe((account) => {
      console.log(account?.prefs.hello);
    });

    this.friendsService.documentList$().subscribe((list) => {
      console.log('Default list ', list.documents);
    });
    this.friendsService
      .documentList$(undefined, undefined, SECRETS.ALTERNATE_DATABASE)
      .subscribe((list) => {
        console.log('Alternate List', list.documents);
      });

    const created = await this.friendsService.create(
      {
        name: 'Mae Sue',
        age: 12,
      },
      [], // permissions,
    );
    console.log('🚀 ~ AppComponent ~ ngOnInit ~ create:', created.age);
    console.log('🚀 ~ AppComponent ~ ngOnInit ~ create:', created.name);
    console.log('🚀 ~ AppComponent ~ ngOnInit ~ create:', created.$id);

    this.friendsService
      .document$('65fc3f41ce84f248516d')
      .subscribe((friend) => {
        console.log('🚀 ~ AppComponent ~ ngOnInit ~ friend:', friend);
        console.log(
          '🚀 ~ AppComponent ~ ngOnInit ~ friend:',
          friend?.$updatedAt,
        );
        console.log('🚀 ~ AppComponent ~ ngOnInit ~ friend:', friend?.name);
      });

    await this.friendsService.update({
      $id: '65fc3f41ce84f248516d',
      name: 'Mae Sue',
      age: 18,
    });
  }
}
