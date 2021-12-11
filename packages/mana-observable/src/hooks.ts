/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { ObservableContext } from './context';
import { ObservableSymbol } from './core';
import type { Observable } from './core';
import { getOrigin, Tracker } from './tracker';
import type { Disposable } from 'mana-common';
import { getPropertyDescriptor } from 'mana-common';
import { isObservable } from './utils';

function handleTracker<T extends Record<string, any>>(
  obj: T,
  property: string,
  tracker: Tracker,
  dispatch: React.Dispatch<Action<any>>,
) {
  if (tracker && typeof property === 'string') {
    const reactionDispose: Disposable = Reflect.getOwnMetadata(property, dispatch);
    if (reactionDispose) {
      reactionDispose.dispose();
    }
    if (tracker) {
      const toDispose = tracker.once(() => {
        dispatch({
          key: property as keyof T,
          value: obj[property],
        });
      });
      Reflect.defineMetadata(property, toDispose, dispatch);
    }
  }
}

function getValue<T extends Record<any, any>>(
  obj: T,
  property: string | symbol,
  proxy: T,
  tracker?: Tracker,
) {
  if (!tracker) {
    const descriptor = getPropertyDescriptor(obj, property);
    if (descriptor?.get) {
      return descriptor.get.call(proxy);
    }
  }
  return obj[property as any];
}

function handleValue<T extends Record<string, any>>(
  value: any,
  obj: T,
  dispatch: React.Dispatch<Action<any>>,
) {
  if (typeof value === 'function') {
    return value.bind(obj);
  }
  if (typeof value === 'object') {
    if (isObservable(value)) {
      return reactiveObject(value, dispatch);
    }
  }
  return value;
}

function reactiveObject<T extends Record<string, any>>(
  object: T,
  dispatch: React.Dispatch<Action<T>>,
): T {
  const obj = getOrigin(object);
  const proxy = new Proxy(obj, {
    get(target: any, property: string | symbol): any {
      if (property === ObservableSymbol.ObjectSelf) {
        return target;
      }
      const tracker = Tracker.find(target, property);
      if (tracker && typeof property === 'string') {
        handleTracker(target, property, tracker, dispatch);
      }
      const value = getValue(target, property, proxy, tracker);
      return handleValue(value, target, dispatch);
    },
  });
  return proxy;
}

interface Action<T> {
  key: keyof T;
  value: any;
}
const reducer = <T>(state: Partial<T>, part: Action<T>) => {
  return { ...state, [part.key]: part.value };
};

export function useObserve<T>(obj: T): T {
  const [, dispatch] = React.useReducer<(prevState: Partial<T>, action: Action<T>) => Partial<T>>(
    reducer,
    {},
  );
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (!Reflect.hasMetadata(dispatch, obj)) {
    const proxy = reactiveObject(obj, dispatch);
    Reflect.defineMetadata(dispatch, proxy, obj);
  }
  return Reflect.getMetadata(dispatch, obj);
}

/**
 * @deprecated use useObserve instead
 */
export const useTrack = useObserve;

export function useInject<T>(identifier: Observable.Token<T>): T {
  const { getContainer } = React.useContext(ObservableContext);
  const obj = React.useMemo<T>(() => {
    const container = getContainer();
    if (!container) {
      throw new Error('Can not find container in context, please check the context settings.');
    }
    return container.get<T>(identifier);
  }, [getContainer, identifier]);
  return useObserve(obj);
}
