import { CommonModule } from '@angular/common';
import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import {
  APPWRITE_CONFIG,
  APPWRITE_CONFIG_DEFAULT_VALUE,
} from './appwrite.config';
import { Appwrite } from './appwrite.service';

@NgModule({
  imports: [CommonModule],
  providers: [Appwrite],
})
export class NgxAppwriteModule {
  static forRoot(
    config = APPWRITE_CONFIG_DEFAULT_VALUE,
    @Optional() @SkipSelf() parentModule?: NgxAppwriteModule
  ): ModuleWithProviders<NgxAppwriteModule> {
    if (parentModule) {
      throw new Error(
        'NgxAppwriteModule is already loaded. Import it in the AppRootModule only'
      );
    }

    return {
      ngModule: NgxAppwriteModule,
      providers: [{ provide: APPWRITE_CONFIG, useValue: config }],
    };
  }
}
