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
  ) {
    const getSocialUserInfo = this.getSocialUserInfo.bind(this);

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
            ThirdPartyEmailPassword.Github({
              clientId: '467101b197249757c71f',
              clientSecret: 'e97051221f4b6426e8fe8d51486396703012f5bd',
            }),
            ThirdPartyEmailPassword.Apple({
              clientId: '4398792-io.supertokens.example.service',
              clientSecret: {
                keyId: '7M48Y4RYDL',
                privateKey:
                  '-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----',
                teamId: 'YWQCXGJRJL',
              },
            }),
            // ThirdPartyEmailPassword.Facebook({
            //    clientSecret: "FACEBOOK_CLIENT_SECRET",
            //    clientId: "FACEBOOK_CLIENT_ID"
            // })
          ],
          override: {
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
                        response.user.thirdParty.id,
                        response.authCodeResponse,
                      );

                      customerService.create(id, email, userInfo);
                    } else {
                      console.log('User signed in!');
                      // TODO: Post sign in logic
                    }
                  }
                  return response;
                },
              };
            },
          },
        }),
        Session.init(),
        Dashboard.init(),
      ],
    });
  }

  private async getSocialUserInfo(
    thirdPart: string,
    authCodeResponse: any,
  ): Promise<UserInformations | void> {
    if (thirdPart === 'google') {
      return this.getGoogleUserInfo(authCodeResponse.access_token);
    }
  }

  private async getGoogleUserInfo(token: string): Promise<UserInformations> {
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
      gender: data.genders && data.genders[0]?.value,
      birthday,
      phone: data.phoneNumbers && data.phoneNumbers[0]?.value, // not working
    };
  }
}
