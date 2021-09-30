/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Disposable } from './disposable';
import type { MaybePromise } from './types';

export type Event<T> = {
  /**
   *
   * @param listener The listener function will be call when the event happens.
   * @param context The 'this' which will be used when calling the event listener.
   * @return a disposable to remove the listener again.
   */
  (listener: (e: T) => any, context?: any): Disposable;
};

export namespace Event {
  export const None: Event<void> = () => Disposable.NONE;

  export function map<I, O>(event: Event<I>, mapFunc: (i: I) => O): Event<O> {
    return (listener: (e: O) => any, context?: any) =>
      event(i => listener.call(context, mapFunc(i)), undefined);
  }
}

type Callback = (...args: any[]) => any;
class CallbackList implements Iterable<Callback> {
  constructor(protected mono: boolean = false) {}
  private _callbacks: [Function, any][] | undefined;

  get callbacks() {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    return this._callbacks;
  }

  get length(): number {
    return this.callbacks.length;
  }

  public add(callback: Function, context: any = undefined): void {
    this.callbacks.push([callback, context]);
  }

  public remove(callback: Function, context: any = undefined): void {
    if (this.isEmpty()) return;
    let foundCallbackWithDifferentContext = false;
    for (let i = 0; i < this.length; i += 1) {
      if (this.callbacks[i][0] === callback) {
        if (this.callbacks[i][1] === context) {
          // remove when callback & context match
          this.callbacks.splice(i, 1);
          return;
        }
        foundCallbackWithDifferentContext = true;
      }
    }
    if (foundCallbackWithDifferentContext) {
      throw new Error('You should remove it with the same context you add it');
    }
  }

  public [Symbol.iterator]() {
    if (this.isEmpty()) {
      return [][Symbol.iterator]();
    }
    const callbacks = this.callbacks.slice(0);

    return callbacks
      .map(
        callback =>
          (...args: any[]) =>
            callback[0].apply(callback[1], args),
      )
      [Symbol.iterator]();
  }

  public invoke(...args: any[]): any[] {
    const ret: any[] = [];
    for (const callback of this) {
      try {
        ret.push(callback(...args));
      } catch (e) {
        console.error(e);
      }
    }
    return ret;
  }

  public isEmpty(): boolean {
    return this.callbacks.length === 0;
  }

  public dispose(): void {
    this._callbacks = undefined;
  }
}

export type EmitterOptions = {
  onFirstListenerAdd?: Function;
  onLastListenerRemove?: Function;
};

export class Emitter<T = any> {
  private static noop = (): void => {};
  protected _event?: Event<T>;
  protected _callbacks: CallbackList | undefined;
  public disposed = false;

  constructor(protected options: EmitterOptions = {}) {}

  get callbacks() {
    if (!this._callbacks) {
      this._callbacks = new CallbackList();
    }
    return this._callbacks;
  }

  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event(): Event<T> {
    if (!this._event) {
      this._event = (listener: (e: T) => any, thisArgs?: any) => {
        if (this.options.onFirstListenerAdd && this.callbacks.isEmpty()) {
          this.options.onFirstListenerAdd(this);
        }
        this.callbacks.add(listener, thisArgs);
        const result: Disposable = {
          dispose: () => {
            result.dispose = Emitter.noop;
            if (!this.disposed) {
              this.callbacks.remove(listener, thisArgs);
              result.dispose = Emitter.noop;
              if (this.options.onLastListenerRemove && this.callbacks!.isEmpty()) {
                this.options.onLastListenerRemove(this);
              }
            }
          },
        };
        return result;
      };
    }
    return this._event;
  }

  fire(event: T): any {
    if (!this._callbacks) {
      return;
    }
    this.callbacks.invoke(event);
  }

  /**
   * Process each listener one by one.
   * Return `false` to stop iterating over the listeners, `true` to continue.
   */
  async sequence(processor: (listener: (e: T) => any) => MaybePromise<boolean>): Promise<void> {
    for (const listener of this.callbacks) {
      // eslint-disable-next-line no-await-in-loop
      const result = await processor(listener);
      if (!result) {
        break;
      }
    }
  }

  dispose(): void {
    if (this._callbacks) {
      this._callbacks.dispose();
      this._callbacks = undefined;
    }
    this.disposed = true;
  }
}
