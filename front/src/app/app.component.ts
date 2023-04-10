import { Component } from '@angular/core';

import * as SuperTokens from 'supertokens-web-js';
import * as EmailVerification from 'supertokens-web-js/recipe/emailverification';
import * as Session from 'supertokens-web-js/recipe/session';

SuperTokens.init({
  appInfo: {
    appName: 'app',
    apiDomain: 'http://localhost:3000',
  },
  recipeList: [EmailVerification.init(), Session.init()],
});

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {
  title = 'app';
}
