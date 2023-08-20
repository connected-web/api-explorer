/* global CustomEvent */

type Listener = EventListenerOrEventListenerObject

export default class EventEmitter<T> {
  target: EventTarget

  constructor () {
    this.target = new EventTarget()
  }

  on (eventName: string, listener: Listener): EventEmitter<T> {
    this.target.addEventListener(eventName, listener)
    return this
  }

  once (eventName: string, listener: Listener): EventEmitter<T> {
    this.target.addEventListener(eventName, listener, { once: true })
    return this
  }

  off (eventName: string, listener: Listener): EventEmitter<T> {
    this.target.removeEventListener(eventName, listener)
    return this
  }

  emit (eventName: string, detail?: T): boolean {
    return this.target.dispatchEvent(
      new CustomEvent(eventName, { detail, cancelable: true })
    )
  }
}
