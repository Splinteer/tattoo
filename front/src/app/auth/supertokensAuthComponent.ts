import * as React from 'react';
import * as SuperTokens from 'supertokens-auth-react';
import * as ThirdPartyEmailPassword from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import {
  Github,
  Google,
  Facebook,
  Apple,
} from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import Session from 'supertokens-auth-react/recipe/session';

SuperTokens.init({
  appInfo: {
    appName: 'app',
    apiDomain: 'http://localhost:3000',
    websiteDomain: 'http://localhost:4200',
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdPartyEmailPassword.init({
      signInAndUpFeature: {
        providers: [Google.init(), Facebook.init(), Apple.init()],
      },
    }),
    Session.init(),
  ],
});

class SuperTokensReactComponent extends React.Component {
  override render() {
    if (SuperTokens.canHandleRoute()) {
      return SuperTokens.getRoutingComponent();
    }
    return 'Route not found';
  }
}

export default SuperTokensReactComponent;
