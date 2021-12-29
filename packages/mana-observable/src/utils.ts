import 'reflect-metadata';
import type { Disposable } from 'mana-common';
import { ObservableSymbol } from './core';

interface Original {
  [ObservableSymbol.Self]: any;
}

export namespace Observability {
  export function trackable(obj: any): boolean {
    return !!obj && typeof obj === 'object';
  }
  export function notifiable(obj: any, property: string | symbol): boolean {
    return is(obj, property);
  }
  export function is(obj: any, property?: string | symbol): boolean {
    if (!trackable(obj)) return false;
    const origin = getOrigin(obj);
    if (property) {
      return Reflect.hasMetadata(ObservableSymbol.Observable, origin, property);
    }
    return Reflect.hasMetadata(ObservableSymbol.Observable, origin);
  }
  export function mark(obj: Record<any, any>, property?: string | symbol) {
    if (property) {
      Reflect.defineMetadata(ObservableSymbol.Observable, true, obj, property);
    } else {
      Reflect.defineMetadata(ObservableSymbol.Observable, true, obj);
    }
  }

  function isOriginal(data: any): data is Original {
    return Observability.trackable(data) && data[ObservableSymbol.Self];
  }

  export function getOrigin<T = any>(obj: T): T {
    if (!isOriginal(obj)) return obj;
    return obj[ObservableSymbol.Self];
  }
  export function equals(a: any, b: any) {
    return getOrigin(a) === getOrigin(b);
  }

  export function getDisposable(metaKey: any, obj: Record<string, any>, property?: string) {
    if (property) {
      return Reflect.getOwnMetadata(metaKey, obj, property);
    }
    return Reflect.getOwnMetadata(metaKey, obj);
  }

  export function setDisposable(
    metaKey: any,
    disposable: Disposable,
    obj: Record<string, any>,
    property?: string,
  ) {
    if (property) {
      Reflect.defineMetadata(metaKey, disposable, obj, property);
    }
    Reflect.defineMetadata(metaKey, disposable, obj);
  }
}

export namespace ObservableProperties {
  export function getOwn(obj: Record<string, any>): string[] | undefined {
    return Reflect.getOwnMetadata(ObservableSymbol.ObservableProperties, obj);
  }
  export function get(obj: Record<string, any>): string[] | undefined {
    return Reflect.getMetadata(ObservableSymbol.ObservableProperties, obj);
  }
  export function find(obj: Record<string, any>): string[] | undefined {
    if (obj && obj.constructor) {
      return get(obj.constructor);
    }
    return undefined;
  }

  export function add(obj: Record<any, any>, property: string): void {
    const exisringProperties = getOwn(obj);
    if (exisringProperties) {
      exisringProperties.push(property);
    } else {
      const protoProperties = get(obj) || [];
      Reflect.defineMetadata(
        ObservableSymbol.ObservableProperties,
        [...protoProperties, property],
        obj,
      );
    }
  }
}

export namespace InstanceValue {
  export function set(target: any, property: string, value: any) {
    Reflect.defineMetadata(property, value, target);
  }
  export function get(target: any, property: string) {
    return Reflect.getMetadata(property, target);
  }
}

/**
 * get design type of property
 * @param obj
 * @param propertyKey
 * @returns number → Number
 * @returns string → String
 * @returns boolean → Boolean
 * @returns any → Object
 * @returns void → undefined
 * @returns Array → Array
 * @returns Tuple → Array
 * @returns class → constructor
 * @returns Enum → Number
 * @returns ()=>{} → Function
 * @returns others(interface ...) → Object
 */
export function getDesignType(obj: Record<string, any>, propertyKey: string): DesignType {
  return Reflect.getMetadata('design:type', obj, propertyKey);
}

export type DesignType =
  | undefined
  | typeof Function
  | typeof String
  | typeof Boolean
  | typeof Number
  | typeof Array
  | typeof Map
  | typeof Object;

export const getOrigin = Observability.getOrigin;
export const equals = Observability.equals;
