import Dashboard from 'supertokens-node/recipe/dashboard';
import { Inject, Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';

import { ConfigInjectionToken, AuthModuleConfig } from '../config.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CustomerService } from 'src/v1/customer/customer.service';
import { SessionService } from '../session/session.service';
import { CredentialsService } from '../credentials/credentials.service';

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
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
  ) {
    const getSocialUserInfo = this.getSocialUserInfo.bind(this);
    const refreshSession = this.sessionService.refreshSession.bind(
      this.sessionService,
    );

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
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events',
              ],
            }),
            ThirdPartyEmailPassword.Facebook({
              clientId: '174713798769879',
              clientSecret: '773975cc0fa0f05e9faa82dde3b534ca',
              scope: ['email', 'public_profile'],
            }),
          ],
          override: {
            apis: (originalImplementation) => {
              return {
                ...originalImplementation,
                emailPasswordSignUpPOST: async function (input) {
                  if (
                    originalImplementation.emailPasswordSignUpPOST === undefined
                  ) {
                    throw Error('Should never come here');
                  }
                  const response =
                    await originalImplementation.emailPasswordSignUpPOST(input);

                  // Post sign up response, we check if it was successful
                  if (response.status === 'OK') {
                    const { id, email } = response.user;

                    const userInfo = await getSocialUserInfo(response.user);

                    await credentialsService.createUser(id, email, userInfo);

                    await refreshSession(id);
                  }

                  return response;
                },
                thirdPartySignInUpPOST: async function (input) {
                  if (
                    originalImplementation.thirdPartySignInUpPOST === undefined
                  ) {
                    throw Error('Should never come here');
                  }

                  // First we call the original implementation of thirdPartySignInUpPOST.
                  const response =
                    await originalImplementation.thirdPartySignInUpPOST(input);

                  // TODO save google access token might be useless? Needed for calendar ?
                  console.log(response);

                  // Post sign up response, we check if it was successful
                  if (response.status === 'OK') {
                    const { id, email } = response.user;

                    if (response.createdNewUser) {
                      const userInfo = await getSocialUserInfo(
                        response.user.thirdParty,
                        response.authCodeResponse,
                      );

                      await credentialsService.createUser(id, email, userInfo);
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
                  const credentials = await credentialsService.get(
                    input.userId,
                  );

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
    authCodeResponse?: any,
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
