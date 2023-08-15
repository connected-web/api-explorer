import * as oauth from 'oauth4webapi'
import type { Storage } from './Storage.js'
import { LocalStorage } from './LocalStorage.js'
import axios from 'axios'

function nullOrEmpty (value: string | null | undefined): boolean {
  return value === null || value === '' || value === undefined
}

export interface OAuthClientOptions {
  /**
   * The URL of the OAuth issuer
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *  url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * ```
   */
  url: string
  /**
   * The client ID of the application
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *  url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * ```
   */
  clientId: string
  /**
   * The client authentication method, see {@link oauth.ClientAuthenticationMethod}
   * @default 'none' public client
   * @see [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html#section-2.3)
   * @see [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
   * @see [OAuth Token Endpoint Authentication Methods](https://www.iana.org/assignments/oauth-parameters/oauth-parameters.xhtml#token-endpoint-auth-method)
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *  url: 'https://example.com',
   *   clientId: 'my-client-id',
   *  tokenEndpointAuthMethod: 'client_secret_basic'
   * })
   * ```
   */
  tokenEndpointAuthMethod?: oauth.ClientAuthenticationMethod
  /**
   * The scopes requested to the OAuth server.
   * @default ''
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   *   scopes: 'openid profile email'
   * })
   * ```
   */
  scopes?: string[] | string
  /**
   * The storage to use for persisting the refresh token.
   * @default
   * `new LocalStorage('oauth')`
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   *   storage: new SessionStorage('my-app')
   * })
   * ```
   */
  storage?: Storage
  /**
   * The redirect URI.
   * @default
   * `document.location.origin`
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   *   redirectUri: 'https://my-app.com/callback'
   * })
   * ```
   */
  redirectUri?: string
  /**
   * The URL to redirect the user after the logout.
   * @default
   * `document.location.origin`
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   *   postLogoutRedirectUri: 'https://my-app.com'
   * })
   * ```
   */
  postLogoutRedirectUri?: string
  /**
   * The locally stored URL to redirect the user after the login.
   *
   * Use with single page webapps that use hash fragments to track state.
   * @default
   * `document.location.origin`
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   *   localPostLogoutRedirectUri: 'https://my-app.com'
   * })
   * ```
   */
  useLocalLoginRedirectUrl?: boolean
}

function generateNonce (): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._~'
  const result: string[] = []
  crypto.getRandomValues(new Uint8Array(32)).forEach(c => {
    result.push(charset[c % charset.length])
  })
  return result.join('')
}

export class OAuthClient {
  private readonly _client: oauth.Client
  private _issuer: URL
  private _scope: string
  private _storage: Storage | LocalStorage
  private _redirectUri: string
  private _postLogoutRedirectUri: string
  private readonly _useLocalLoginRedirectUrl: boolean
  private _authorizationServer?: oauth.AuthorizationServer

  constructor (options: OAuthClientOptions) {
    this._issuer = new URL(options.url)
    this._client = {
      client_id: options.clientId,
      token_endpoint_auth_method:
        options.tokenEndpointAuthMethod ?? 'none'
    }
    this._scope =
      typeof options.scopes === 'string'
        ? options.scopes
        : options.scopes?.join(' ') ?? ''
    this._storage = options.storage ?? new LocalStorage('oauth')
    this._redirectUri = options.redirectUri ?? document.location.origin
    this._postLogoutRedirectUri =
      options.postLogoutRedirectUri ?? document.location.origin
    this._useLocalLoginRedirectUrl = options.useLocalLoginRedirectUrl ?? false
  }

  private get _codeVerifier (): string | null {
    return this._storage.getEncrypted('code_verifier') ?? null
  }

  private set _codeVerifier (value) {
    this._storage.setEncrypted('code_verifier', value)
  }

  private get _refreshToken (): string | null {
    return this._storage.getEncrypted('refresh_token') ?? null
  }

  private set _refreshToken (value) {
    this._storage.setEncrypted('refresh_token', value)
  }

  private get _accessToken (): string | null {
    return this._storage.getEncrypted('access_token') ?? null
  }

