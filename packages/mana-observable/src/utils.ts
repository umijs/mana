import 'reflect-metadata';
import { ObservableSymbol } from './core';

export namespace Observable {
  export function tarckable(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) return false;
    return true;
  }
  export function is(obj: any, property: string | symbol): boolean {
    if (!tarckable(obj)) return false;
    return Reflect.hasMetadata(ObservableSymbol.Observable, obj, property);
  }
  export function mark(obj: Record<any, any>, property: string | symbol) {
    Reflect.defineMetadata(ObservableSymbol.Observable, true, obj, property);
  }
}

export namespace ObservableProperties {
  export function getOwn(obj: Record<string, any>): string[] | undefined {
    return Reflect.getOwnMetadata(ObservableSymbol.ObservableProperties, obj);
  }
  export function get(obj: Record<string, any>): string[] | undefined {
    return Reflect.getMetadata(ObservableSymbol.ObservableProperties, obj);
  }

  export function add(newable: Record<any, any>, propertyKey: string): void {
    const exisringProperties = getOwn(newable);
    if (exisringProperties) {
      exisringProperties.push(propertyKey);
    } else {
      const protoProperties = get(newable) || [];
      Reflect.defineMetadata(
        ObservableSymbol.ObservableProperties,
        [...protoProperties, propertyKey],
        newable,
      );
    }
  }
  export function setInstance(obj: Record<string, any>): void {
    if (obj.constructor) {
      const exisringProperties = get(obj.constructor);
      if (exisringProperties) {
        Reflect.defineMetadata(ObservableSymbol.ObservableProperties, [...exisringProperties], obj);
      }
    }
  }
}

export namespace InstanceValue {
  export function set(target: any, propertyKey: string, value: any) {
    Reflect.defineMetadata(propertyKey, value, target);
  }
  export function get(target: any, propertyKey: string) {
    Reflect.getMetadata(propertyKey, target);
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
