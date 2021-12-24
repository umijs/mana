/* eslint-disable prefer-spread */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Emitter, isPlainObject } from 'mana-common';
import { ObservableSymbol } from './core';

/**
 * Reactor is bound to an reacable object, such as array/map/object.
 * Reactor helpers the reacable object to server multiple observable objects.
 * It will trigger when the reacable object is changed.
 */
export class Reactor {
  protected changedEmitter: Emitter<any>;
  protected readonly _value: any;
  constructor(val: any) {
    this.changedEmitter = new Emitter();
    this._value = val;
  }
  get onChange() {
    return this.changedEmitter.event;
  }
  get value() {
    return this._value;
  }
  notify(value: any) {
    this.changedEmitter.fire(value);
  }
}

export interface Reactable {
  [ObservableSymbol.Reactor]: Reactor;
}

export namespace Reactable {
  export function is(target: any): target is Reactable {
    return !!target && typeof target === 'object' && (target as any)[ObservableSymbol.Reactor];
  }
  export function get(target: Reactable): Reactor {
    return target[ObservableSymbol.Reactor];
  }
  export function transform(value: any): [any, Reactor | undefined] {
    let reactor: Reactor | undefined = undefined;
    if (!value) return [value, undefined];
    if (is(value)) {
      reactor = get(value);
      return [value, reactor];
    }
    if (value instanceof Array) {
      const v = transformArray(value);
      return [v, get(v)];
    }
    if (value instanceof Map) {
      const v = transformMap(value);
      return [v, get(v)];
    }
    if (isPlainObject(value)) {
      const v = transformPlainObject(value);
      return [v, get(v)];
    }
    return [value, undefined];
  }

  export function transformArray(toReactable: any[]) {
    const reactor = new Reactor(toReactable);
    return new Proxy(toReactable, {
      get(self: any, prop: string | symbol): any {
        if (prop === ObservableSymbol.Reactor) {
          return reactor;
        }
        const result = Reflect.get(self, prop);
        return result;
      },
      set(self: any, prop: string | symbol, value: any): any {
        const result = Reflect.set(self, prop, value);
        reactor.notify(value);
        return result;
      },
    });
  }

  export function transformPlainObject(toReactable: any) {
    const reactor = new Reactor(toReactable);
    return new Proxy(toReactable, {
      get(self: any, prop: string | symbol): any {
        if (prop === ObservableSymbol.Reactor) {
          return reactor;
        }
        const result = Reflect.get(self, prop);
        return result;
      },
      set(self: any, prop: string | symbol, value: any): any {
        const result = Reflect.set(self, prop, value);
        reactor.notify(value);
        return result;
      },
      deleteProperty(self: any, prop: string | symbol): boolean {
        const result = Reflect.deleteProperty(self, prop);
        reactor.notify(undefined);
        return result;
      },
    });
  }

  export function transformMap(toReactable: Map<any, any>) {
    const reactor = new Reactor(toReactable);
    return new Proxy(toReactable, {
      get(self: any, prop: string | symbol): any {
        if (prop === ObservableSymbol.Reactor) {
          return reactor;
        }
        switch (prop) {
          case 'set':
            return (...args: any) => {
              const result = self.set.apply(self, args);
              reactor.notify(undefined);
              return result;
            };
          case 'delete':
            return (...args: any) => {
              const result = self.delete.apply(self, args);
              reactor.notify(undefined);
              return result;
            };
          case 'clear':
            return (...args: any) => {
              const result = (self as Map<any, any>).clear.apply(self, args);
              reactor.notify(undefined);
              return result;
            };
          default:
            const result = Reflect.get(self, prop);
            if (typeof result === 'function') {
              return result.bind(self);
            }
            return result;
        }
      },
    });
  }
}

export interface ReactiveHandler {
  onChange?: (value: any) => any;
}
