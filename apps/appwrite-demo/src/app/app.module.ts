import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule } from '@angular/router';
import { NgxAppwriteModule } from 'ngx-appwrite';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
  declarations: [AppComponent, NxWelcomeComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgxAppwriteModule.forRoot({
      endpoint: 'https://appwrite.nas4.us/v1',
      project: '640781e28ff4dbf65fc0',
      defaultDatabase: '63b82f88f0730faf2b9a',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
