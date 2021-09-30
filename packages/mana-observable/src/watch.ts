import { Disposable } from 'mana-common';
import type { Reaction } from './core';
import { Tracker, getOrigin } from './tracker';

function watchAll<T>(target: T, callback: Reaction): Disposable {
  const data = getOrigin(target);
  const tracker = Tracker.getOrCreate(data);
  const props: string[] = Object.keys(data);
  if (props) {
    props.forEach(prop => Tracker.find(target, prop));
  }
  return tracker.add(callback);
}

function watchProp<T>(target: T, prop: Extract<keyof T, string>, callback: Reaction): Disposable {
  const data = getOrigin(target);
  const tracker = Tracker.find(data, prop);
  if (tracker) {
    return tracker.add(callback);
  }
  console.warn(`Cannot add watcher for unobservable property ${prop.toString()}`, target);
  return Disposable.NONE;
}

export function watch<T>(target: T, callback: Reaction): Disposable;
export function watch<T>(target: T, prop: Extract<keyof T, string>, callback: Reaction): Disposable;
export function watch<T>(
  target: T,
  prop: Extract<keyof T, string> | Reaction,
  callback?: Reaction,
): Disposable {
  let cb: Reaction;
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
