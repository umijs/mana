import 'reflect-metadata';
import type { Newable } from 'mana-common';
import { ObservableSymbol } from './core';

export function isObservableProperty(obj: any, property: string | symbol): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  return Reflect.hasMetadata(ObservableSymbol.Observable, obj, property);
}

export function markObservable(obj: Record<string, any>, property: string | symbol) {
  Reflect.defineMetadata(ObservableSymbol.Observable, true, obj, property);
}

export function markClassObservable(newable: Newable<any>, property: string | symbol) {
  Reflect.defineMetadata(ObservableSymbol.Observable, true, newable, property);
}

export function getOwnObservableProperties(obj: Record<string, any>): string[] | undefined {
  return Reflect.getOwnMetadata(ObservableSymbol.ObservableProperties, obj);
}
export function getObservableProperties(obj: Record<string, any>): string[] | undefined {
  return Reflect.getMetadata(ObservableSymbol.ObservableProperties, obj);
}

export function markObservableProperty(newable: Record<any, any>, propertyKey: string): void {
  const exisringProperties = getOwnObservableProperties(newable);
  if (exisringProperties) {
    exisringProperties.push(propertyKey);
  } else {
    const protoProperties = getObservableProperties(newable) || [];
    Reflect.defineMetadata(
      ObservableSymbol.ObservableProperties,
      [...protoProperties, propertyKey],
      newable,
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

export function defineInstanceValue(target: any, propertyKey: string, value: any) {
  Reflect.defineMetadata(propertyKey, value, target);
}
export function getInstanceValue(target: any, propertyKey: string) {
  Reflect.getMetadata(propertyKey, target);
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
