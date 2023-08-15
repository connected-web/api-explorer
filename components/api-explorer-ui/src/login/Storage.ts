import * as CryptoJS from 'crypto-js'

export abstract class Storage {
  protected baseKey: string

  /**
   * Creates a new storage instance.
   * @param baseKey - The base key for storage.
   */
  constructor (baseKey = '') {
    this.baseKey = baseKey
  }

  /**
   * Get a key from storage
   * @param name          the key of the stored value
   * @param defaultValue  an optional default value to return if the key is not found
   * @returns the stored value, or defaultValue if not set
   */
  public abstract get (name: string, defaultValue?: string): string | null | undefined

  /**
   * Remove a key from storage
   * @param name  the key to remove
   */
  public abstract delete (name: string): void

  /**
   * Clear all values set in storage
   */
  public abstract clear (): void

  /**
   * Store a key value pair
   * @param name   the key
   * @param value  the value to store
   */
  public abstract set (name: string, value: unknown): void

  /**
   * Determines if the current browser supports this storage type.
   * @returns true if the storage type is supported.
   */
  public static supported (): boolean {
    return true
  }

  /**
   * Returns true if the storage has a value for the given key.
   * @param name - The storage key.
   * @returns true if the storage has a value for the given key.
   */
  public has (name: string): boolean {
    const value = this.get(name)
    return value !== null && value !== undefined
  }

  /**
   * Returns a scoped key for storage.
   * @param key - The storage key.
   * @returns the scoped key for storage.
   */
  protected key (key = ''): string {
    if (this.baseKey !== '' && !key.includes(this.baseKey)) {
      return `${this.baseKey}.${key}`
    }

    return key
  }

  /**
   * Get and decrypt an encrypted value from local storage.
   * @param key - The storage key
   * @param defaultValue - The default value to return if the key is not found
   * @returns the decrypted value from local storage
   * @throws if the local storage is not supported.
   * @example
   * ```typescript
   * const storage = new LocalStorage('oauth')
   * storage.setEncrypted('test', 'value')
   * expect(storage.getEncrypted('test')).toBe('value')
   * ```
   */
  public getEncrypted (key: string, defaultValue?: string): string | null {
    const value = this.get(key, defaultValue)
    return value !== '' ? this.decrypt(value ?? '') : null
  }

  /**
   * Set an encrypted value in local storage.
   * @param key - The storage key.
   * @param value - The value to encrypt and store.
   * @throws if the local storage is not supported.
   * @example
   * ```typescript
   * const storage = new LocalStorage('oauth')
   * storage.setEncrypted('test', 'value')
   * expect(storage.getEncrypted('test')).toBe('value')
   * ```
   */
  public setEncrypted (key: string, value?: string | null): void {
    value = value !== '' ? this.encrypt(value ?? '') : value
    this.set(key, value)
  }

  /**
   * Get the passphrase used to encrypt and decrypt data
   */
  private get aesKey (): string {
    return typeof window !== 'undefined' ? window.location.origin : 'employee.identity.netacea.cloud'
  }

  /**
   * Encrypt a utf8 text value using a locally specified AES key
   * @param txt
   * @returns the encrypted text
   */
  private encrypt (txt: string): string {
    return CryptoJS.AES.encrypt(txt, this.aesKey).toString()
  }

  /**
   * Decrypt a utf8 text value using a locally specified AES key
   * @param txtToDecrypt
   * @returns
   */
  private decrypt (txtToDecrypt: string): string {
    return CryptoJS.AES.decrypt(txtToDecrypt, this.aesKey).toString(CryptoJS.enc.Utf8)
  }
}
