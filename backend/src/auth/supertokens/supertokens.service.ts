import Dashboard from 'supertokens-node/recipe/dashboard';
import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';

import { ConfigInjectionToken, AuthModuleConfig } from '../config.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CustomerService } from 'src/customer/customer.service';
import { SessionService } from '../session/session.service';

export interface UserInformations {
  firstname?: string;
  lastname?: string;
  gender?: string;
  birthday?: string;
  phone?: string;
}

export interface UserRequiredInformations {
  id: string;
  email: string;
}

@Injectable()
export class SupertokensService {
  constructor(
    @Inject(ConfigInjectionToken) private config: AuthModuleConfig,
    private readonly http: HttpService,
    private readonly customerService: CustomerService,
    private readonly sessionService: SessionService,
  ) {
    const getSocialUserInfo = this.getSocialUserInfo.bind(this);
    const refreshSession = this.sessionService.refreshSession.bind(this);

    supertokens.init({
      appInfo: config.appInfo,
      supertokens: {
        connectionURI: config.connectionURI,
        apiKey: config.apiKey,
      },
      recipeList: [
        EmailVerification.init({
          mode: 'REQUIRED',
        }),
        ThirdPartyEmailPassword.init({
          providers: [
            // We have provided you with development keys which you can use for testing.
            // IMPORTANT: Please replace them with your own OAuth keys for production use.
            ThirdPartyEmailPassword.Google({
              clientId:
                '1003028044894-s67evkeiqhpv4h1dkkf0benvt0020s4q.apps.googleusercontent.com',
              clientSecret: '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',
              scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/user.birthday.read',
                'https://www.googleapis.com/auth/user.addresses.read',
                'https://www.googleapis.com/auth/user.gender.read',
                'https://www.googleapis.com/auth/user.phonenumbers.read',
              ],
            }),
            ThirdPartyEmailPassword.Facebook({
              clientId: '174713798769879',
              clientSecret: '773975cc0fa0f05e9faa82dde3b534ca',
              scope: ['email', 'public_profile'],
            }),
          ],
          override: {
            // functions: (originalImplementation) => {
            //   return {
            //     ...originalImplementation,
            //     thirdPartySignInUpPOST: async function (input) {
            //       console.log(JSON.stringify(input, null, 2));
            //       return await originalImplementation.thirdPartySignInUp(input);
            //     },
            //   };
            // },

            // functions: (originalImplementation) => {
            //   return {
            //     ...originalImplementation,

            //     // here we are only overriding the function that's responsible
            //     // for signing in or signing up a user.
            //     thirdPartySignInUp: async function (input) {
            //       // TODO: some custom logic
            //       console.log('oklm');
            //       console.log(
            //         await input.userContext._default.request.getJSONBody(),
            //       );
            //       // const { code } =
            //       //   await input.userContext._default.request.getFormData();
            //       // const test = await getSocialUserInfo(
            //       //   { id: 'google', userId: 'id' },
            //       //   code,
            //       // );
            //       // console.log(test);
            //       throw new Error();

            //       // or call the default behaviour as show below
            //       return await originalImplementation.thirdPartySignInUp(input);
            //     },
            //     // ...
            //     // TODO: override more functions
            //   };
            // },

            apis: (originalImplementation) => {
              return {
                ...originalImplementation,
                thirdPartySignInUpPOST: async function (input) {
                  if (
                    originalImplementation.thirdPartySignInUpPOST === undefined
                  ) {
                    throw Error('Should never come here');
                  }

                  // First we call the original implementation of thirdPartySignInUpPOST.
                  const response =
                    await originalImplementation.thirdPartySignInUpPOST(input);

                  // Post sign up response, we check if it was successful
                  if (response.status === 'OK') {
                    const { id, email } = response.user;

                    if (response.createdNewUser) {
                      const userInfo = await getSocialUserInfo(
                        response.user.thirdParty,
                        response.authCodeResponse,
                      );

                      await customerService.create(id, email, userInfo);
                    }

                    await refreshSession(id);
                  }

                  return response;
                },
              };
            },
          },
        }),
        Session.init({
          jwt: {
            enable: true,
          },
          override: {
            functions: function (originalImplementation) {
              return {
                ...originalImplementation,
                createNewSession: async function (input) {
                  const credentials =
                    await customerService.getCustomerCredentials(input.userId);

                  input.accessTokenPayload = {
                    ...input.accessTokenPayload,
                    credentials,
                  };

                  return originalImplementation.createNewSession(input);
                },
              };
            },
          },
        }),
        Dashboard.init(),
      ],
    });
  }

  private async getSocialUserInfo(
    thirdParty: { id: string; userId: string },
    authCodeResponse: any,
  ): Promise<UserInformations> {
    if (thirdParty.id === 'google') {
      return this.getGoogleUserInfo(
        thirdParty.userId,
        authCodeResponse.access_token,
      );
    }

    if (thirdParty.id === 'facebook') {
      return this.getFacebookUserInfo(
        thirdParty.userId,
        authCodeResponse.access_token,
      );
    }

    return {
      firstname: null,
      lastname: null,
      birthday: null,
      gender: null,
      phone: null,
    };
  }

  private async getGoogleUserInfo(
    id: string,
    token: string,
  ): Promise<UserInformations> {
    const profileData = [
      'addresses',
      'birthdays',
      // 'emailAddresses',
      'locales',
      'locations',
      'names',
      'phoneNumbers',
      'genders',
    ];
    const { data } = await lastValueFrom(
      this.http.get(
        `https://people.googleapis.com/v1/people/me?personFields=${profileData.join(
          ',',
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      ),
    );

    let birthday;
    if (data.birthdays && data.birthdays[0]?.date) {
      birthday = new Date(
        data.birthdays[0]?.date.year,
        data.birthdays[0]?.date.month - 1,
        data.birthdays[0]?.date.day,
      );
    }

    return {
      firstname: data.names && data.names[0]?.givenName,
      lastname: data.names && data.names[0]?.familyName,
      birthday,
      gender: data.genders && data.genders[0]?.value,
      phone: data.phoneNumbers && data.phoneNumbers[0]?.value, // not working
    };
  }

  private async getFacebookUserInfo(
    id: string,
    token: string,
  ): Promise<UserInformations> {
    const { data } = await lastValueFrom(
      this.http.get(`https://graph.facebook.com/${id}`, {
        params: {
          fields: 'id,name,email,birthday,first_name,gender,last_name,picture',
          access_token: token,
        },
      }),
    );

    return {
      firstname: data.first_name ?? null,
      lastname: data.last_name ?? null,
      birthday: data.birthday ?? null,
      gender: data.gender ?? null,
      phone: null,
    };
  }
}
