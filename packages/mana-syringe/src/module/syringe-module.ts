/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Syringe } from '../core';
import { Utils } from '../core';
import { contributionInjectOption } from '../contribution/contribution-register';
import type { interfaces } from 'inversify';
import { ContainerModule } from 'inversify';
import type { InversifyRegister } from '../inversify';
import { Register } from '../register';

type TokenOrOption<T> = Syringe.Token<T> | Syringe.InjectOption<T>;

export class SyringeModule implements Syringe.Module {
  /**
   * @readonly
   * module unique id
   */
  readonly id: number;
  readonly inversifyModule: ContainerModule;

  protected baseRegistry?: Syringe.Registry;
  protected optionCollection?: (Syringe.Token<any> | Syringe.InjectOption<any>)[];

  constructor(registry?: Syringe.Registry) {
    this.baseRegistry = registry;
    this.inversifyModule = new ContainerModule(this.inversifyRegister);
    this.id = this.inversifyModule.id;
  }
  protected inversifyRegister = (
    bind: interfaces.Bind,
    unbind: interfaces.Unbind,
    isBound: interfaces.IsBound,
    rebind: interfaces.Rebind,
  ) => {
    const inversifyRegister: InversifyRegister = {
      bind,
      unbind,
      isBound,
      rebind,
    };
    const register = <T = any>(
      token: Syringe.Token<T> | Syringe.InjectOption<T>,
      options: Syringe.InjectOption<T> = {},
    ): void => {
      if (Utils.isInjectOption(token)) {
        Register.resolveOption(inversifyRegister, token);
      } else {
        Register.resolveTarget(inversifyRegister, token, options);
      }
    };
    if (this.baseRegistry) {
      this.baseRegistry(register);
    }
    if (this.optionCollection) {
      this.optionCollection.forEach(option => register(option));
    }
  };

  protected get options() {
    if (!this.optionCollection) {
      this.optionCollection = [];
    }
    return this.optionCollection;
  }
  register(...options: TokenOrOption<any>[]) {
    options.forEach(option => this.options.push(option));
    return this;
  }

  contribution(...tokens: Syringe.DefinedToken[]) {
    tokens.forEach(token => this.options.push(contributionInjectOption(token)));
    return this;
  }
}

export function isSyringeModule(data: Syringe.Module): data is SyringeModule {
  return data && 'inversifyModule' in data;
}
