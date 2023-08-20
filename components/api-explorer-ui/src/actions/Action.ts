/* global crypto */
import EventEmitter from './EventEmitter'

async function defaultActionFunction (): Promise<string> {
  const context = { resetLabelTimeout: 0 }
  let succeed: (value: string) => void, fail: (reason?: any) => void
  console.log('Action', { action: context }, 'has been activated with the default actionFunction!')
  const future = new Promise<string>((resolve, reject) => {
    succeed = resolve
    reject = fail
  })
  clearTimeout(context.resetLabelTimeout)
  context.resetLabelTimeout = setTimeout(() => {
    console.log('Timeout of default actionFunction triggered!')
    succeed('Timed out')
  }, 5000)
  return await (future)
}

type AsyncFunction<T> = (...args: any[]) => Promise<T>

export default class Action<T> extends EventEmitter<Action<T> | T> {
  id = crypto.randomUUID()
  icon = 'star'
  loadingIcon = null
  loading = false
  finished = false
  errored = false
  error?: Error
  startLabel = 'Action'
  loadingLabel = null
  finishedLabel = null
  errorLabel = 'Error'
  actionResult?: T
  actionFunction: (...args: any[]) => Promise<T>
  spiedLogs: string[][] = []
  resetLabelTimeout: number = 0
  description: string = ''

  constructor (actionFunction: AsyncFunction<T>) {
    super()
    this.actionFunction = actionFunction
  }

  static get example (): Action<string> {
    return new Action<string>(defaultActionFunction)
  }

  get inReadyState (): boolean {
    return !this.loading && !this.errored
  }

  get inStartState (): boolean {
    return !(this.loading || this.finished)
  }

  async activate (...params: any[]): Promise<T | undefined> {
    if (this.loading) {
      return this.actionResult
    }
    this.error = undefined
    this.errored = false
    this.loading = true
    this.emit('loading', this)
    this.emit('updated', this)
    const originalLogFn = console.log
    const spiedLogs: any[] = []
    console.log = function (...logArgs) {
      originalLogFn(...logArgs)
      spiedLogs.push(logArgs)
    }
    this.spiedLogs = spiedLogs
    const task = async (): Promise<T | undefined> => {
      let result
      try {
        result = await this.actionFunction(...params)
      } catch (ex) {
        const error = ex as Error
        this.errored = true
        this.error = error
        this.emit('error', this)
      }
      this.actionResult = result
      this.emit('result', result)
      setTimeout(() => {
        this.loading = false
        this.finished = true
        this.emit('updated', this)
      }, 25)
      console.log = originalLogFn
      return result
    }
    let work
    try {
      work = task()
    } catch (ex) {
      const error = ex as Error
      this.errored = true
      this.error = error
      this.emit('error', this)
    }
    return await work
  }

  reset (): void {
    this.actionResult = undefined
    this.finished = false
    this.errored = false
    this.error = undefined
    this.spiedLogs = []
    this.emit('result')
  }
}
