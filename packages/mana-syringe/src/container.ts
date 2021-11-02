import { Container as InversifyContainer } from 'inversify';
import type { InversifyContext } from './inversify/inversify-protocol';
import {
  GlobalContainer as InversifyGlobalContainer,
  namedToIdentifier,
  tokenToIdentifier,
} from './inversify';
import type { Syringe } from './core';
import { Utils } from './core';
import { Register } from './register';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Container implements Syringe.Container, InversifyContext {
  static config(option: Syringe.InjectOption<void>): void {
    Register.globalConfig = option;
  }
  protected loadedModules: number[] = [];
  container: InversifyContainer;
  protected inversify: boolean = true;
  parent?: Container;
  constructor(inversifyContainer?: InversifyContainer) {
    if (inversifyContainer) {
      this.container = inversifyContainer;
    } else {
      this.container = new InversifyContainer();
    }
  }
  load(module: Syringe.Module, force?: boolean): void {
    if (force || !this.loadedModules.includes(module.id)) {
      module.registry(this.register.bind(this), this.resolveContext());
      this.loadedModules.push(module.id);
    }
  }
  remove<T>(token: Syringe.Token<T>): void {
    return this.container.unbind(tokenToIdentifier(token));
  }
  get<T>(token: Syringe.Token<T>): T {
    return this.container.get(tokenToIdentifier(token));
  }
  getNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): T {
    return this.container.getNamed(tokenToIdentifier(token), namedToIdentifier(named));
  }
  getAll<T>(token: Syringe.Token<T>): T[] {
    return this.container.getAll(tokenToIdentifier(token));
  }
  getAllNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): T[] {
    return this.container.getAllNamed(tokenToIdentifier(token), namedToIdentifier(named));
  }

  isBound<T>(token: Syringe.Token<T>): boolean {
    return this.container.isBound(tokenToIdentifier(token));
  }

  isBoundNamed<T>(token: Syringe.Token<T>, named: Syringe.Named): boolean {
    return this.container.isBoundNamed(tokenToIdentifier(token), namedToIdentifier(named));
  }

  createChild(): Syringe.Container {
    const childContainer = this.container.createChild();
    const child = new Container(childContainer);
    child.parent = this;
    return child;
  }
  register<T = any>(tokenOrOption: Syringe.Token<T> | Syringe.InjectOption<T>): void;
  register<T = any>(token: Syringe.Token<T>, options: Syringe.InjectOption<T>): void;
  register<T = any>(
    token: Syringe.Token<T> | Syringe.InjectOption<T>,
    options: Syringe.InjectOption<T> = {},
  ): void {
    if (Utils.isInjectOption(token)) {
      Register.resolveOption(this, token);
    } else {
      Register.resolveTarget(this, token, options);
    }
  }

  protected resolveContext(): Syringe.Context {
    return { container: this };
  }
}

export const GlobalContainer = new Container(InversifyGlobalContainer);

export const register: Syringe.Register = GlobalContainer.register.bind(GlobalContainer);
