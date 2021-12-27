/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Disposable } from 'mana-common';
import type { Reactor } from './reactivity';
import { Reactable } from './reactivity';
import { InstanceValue, ObservableProperties, Observability } from './utils';
import { Notifier } from './notifier';

// redefine observable properties

export function defineProperty(target: any, property: string, defaultValue?: any) {
  let reactorListenDispose: Disposable;
  /**
   * notify reactor when property changed
   */
  const onChange = () => {
    Notifier.trigger(target, property);
  };
  /**
   * set observable property value and register onChange listener
   * @param value
   * @param reactor
   */
  const setValue = (value: any, reactor: Reactor | undefined) => {
    InstanceValue.set(target, property, value);
    if (reactor) {
      if (reactorListenDispose) {
        reactorListenDispose.dispose();
      }
      reactorListenDispose = reactor.onChange(() => {
        onChange();
      });
    }
  };
  const initialValue = target[property] === undefined ? defaultValue : target[property];
  setValue(...Reactable.transform(initialValue));
  // property getter
  const getter = function getter(this: any): void {
    const value = Reflect.getMetadata(property, target);
    return value;
  };
  // property setter
  const setter = function setter(this: any, value: any): void {
    const [tValue, reactor] = Reactable.transform(value);
    const oldValue = InstanceValue.get(target, property);
    setValue(tValue, reactor);
    if (value !== oldValue) {
      onChange();
    }
  };
  // define property
  if (Reflect.deleteProperty(target, property)) {
    Reflect.defineProperty(target, property, {
      configurable: true,
      enumerable: true,
      get: getter,
      set: setter,
    });
  }
  // mark observable property
  ObservableProperties.add(target, property);
  Observability.mark(target, property);
  Observability.mark(target);
}

export function observable<T extends Record<any, any>>(target: T): T {
  if (!Observability.trackable(target)) return target;
  const properties = ObservableProperties.find(target);
  if (!properties) {
    return target;
  }
  properties.forEach(property => defineProperty(target, property));
  return target;
}
