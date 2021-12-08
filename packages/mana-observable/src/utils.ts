import { ObservableSymbol } from './core';

export function isObservable(obj: Record<string, any>, property?: string | symbol): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!property) {
    return Reflect.hasMetadata(ObservableSymbol.Observable, obj);
  }
  return Reflect.hasMetadata(ObservableSymbol.Observable, obj, property);
}

export function markObservable(obj: Record<string, any>, property?: string | symbol) {
  if (property === undefined) {
    Reflect.defineMetadata(ObservableSymbol.Observable, true, obj);
  } else {
    Reflect.defineMetadata(ObservableSymbol.Observable, true, obj, property);
  }
}

export function getOwnObservableProperties(obj: Record<string, any>): string[] | undefined {
  return Reflect.getOwnMetadata(ObservableSymbol.ObservableProperties, obj);
}
export function getObservableProperties(obj: Record<string, any>): string[] | undefined {
  return Reflect.getMetadata(ObservableSymbol.ObservableProperties, obj);
}

export function setObservableProperty(obj: Record<string, any>, propertyKey: string): void {
  const exisringProperties = getOwnObservableProperties(obj);
  if (exisringProperties) {
    exisringProperties.push(propertyKey);
  } else {
    const protoProperties = getObservableProperties(obj) || [];
    Reflect.defineMetadata(
      ObservableSymbol.ObservableProperties,
      [...protoProperties, propertyKey],
      obj,
    );
  }
}

export function setConstructorProperties(obj: Record<string, any>): void {
  if (obj.constructor) {
    const exisringProperties = getOwnObservableProperties(obj.constructor);
    if (exisringProperties) {
      Reflect.defineMetadata(ObservableSymbol.ObservableProperties, [...exisringProperties], obj);
    }
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

export function isPlainObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]';
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
