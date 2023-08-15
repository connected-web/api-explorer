import memoizee from 'memoizee'
import { OAuthClientPlugin, createOAuthClient } from './VueAuthPlugin'
import { OAuthClientOptions } from './OAuthClient'

const uatIdentityDetails = {
  name: 'Connected Web (UAT)',
  auth: 'https://connected-web-dev.auth.eu-west-2.amazoncognito.com',
  url: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_VBRbzaly6',
  clientId: '5rgdg0eeeeu043fbfvl12ehrmg',
  scopes: 'openid email profile'
}

const prodIdentityDetails = {
  name: 'Connected Web (Prod)',
  auth: 'https://connected-web.auth.eu-west-2.amazoncognito.com',
  url: 'https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_rt9QhO9KA',
  clientId: '2fomt3amj0luqe3o5ce8ou76m8',
  scopes: 'openid email profile'
}

const makeOAuthClient = memoizee(function (identityConfig: OAuthClientOptions) {
  const authClient = createOAuthClient({
    ...identityConfig,
    redirectUri: `${window.location.origin}/api-explorer/`, // Return to execute auth handler code
    useLocalLoginRedirectUrl: true, // Return users back to the page they were viewing before auth
    postLogoutRedirectUri: `${window.location.origin}/api-explorer/`
  })
  authClient.initialize()
    .catch((err) => {
      console.error('Unable to initialize the OAuthClient:', err)
    }) // Deliberate side-effect, process auth conditions in current browser context
  return authClient
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Auth {
  static getOAuthClient (): OAuthClientPlugin {
    // See also: "this.$vueAuth" for bindable vue properties in VueAuthPlugin.ts
    const identityConfig = Auth.getIdentityDetails()
    return makeOAuthClient(identityConfig)
  }

  static async getLatestAccessToken (): Promise<string | boolean> {
    const authClient = this.getOAuthClient()
    const accessToken = await authClient.initialize()
    return accessToken ?? false
  }

  static getIdentityDetails (): OAuthClientOptions {
    const uatMode = false
    return uatMode ? uatIdentityDetails : prodIdentityDetails
  }
}
