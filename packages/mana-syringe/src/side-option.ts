import type { Syringe } from './core';

export const OptionSymbol = Symbol('SyringeOptionSymbol');
export const registerSideOption = <T extends Record<any, any> = any, R = any>(
  option: Syringe.InjectOption<R>,
  target: T,
) => {
  Reflect.defineMetadata(OptionSymbol, option, target);
};
