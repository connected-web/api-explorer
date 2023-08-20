/* global CustomEvent */

type Listener = EventListenerOrEventListenerObject

export default class EventEmitter<T> {
  target:EventTarget

  constructor () {
    this.target = new EventTarget()
  }

  on (eventName:string, listener:Listener) {
    return this.target.addEventListener(eventName, listener)
  }

  once (eventName:string, listener:Listener) {
    return this.target.addEventListener(eventName, listener, { once: true })
  }

  off (eventName:string, listener:Listener) {
    return this.target.removeEventListener(eventName, listener)
  }

  emit (eventName:string, detail?:T) {
    return this.target.dispatchEvent(
      new CustomEvent(eventName, { detail, cancelable: true })
    )
  }
}