  private set _accessToken (value) {
    this._storage.setEncrypted('access_token', value)
  }

  private get _idToken (): string | null {
    return this._storage.getEncrypted('id_token') ?? null
  }

  private set _idToken (value) {
    this._storage.setEncrypted('id_token', value)
  }

  private get _expiryTime (): Date | null {
    const dateString = this._storage.getEncrypted('expiry_time') ?? '2023-07-01'
    return !nullOrEmpty(dateString) ? new Date(dateString) : null
  }

  private set _expiryTime (value: Date | null) {
    const dateString = (value != null) ? value.toISOString() : undefined
    this._storage.setEncrypted('expiry_time', dateString)
  }

  private get _localPostLoginRedirectUri (): string | undefined | null {
    return this._storage.getEncrypted('post_login_redirect_uri')
  }

  private set _localPostLoginRedirectUri (value) {
    this._storage.setEncrypted('post_login_redirect_uri', value)
  }

  /**
   * Extends the client options.
   * @param options - The options to change.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * client.extend({
   *   scopes: 'openid profile email'
   * })
   * ```
   */
  public extend (options: OAuthClientOptions): void {
    if (options.url !== '') {
      this._issuer = new URL(options.url)
      this._authorizationServer = undefined
    }
    if (options.clientId !== '') {
      this._client.client_id = options.clientId
    }
    if (options.tokenEndpointAuthMethod !== undefined) {
      this._client.token_endpoint_auth_method = options.tokenEndpointAuthMethod
    }
    if (Array.isArray(options.scopes) || options.scopes !== undefined) {
      this._scope =
        typeof options.scopes === 'string'
          ? options.scopes
          : options.scopes?.join(' ') ?? ''
    }
    if (options.storage != null) {
      this._storage = options.storage
    }
    if (options.redirectUri !== undefined) {
      this._redirectUri = options.redirectUri
    }
    if (options.postLogoutRedirectUri !== undefined) {
      this._postLogoutRedirectUri = options.postLogoutRedirectUri
    }
  }

  /**
   * Initializes the client and tries to refresh the token if a refresh token is available, see {@link refreshAccessToken}.
   * or handle the code response if a code verifier is available, see {@link handleCodeResponse}.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * ```
   */
  public async initialize (): Promise<string | boolean> {
    const now = new Date()
    const expiryTime = this.expiryTime
    if ((expiryTime == null) || now > expiryTime) {
      this._authorizationServer = await oauth
        .discoveryRequest(this._issuer)
        .then(async (response) =>
          await oauth.processDiscoveryResponse(this._issuer, response)
        )
      if (!nullOrEmpty(this._refreshToken)) {
        return await this.refreshAccessToken()
      }
      if (!nullOrEmpty(this._codeVerifier)) {
        const urlParams = new URLSearchParams(window.location.search)
        return await this.handleCodeResponse(urlParams)
      }
    }
    return this.accessToken ?? false
  }

  /**
   * Authorize the application redirecting the client to the authorization server.
   * @throws If the client is not initialized.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * await client.authorize()
   * ```
   */
  public async authorize (): Promise<void> {
    if (this._authorizationServer == null) {
      throw new Error('OAuthClient not initialized')
    }
    this._codeVerifier = oauth.generateRandomCodeVerifier()
    const codeChallenge = await oauth.calculatePKCECodeChallenge(this._codeVerifier)
    const authorizationUrl = new URL(
      this._authorizationServer?.authorization_endpoint ??
      `${this._issuer.toString()}/oauth2/authorize`
    )

    this._storage.set('nonce', generateNonce())

    if (this._useLocalLoginRedirectUrl) {
      this._localPostLoginRedirectUri = document.location.toString()
    }

    authorizationUrl.searchParams.set('client_id', this._client.client_id)
    authorizationUrl.searchParams.set('code_challenge', codeChallenge)
    authorizationUrl.searchParams.set('code_challenge_method', 'S256')
    authorizationUrl.searchParams.set('redirect_uri', `${this._redirectUri}`)
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', this._scope)
    authorizationUrl.searchParams.set('nonce', this._storage.get('nonce') as string)
    document.location.replace(authorizationUrl.toString())
  }

