/* eslint-disable @typescript-eslint/no-explicit-any */

import { Tracker } from './tracker';
import { ObservableSymbol } from './core';

export function reactiveArray(obj: any[], targetInstance: any, property: any): void {
  return new Proxy(obj, {
    get(self: any, prop: string | symbol): any {
      if (prop === ObservableSymbol.ObjectSelf) {
        return self;
      }
      return Reflect.get(self, prop);
    },
    set(self: any, prop: string | symbol, value: any): any {
      const result = Reflect.set(self, prop, value);
      Tracker.trigger(targetInstance, property);
      return result;
    },
  });
}

export function reactivePlainObject(obj: any[], targetInstance: any, property: any): void {
  return new Proxy(obj, {
    get(self: any, prop: string | symbol): any {
      if (prop === ObservableSymbol.ObjectSelf) {
        return self;
      }
      return Reflect.get(self, prop);
    },
    set(self: any, prop: string | symbol, value: any): any {
      const result = Reflect.set(self, prop, value);
      Tracker.trigger(targetInstance, property);
      return result;
    },
    deleteProperty(self: any, prop: string | symbol): boolean {
      const result = Reflect.deleteProperty(self, prop);
      Tracker.trigger(targetInstance, property);
      return result;
    },
  });
}

export function reactiveMap(obj: Map<any, any>, targetInstance: any, property: any): void {
  return new Proxy(obj, {
    get(self: any, prop: string | symbol): any {
      if (prop === ObservableSymbol.ObjectSelf) {
        return self;
      }
      if (prop === 'set') {
        return (...args: any) => {
          (self as Map<any, any>).set.apply(self, args);
          Tracker.trigger(targetInstance, property);
        };
      }
      if (prop === 'delete') {
        return (...args: any) => {
          (self as Map<any, any>).delete.apply(self, args);
          Tracker.trigger(targetInstance, property);
        };
      }
      if (prop === 'clear') {
        return (...args: any) => {
          (self as Map<any, any>).clear.apply(self, args);
          Tracker.trigger(targetInstance, property);
        };
      }
      const result = Reflect.get(self, prop);
      if (typeof result === 'function') {
        return result.bind(self);
      }
      return result;
    },
  });
}
