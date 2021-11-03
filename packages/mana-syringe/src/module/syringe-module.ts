/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Syringe } from '../core';
import { contributionInjectOption } from '../contribution/contribution-register';

type TokenOrOption<T> = Syringe.Token<T> | Syringe.InjectOption<T>;

export class SyringeModule implements Syringe.Module {
  static moduleId: number = 0;
  /**
   * @readonly
   * module unique id
   */
  readonly id: number;

  protected baseRegistry?: Syringe.Registry;
  protected optionCollection?: (Syringe.Token<any> | Syringe.InjectOption<any>)[];
  /**
   * Exposed registration function
   */
  get registry(): Syringe.Registry {
    return (register: Syringe.Register, ctx: Syringe.Context) => {
      if (this.baseRegistry) {
        this.baseRegistry(register, ctx);
      }
      if (this.optionCollection) {
        this.optionCollection.forEach(option => register(option));
      }
    };
  }

  constructor(registry?: Syringe.Registry) {
    SyringeModule.moduleId += 1;
    this.id = SyringeModule.moduleId;
    this.baseRegistry = registry;
  }

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
