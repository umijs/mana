/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Tracker } from './tracker';

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
  return Tracker.track(obj, dispatch);
}
