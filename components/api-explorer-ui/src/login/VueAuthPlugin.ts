import { getCurrentInstance, inject, type App, type InjectionKey, computed, ComputedRef } from 'vue'
import { OAuthClient, type OAuthClientOptions } from './OAuthClient'
export { OAuthClient }
export { Storage } from './Storage'
export { LocalStorage } from './LocalStorage'

export const authClientInjectionKey = Symbol('Injection key for OAuthClient') as InjectionKey<OAuthClient>

export class OAuthClientPlugin {
  private readonly _oauthClient: OAuthClient

  constructor (options: OAuthClientOptions) {
    this._oauthClient = new OAuthClient(options)
  }

  public install (app: App, { global = false } = {}): void {
    if (global) {
      app.config.globalProperties.$vueAuth = this
    }
    app.provide(authClientInjectionKey, this._oauthClient)
  }

  get client (): OAuthClient {
    return this._oauthClient
  }

  get loggedIn (): ComputedRef<boolean> {
    return computed<boolean>(() => this._oauthClient.loggedIn)
  }

  get accessToken (): ComputedRef<string | undefined | null> {
    return computed<string | undefined | null>(() => this._oauthClient.accessToken)
  }

  get refreshToken (): ComputedRef<string | undefined | null> {
    return computed<string | undefined | null>(() => this._oauthClient.refreshToken)
  }

  get idToken (): ComputedRef<string | undefined | null> {
    return computed<string | undefined | null>(() => this._oauthClient.idToken)
  }

  get decodedIdToken (): ComputedRef<any> {
    return computed<Object>(() => this._oauthClient.decodedIdToken)
  }

  get expiryTime (): ComputedRef<Date | undefined | null> {
    return computed<Date | undefined | null>(() => this._oauthClient.expiryTime)
  }

  async initialize (): Promise<string | boolean> {
    return await this._oauthClient.initialize()
  }

  async authorize (): Promise<void> {
    return await this._oauthClient.authorize()
  }

  async userInfo (): Promise<any> {
    return await this._oauthClient.userInfo()
  }

  async logout (logoutHint?: string, local?: boolean): Promise<void> {
    return this._oauthClient.logout(logoutHint, local)
  }
}

/**
 * Create a new OAuthClient instance.
 * @param options - The OAuthClient options, see {@link OAuthClientOptions}.
 * @returns {@link OAuthClient} instance.
 * @example
 * ```typescript
 * import { createOAuthClient } from './login/VueAuthPlugin'
 * import { createApp } from 'vue'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 * const authClient = createOAuthClient({
 *   url: 'https://example.com',
 *   clientId: 'my-client-id',
 * })
 *
 * app.use(authClient, { global: true })
 * ```
 */
export function createOAuthClient (options: OAuthClientOptions): OAuthClientPlugin {
  return new OAuthClientPlugin(options)
}

/**
 * Use the composition API to get the OAuthClient instance.
 * @param options - The OAuthClient options, see {@link OAuthClientOptions}.
 * @returns {@link OAuthClient} instance.
 * @remarks This function must be called in the `setup` function of a component.
 * @throws if the OAuthClient is not installed.
 * @throws if the function is not called in the `setup` function.
 *
 * @example
 * ```html
 * <template>
 *  <button @click="authorize">Login</button>
 * </template>
 *
 * <script setup>
 *   import { useOAuthClient } from './login/VueAuthPlugin'
 *   const authClient = useOAuthClient()
 *   const authorize = () => authClient.authorize()
 * </script>
 * ```
 */
export function useOAuthClient (options?: OAuthClientOptions): OAuthClient {
  const client = inject(authClientInjectionKey)
  const instance = getCurrentInstance()
  if (instance == null) {
    throw new Error('useOAuthClient must be called in the setup function')
  }
  if (client == null) {
    throw new Error('OAuthClient is not installed')
  }
  if (options != null) {
    client.extend(options)
  }
  return client
}
