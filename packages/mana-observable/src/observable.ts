/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Tracker } from './tracker';
import { ReactiveSymbol, logger } from './core';
import { reactiveArray, reactiveMap, reactivePlainObject } from './reactive';

const log = logger.extend('observable');

type propDecorator = (target: Record<string, any>, propertyKey: string) => void;

export function isPlainObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export const dataTrans = (target: any, propertyKey: string, propertyType: any, value: any) => {
  if (value === undefined) return value;
  if (!value) return value;
  if (propertyType === Array && !value[ReactiveSymbol.ObjectSelf]) {
    return reactiveArray(value, target, propertyKey);
  }
  if (propertyType === Map && !value[ReactiveSymbol.ObjectSelf]) {
    return reactiveMap(value, target, propertyKey);
  }
  if (propertyType === Object && !value[ReactiveSymbol.ObjectSelf] && isPlainObject(value)) {
    return reactivePlainObject(value, target, propertyKey);
  }
  return value;
};

export function observable(target: any): void {
  const trackableProperties: string[] | undefined = Reflect.getMetadata(
    ReactiveSymbol.TrackableProperties,
    target,
  );
  if (
    // TODO: Avoid redefinition
    trackableProperties &&
    trackableProperties.length > 0
  ) {
    trackableProperties.forEach(propertyKey => {
      const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
      const initialValue = dataTrans(target, propertyKey, propertyType, target[propertyKey]);
      Reflect.defineMetadata(propertyKey, initialValue, target);
      // property getter
      const getter = function getter(this: any): void {
        const value = Reflect.getMetadata(propertyKey, target);
        return value;
      };
      // property setter
      const setter = function setter(this: any, val: any): void {
        log('setter', target, propertyKey, val);
        const value = dataTrans(target, propertyKey, propertyType, val);
        const oldValue = Reflect.getMetadata(propertyKey, target);
        Reflect.defineMetadata(propertyKey, value, target);
        if (value !== oldValue) {
          Tracker.trigger(target, propertyKey);
        }
      };
      // redefine property
      if (Reflect.deleteProperty(target, propertyKey)) {
        Reflect.defineProperty(target, propertyKey, {
          configurable: true,
          enumerable: true,
          get: getter,
          set: setter,
        });
      }
    });
    Reflect.defineMetadata(ReactiveSymbol.Tracked, true, target);
  }
}

export function prop(): propDecorator {
  return (target: Record<string, any>, propertyKey: string) => {
    // number → Number
    // string → String
    // boolean → Boolean
    // any → Object
    // void → undefined
    // Array → Array
    // Tuple → Array
    // class → constructor
    // Enum → Number
    // ()=>{} → Function
    // others(interface ...) → Object
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
    log('define', target, propertyKey, propertyType);

    // Mark properties on prototypes as traceable properties
    Reflect.defineMetadata(ReactiveSymbol.TrackableProperty, true, target, propertyKey);
    if (!Reflect.hasOwnMetadata(ReactiveSymbol.TrackableProperties, target)) {
      let initailProperties = [];
      if (Reflect.hasMetadata(ReactiveSymbol.TrackableProperties, target)) {
        initailProperties = Reflect.getMetadata(ReactiveSymbol.TrackableProperties, target);
      }
      Reflect.defineMetadata(
        ReactiveSymbol.TrackableProperties,
        [...initailProperties, propertyKey],
        target,
      );
    } else {
      const trackableProperties: string[] = Reflect.getOwnMetadata(
        ReactiveSymbol.TrackableProperties,
        target,
      );
      trackableProperties.push(propertyKey);
    }
  };
}
