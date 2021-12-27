import { Disposable } from 'mana-common';
import type { Notify } from './core';
import { Notifier } from './notifier';
import { getOrigin } from './tracker';

console.warn = () => {};

function watchAll<T>(target: T, callback: Notify): Disposable {
  const data = getOrigin(target);
  const tracker = Notifier.find(data);
  if (!tracker) {
    return Disposable.NONE;
  }
  const props: string[] = Object.keys(data);
  if (props) {
    props.forEach(prop => Notifier.find(target, prop));
  }
  return tracker.add(callback);
}

function watchProp<T>(target: T, prop: Extract<keyof T, string>, callback: Notify): Disposable {
  const data = getOrigin(target);
  const tracker = Notifier.find(data, prop);
  if (tracker) {
    return tracker.add(callback);
  }
  console.warn(`Cannot add watcher for unobservable property ${prop.toString()}`, target);
  return Disposable.NONE;
}

export function watch<T>(target: T, callback: Notify): Disposable;
export function watch<T>(target: T, prop: Extract<keyof T, string>, callback: Notify): Disposable;
export function watch<T>(
  target: T,
  prop: Extract<keyof T, string> | Notify,
  callback?: Notify,
): Disposable {
  let cb: Notify;
  if (typeof prop === 'function') {
    cb = prop;
    return watchAll(target, cb);
  }
  if (typeof prop === 'string' && callback) {
    cb = callback;
    return watchProp(target, prop, cb);
  }
  console.warn(`Invalid arguments for watch ${prop.toString()}`, target);
  return Disposable.NONE;
}
