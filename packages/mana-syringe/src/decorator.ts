/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  injectable as inversInjectable,
  inject as inversifyInject,
  named as inversifyNamed,
} from 'inversify';
import type { Decorator } from './core';
import { Syringe } from './core';
import { namedToIdentifier, tokenToIdentifier } from './inversify';

export function injectable<T = any>(option: Syringe.DecoratorOption<T> = {}): Decorator<T> {
  const decorator = inversInjectable();
  return (target: any) => {
    Reflect.defineMetadata(Syringe.ClassOptionSymbol, { ...option, target }, target);
    decorator(target);
  };
}

export function singleton<T = any>(option: Syringe.DecoratorOption<T> = {}): Decorator<T> {
  return injectable({ ...option, lifecycle: Syringe.Lifecycle.singleton });
}

export function transient<T = any>(option: Syringe.DecoratorOption<T> = {}): Decorator<T> {
  return injectable({ ...option, lifecycle: Syringe.Lifecycle.transient });
}

export function inject(
  token: Syringe.Token<any>,
): (target: any, targetKey: string, index?: number | undefined) => void {
  return inversifyInject(tokenToIdentifier(token));
}
export function named(
  name: Syringe.Named,
): (target: any, targetKey: string, index?: number | undefined) => void {
  return inversifyNamed(namedToIdentifier(name));
}
export { postConstruct, optional, unmanaged, decorate } from 'inversify';
