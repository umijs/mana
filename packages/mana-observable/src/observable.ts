/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Disposable } from 'mana-common';
import type { Reactor } from './reactivity';
import { Reactable } from './reactivity';
import {
  defineInstanceValue,
  getInstanceValue,
  setConstructorProperties,
  getObservableProperties,
  markObservable,
} from './utils';
import { Tracker } from './tracker';

export function observable(target: any): void {
  // get observable properties from constructor
  setConstructorProperties(target);
  const observableProperties = getObservableProperties(target);
  if (observableProperties && observableProperties.length > 0) {
    // redefine observable properties
    observableProperties.forEach(property => {
      let reactorListenDispose: Disposable;
      /**
       * notify reactor when property changed
       */
      const onChange = () => {
        Tracker.trigger(target, property);
      };
      /**
       * set observable property value and register onChange listener
       * @param value
       * @param reactor
       */
      const setValue = (value: any, reactor: Reactor | undefined) => {
        defineInstanceValue(target, property, value);
        if (reactor) {
          if (reactorListenDispose) {
            reactorListenDispose.dispose();
          }
          reactorListenDispose = reactor.onChange(onChange);
        }
      };
      setValue(...Reactable.transform(target[property]));
      // property getter
      const getter = function getter(this: any): void {
        const value = Reflect.getMetadata(property, target);
        return value;
      };
      // property setter
      const setter = function setter(this: any, value: any): void {
        const [tValue, reactor] = Reactable.transform(value);
        const oldValue = getInstanceValue(target, property);
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
      markObservable(target, property);
    });
  }
}
