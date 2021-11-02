import type { Syringe } from '../core';
import { SyringeModule } from './syringe-module';

export * from './syringe-module';
export function Module(register?: Syringe.Registry): SyringeModule {
  return new SyringeModule(register);
}
