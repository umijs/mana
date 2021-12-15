/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { Tracker } from './tracker';
import { ObservableSymbol } from './core';
import { reactiveArray, reactiveMap, reactivePlainObject } from './reactive';
import type { DesignType } from './utils';
import { setConstructorProperties } from './utils';
import { isPlainObject } from 'mana-common';
import {
  markObservable,
  getObservableProperties,
  getDesignType,
  setObservableProperty,
} from './utils';

type propDecorator = (target: Record<string, any>, propertyKey: string) => void;

export const dataTrans = (
  target: any,
  propertyKey: string,
  propertyType: DesignType,
  value: any,
) => {
  if (value === undefined) return value;
  if (!value) return value;
  if (propertyType === Array && !value[ObservableSymbol.ObjectSelf]) {
    return reactiveArray(value, target, propertyKey);
  }
  if (propertyType === Map && !value[ObservableSymbol.ObjectSelf]) {
    return reactiveMap(value, target, propertyKey);
  }
  if (propertyType === Object && !value[ObservableSymbol.ObjectSelf] && isPlainObject(value)) {
    return reactivePlainObject(value, target, propertyKey);
  }
  return value;
};

export function observable(target: any): void {
  setConstructorProperties(target);
  const trackableProperties = getObservableProperties(target);
  if (trackableProperties && trackableProperties.length > 0) {
    trackableProperties.forEach(propertyKey => {
      const propertyType = getDesignType(target, propertyKey);
      const initialValue = dataTrans(target, propertyKey, propertyType, target[propertyKey]);
      Reflect.defineMetadata(propertyKey, initialValue, target);
      // property getter
      const getter = function getter(this: any): void {
        const value = Reflect.getMetadata(propertyKey, target);
        return value;
      };
      // property setter
      const setter = function setter(this: any, val: any): void {
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
    markObservable(target);
  }
}
/**
 * Define observable property
 */
export function prop(): propDecorator {
  return (target: Record<string, any>, propertyKey: string) => {
    markObservable(target, propertyKey);
    setObservableProperty(target, propertyKey);
  };
}
