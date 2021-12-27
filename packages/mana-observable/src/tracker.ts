import type { Disposable } from 'mana-common';
import { getPropertyDescriptor } from 'mana-common';
import { observable } from '.';
import { ObservableSymbol } from './core';
import { Notifier } from './notifier';
import { Observability } from './utils';

type Act = (...args: any) => void;

function getValue<T extends Record<any, any>>(
  obj: T,
  property: string | symbol,
  proxy: T,
  notifier?: Notifier,
) {
  if (!notifier) {
    const descriptor = getPropertyDescriptor(obj, property);
    if (descriptor?.get) {
      return descriptor.get.call(proxy);
    }
  }
  return obj[property as any];
}

export type Trackable = {
  [ObservableSymbol.Tracker]: Record<string, any>;
};

export namespace Trackable {
  export function is(target: any): target is Trackable {
    return Observability.trackable(target) && (target as any)[ObservableSymbol.Tracker];
  }
  export function getOrigin(target: Trackable): any {
    return target[ObservableSymbol.Tracker];
  }
  export function tryGetOrigin(target: any): any {
    if (!is(target)) {
      return target;
    }
    return getOrigin(target);
  }
}
export namespace Tracker {
  export function set<T = any>(target: T, act: Act, proxy: T) {
    Reflect.defineMetadata(act, proxy, target);
  }
  export function get<T = any>(target: T, act: Act) {
    return Reflect.getMetadata(act, target);
  }
  export function has<T = any>(target: T, act: Act) {
    return Reflect.hasOwnMetadata(act, target);
  }

  function handleNotifier<T extends Record<string, any>>(
    obj: T,
    property: string,
    notifier: Notifier,
    act: Act,
  ) {
    if (notifier && typeof property === 'string') {
      const reactionDispose: Disposable = Reflect.getOwnMetadata(act, obj, property);
      if (reactionDispose) {
        reactionDispose.dispose();
      }
      if (notifier) {
        const toDispose = notifier.once(() => {
          act({
            key: property as keyof T,
            value: obj[property],
          });
        });
        Reflect.defineMetadata(act, toDispose, obj, property);
      }
    }
  }

  export function track<T extends Record<any, any>>(object: T, act: Act): T {
    if (!Observability.trackable(object)) {
      return object;
    }
    let origin = object;
    if (Trackable.is(object)) {
      origin = Trackable.getOrigin(object);
    }
    if (has(origin, act)) {
      return get(origin, act);
    }
    if (!Observability.is(origin)) {
      observable(origin);
    }
    const proxy = new Proxy(origin, {
      get(target: any, property: string | symbol): any {
        if (property === ObservableSymbol.Tracker) {
          return target;
        }
        let notifier;
        if (typeof property === 'string') {
          if (Observability.notifiable(target, property)) {
            notifier = Notifier.getOrCreate(target, property);
            handleNotifier(target, property, notifier, act);
          }
        }
        const value = getValue(target, property, proxy, notifier);
        if (Observability.trackable(value)) {
          return track(value, act);
        }
        return value;
      },
    });
    set(object, act, proxy);
    return proxy;
  }
}

export const getOrigin = Trackable.tryGetOrigin;
