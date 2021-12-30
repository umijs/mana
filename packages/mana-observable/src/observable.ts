/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Reactor } from './reactivity';
import { Reactable } from './reactivity';
import { InstanceValue, ObservableProperties, Observability } from './utils';
import { Notifier } from './notifier';

//
export function listenReactor(
  reactor: Reactor,
  onChange: () => void,
  target: any,
  property?: string,
) {
  const toDispose = Observability.getDisposable(reactor, target, property);
  if (toDispose) {
    toDispose.dispose();
  }
  const disposable = reactor.onChange(() => {
    onChange();
  });
  Observability.setDisposable(reactor, disposable, target, property);
}

// redefine observable properties
export function defineProperty(target: any, property: string, defaultValue?: any) {
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
      listenReactor(reactor, onChange, target, property);
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
    if (Reactable.is(oldValue)) {
      const toDispose = Observability.getDisposable(
        Reactable.getReactor(oldValue),
        target,
        property,
      );
      if (toDispose) {
        toDispose.dispose();
      }
    }
    setValue(tValue, reactor);
    if (tValue !== oldValue) {
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
  const origin = Observability.getOrigin(target);
  if (!properties) {
    if (Reactable.canBeReactable(target)) {
      const exsit = Reactable.get(origin);
      if (exsit) {
        return exsit;
      }
      const onChange = () => {
        Notifier.trigger(origin);
      };
      const [reatableValue, reactor] = Reactable.transform(origin);
      if (reactor) {
        reactor.onChange(() => {
          onChange();
        });
      }
      Observability.mark(origin);
      return reatableValue;
    }
    return target;
  }
  properties.forEach(property => defineProperty(origin, property));
  return origin;
}