  /**
   * Handle the authorization code response.
   * @throws If the client is not initialized.
   * @param urlParams - The URL parameters.
   */
  public async handleCodeResponse (urlParams: URLSearchParams): Promise<boolean> {
    if (this._authorizationServer == null) {
      throw new Error('OAuthClient not initialized')
    }
    if (this._codeVerifier === null) {
      return false
    }
    if (!urlParams.has('code')) {
      this._codeVerifier = null
      return false
    }
    const params = oauth.validateAuthResponse(
      this._authorizationServer,
      this._client,
      urlParams,
      oauth.expectNoState
    )
    if (oauth.isOAuth2Error(params)) {
      this._codeVerifier = null
      throw new Error('OAuth 2.0 redirect error')
    }
    const response = await oauth.authorizationCodeGrantRequest(
      this._authorizationServer,
      this._client,
      params,
      this._redirectUri,
      this._codeVerifier
    )
    if (oauth.parseWwwAuthenticateChallenges(response) != null) {
      this._codeVerifier = null
      throw new Error('www-authenticate challenges error')
    }
    const result = await oauth.processAuthorizationCodeOpenIDResponse(
      this._authorizationServer,
      this._client,
      response,
      this._storage.get('nonce') as string
    )
    if (oauth.isOAuth2Error(result)) {
      this._codeVerifier = null
      throw new Error('OAuth 2.0 response body error')
    }

    console.log('OAuth Result:', { result })

    this._codeVerifier = null
    this._accessToken = result.access_token
    this._refreshToken = result.refresh_token ?? null
    this._idToken = result.id_token

    const now = new Date()
    const expiresIn = result.expires_in ?? 3600
    this._expiryTime = new Date(now.getTime() + (expiresIn * 1000))

    // Remove code from location
    const postLoginRedirectUrl = this._localPostLoginRedirectUri ?? null
    if (!nullOrEmpty(postLoginRedirectUrl)) {
      document.location.replace(postLoginRedirectUrl ?? 'not-set')
    } else {
      const code = urlParams.get('code') ?? 'no-code'
      document.location.replace((document.location.toString()).replace(`?code=${code}`, ''))
    }

    return (!nullOrEmpty(this.accessToken))
  }

  /**
   * Refresh the access token.
   * @throws If the client is not initialized.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * await client.refreshToken()
   * ```
   * @returns The new access token.
   */
  public async refreshAccessToken (): Promise<string | boolean> {
    // console.log('Refresh access token')
    if (this._authorizationServer == null) {
      this._authorizationServer = await oauth
        .discoveryRequest(this._issuer)
        .then(async (response) =>
          await oauth.processDiscoveryResponse(this._issuer, response)
        )
    }
    if (this._refreshToken === null || this._refreshToken === '') {
      console.log('No refresh token')
      return false
    }
    // console.log('oauth.refreshTokenGrantRequest start')
    const response = await oauth.refreshTokenGrantRequest(
      this._authorizationServer,
      this._client,
      this._refreshToken ?? 'no-token'
    )
    // console.log('oauth.processRefreshTokenResponse start')
    const result = await oauth.processRefreshTokenResponse(
      this._authorizationServer,
      this._client,
      response
    )
    // console.log('Refresh token response:', response)
    if (oauth.isOAuth2Error(result)) {
      throw new Error('OAuth 2.0 response body error')
    }
    // console.log('Refresh token result:', { result })
    this._accessToken = result.access_token
    if (result.refresh_token !== undefined) {
      this._refreshToken = result.refresh_token
    }
    this._idToken = result.id_token ?? null

    // console.log('Update expiry time:')
    const now = new Date()
    const expiresIn = result.expires_in ?? 3600
    this._expiryTime = new Date(now.getTime() + (expiresIn * 1000))

    return this.accessToken ?? false
  }

