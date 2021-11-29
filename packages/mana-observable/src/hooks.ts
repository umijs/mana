/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { ObservableContext } from './context';
import { ObservableSymbol } from './core';
import type { Observable } from './core';
import { getOrigin, Tracker } from './tracker';
import type { Disposable } from 'mana-common';
import { getPropertyDescriptor } from 'mana-common';

function reactiveObject<T extends Record<string, any>>(
  object: T,
  dispatch: React.Dispatch<Action<T>>,
): T {
  const obj = getOrigin(object);
  const proxy = new Proxy(obj, {
    get(target: any, property: string | symbol): any {
      if (property === ObservableSymbol.ObjectSelf) {
        return obj;
      }
      const tracker = Tracker.find(obj, property);
      if (tracker && typeof property === 'string') {
        const reactionDispose: Disposable = Reflect.getMetadata(property, dispatch);
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
      const descriptor = getPropertyDescriptor(obj, property);
      let value;
      if (descriptor?.get) {
        value = descriptor.get.call(proxy);
      } else {
        value = target[property];
      }
      if (typeof value === 'function') {
        return value.bind(obj);
      }
      return value;
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

export function useObserve<T extends Record<string, any>>(obj: T): T {
  const [, dispatch] = React.useReducer<(prevState: Partial<T>, action: Action<T>) => Partial<T>>(
    reducer,
    {},
  );
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
