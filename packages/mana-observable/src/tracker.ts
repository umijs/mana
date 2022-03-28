import type { Disposable } from 'mana-common';
import { isPlainObject } from 'mana-common';
import { getPropertyDescriptor } from 'mana-common';
import { observable } from '.';
import { ObservableSymbol } from './core';
import { Notifier } from './notifier';
import { Reactable } from './reactivity';
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
    Reflect.defineMetadata(act, proxy, target, ObservableSymbol.Tracker);
  }
  export function get<T = any>(target: T, act: Act): (T & Trackable) | undefined {
    return Reflect.getMetadata(act, target, ObservableSymbol.Tracker);
  }
  export function has<T = any>(target: T, act: Act) {
    return Reflect.hasOwnMetadata(act, target, ObservableSymbol.Tracker);
  }

  function handleNotifier<T extends Record<string, any>>(
    notifier: Notifier,
    act: Act,
    obj: T,
    property?: string,
  ) {
    const lastToDispose: Disposable = Observability.getDisposable(act, obj, property);
    if (lastToDispose) {
      lastToDispose.dispose();
    }
    const toDispose = notifier.once(() => {
      if (property) {
        act({
          key: property as keyof T,
          value: obj[property],
        });
      } else {
        act(obj);
      }
    });
    Observability.setDisposable(act, toDispose, obj, property);
  }

  export function tramsform(toTrack: any, act: Act) {
    if (toTrack instanceof Array) {
      return transformArray(toTrack, act);
    }
    if (toTrack instanceof Map) {
      return transformMap(toTrack, act);
    }
    if (isPlainObject(toTrack)) {
      return transformPlainObject(toTrack, act);
    }
    return toTrack;
  }
  export function transformArray(toTrack: any[], act: Act) {
    return new Proxy(toTrack, {
      get(target: any, property: string | symbol): any {
        const value = target[property];
        if (property === ObservableSymbol.Self) {
          return value;
        }
        if (Observability.trackable(value)) {
          return track(value, act);
        }
        return value;
      },
    });
  }

  export function transformPlainObject(toTrack: any, act: Act) {
    return new Proxy(toTrack, {
      get(target: any, property: string | symbol): any {
        const value = target[property];
        if (property === ObservableSymbol.Self) {
          return value;
        }
        if (Observability.trackable(value)) {
          return track(value, act);
        }
        return value;
      },
    });
  }

  export function transformMap(toTrack: Map<any, any>, act: Act) {
    return new Proxy(toTrack, {
      get(target: any, property: string | symbol): any {
        const value = target[property];
        if (property === ObservableSymbol.Self) {
          return value;
        }
        if (property === 'get' && typeof value === 'function') {
          return function (...args: any[]) {
            const innerValue = value.apply(target, args);
            if (Observability.trackable(innerValue)) {
              return track(innerValue, act);
            }
            return innerValue;
          };
        }
        return value;
      },
    });
  }

  export function setReactableNotifier(origin: any, act: Act) {
    const notifier = Notifier.getOrCreate(origin);
    handleNotifier(notifier, act, origin);
  }

  export function toInstanceTracker<T extends Record<any, any>>(
    exist: T | undefined,
    origin: T,
    act: Act,
    deep: boolean = true,
  ) {
    if (exist) return exist;
    // try make observable
    if (!Observability.is(origin)) {
      observable(origin);
    }
    const proxy = new Proxy(origin, {
      get(target: any, property: string | symbol): any {
        if (property === ObservableSymbol.Tracker) {
          return target;
        }
        if (property === ObservableSymbol.Self) {
          return target;
        }
        let notifier;
        if (typeof property === 'string') {
          if (Observability.notifiable(target, property)) {
            notifier = Notifier.getOrCreate(target, property);
            handleNotifier(notifier, act, target, property);
          }
        }
        const value = getValue(target, property, proxy, notifier);
        if (Reactable.is(value)) {
          return tramsform(value, act);
        }
        if (Observability.trackable(value)) {
          if (Reactable.canBeReactable(value)) {
            return track(value, act, false);
          }
          return track(value, act, deep);
        }
        return value;
      },
    });
    set(origin, act, proxy);
    return proxy;
  }
  export function toReactableTracker<T extends Record<any, any>>(
    exist: T | undefined,
    origin: T,
    object: T,
    act: Act,
    deep: boolean,
  ) {
    let maybeReactable = object;
    if (deep) {
      // try make reactable
      if (!Observability.is(origin)) {
        maybeReactable = observable(origin);
      }
    }
    maybeReactable = Reactable.get(origin) ?? object;
    // set reactable listener
    if (Reactable.is(maybeReactable)) {
      setReactableNotifier(origin, act);
    }
    if (exist) return exist;
    if (!deep) return object;
    const proxy = tramsform(maybeReactable, act);
    set(origin, act, proxy);
    return proxy;
  }

  export function track<T extends Record<any, any>>(object: T, act: Act, deep: boolean = true): T {
    if (!Observability.trackable(object)) {
      return object;
    }
    // get origin
    let origin = object;
    if (Trackable.is(object)) {
      origin = Trackable.getOrigin(object);
    }
    origin = Observability.getOrigin(origin);
    let exist: T | undefined = undefined;
    // already has tracker
    if (has(origin, act)) {
      exist = get(origin, act);
    }
    // get exist reactble
    if (Reactable.canBeReactable(origin)) {
      return toReactableTracker(exist, origin, object, act, deep);
    } else {
      return toInstanceTracker(exist, origin, act, deep);
    }
  }
}