  /**
   * Get user details from server
   * @throws If the client is not initialized.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * await client.userInfo()
   * ```
   */
  public async userInfo (): Promise<any> {
    if (this._authorizationServer == null) {
      this._authorizationServer = await oauth
        .discoveryRequest(this._issuer)
        .then(async (response) =>
          await oauth.processDiscoveryResponse(this._issuer, response)
        )
    }

    const userInfoUrl = new URL(
      this._authorizationServer?.userinfo_endpoint ??
      `${this._issuer.toString()}/oauth2/userInfo`
    )
    const bearerToken = this.accessToken ?? 'not-set'
    let response
    try {
      response = await axios.get(userInfoUrl.toString(), {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      })
    } catch (ex) {
      return response?.data ?? { error: `User info unavailble: ${(ex as Error).message}` }
    }
    return response?.data ?? { error: 'No data in /oauth2/userInfo response' }
  }

  /**
   * Logout the user.
   * @param logoutHint - The hint to the Authorization Server about the End-User that is logging out.
   * @param local - Clear credentials locally, reload page, but don't notify the Authorization Server
   * @throws If the client is not initialized.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * client.logout()
   * ```
   */
  public logout (logoutHint?: string, local: boolean = false): void {
    if (this._authorizationServer == null) {
      throw new Error('OAuthClient not initialized')
    }
    this._refreshToken = null
    this._idToken = null
    this._expiryTime = null
    console.log('Logged in:', { loggedIn: this.loggedIn })
    if (this.loggedIn) {
      this._accessToken = null
      const logoutUrl = new URL(
        this._authorizationServer?.end_session_endpoint ??
        `${this._issuer.toString()}/oauth2/logout`
      )
      logoutUrl.searchParams.set(
        'post_logout_redirect_uri',
        this._postLogoutRedirectUri
      )
      if (logoutHint !== undefined && logoutHint !== '') {
        logoutUrl.searchParams.set('logout_hint', logoutHint ?? '')
      }
      if (local) {
        document.location.reload()
      } else {
        document.location.replace(logoutUrl.toString())
      }
    }
  }

  /**
   * If an idToken is available, it can be decoded to extract its payload
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * console.log('Decoded ID Token:', client.decodedIdToken)
   * ```
   */
  get decodedIdToken (): any {
    const idToken = this._idToken
    try {
      const parts = (idToken ?? '').split('.')
      const encodedPayload = parts[1]

      const decodedPayload = atob(encodedPayload)
      return JSON.parse(decodedPayload)
    } catch (ex) {
      return { error: (ex as Error).message, idToken }
    }
  }

  /**
   * The user is logged in.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * if (client.loggedIn) {
   *   // User is logged in
   * }
   * ```
   */
  public get loggedIn (): boolean {
    return !nullOrEmpty(this._accessToken)
  }

  /**
   * The retrieved access token.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * if (client.loggedIn) {
   *   // User is logged in
   *   console.log(client.refreshToken)
   * }
   * ```
   */
  public get refreshToken (): string | null {
    return this._refreshToken ?? null
  }

  /**
   * The retrieved access token.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * if (client.loggedIn) {
   *   // User is logged in
   *   console.log(client.accessToken)
   * }
   * ```
   */
  public get accessToken (): string | null {
    return this._accessToken ?? null
  }

  /**
   * The retrieved id token.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * if (client.loggedIn) {
   *   // User is logged in
   *   console.log(client.idToken)
   * }
   * ```
   */
  public get idToken (): string | null {
    return this._idToken ?? null
  }

  /**
   * The expiry time of a stored token; calculated on retrieval.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * await client.initialize()
   * if (client.loggedIn) {
   *   // User is logged in
   *   console.log(client.expiryTime)
   * }
   * ```
   */
  public get expiryTime (): Date | null {
    return this._expiryTime
  }

  /**
   * Indicates whether the client has been initialized.
   * @example
   * ```typescript
   * const client = new OAuthClient({
   *   url: 'https://example.com',
   *   clientId: 'my-client-id',
   * })
   * if (!client.initialized) {
   *   await client.initialize()
   * }
   * ```
   */
  public get initialized (): boolean {
    return !(this._authorizationServer == null)
  }
}
