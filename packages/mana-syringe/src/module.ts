/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Syringe } from './core';

export class SyringeModule implements Syringe.Module {
  static moduleId: number = 0;
  id: number;
  registry: Syringe.Registry;
  constructor(registry: Syringe.Registry) {
    SyringeModule.moduleId += 1;
    this.id = SyringeModule.moduleId;
    this.registry = registry;
  }
}
export function Module(register: Syringe.Registry): SyringeModule {
  return new SyringeModule(register);
}
