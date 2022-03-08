import type { interfaces } from 'inversify';
import { Container as InversifyContainer } from 'inversify';
import type { InversifyContext } from './inversify/inversify-protocol';
import {
  GlobalContainer as InversifyGlobalContainer,
  namedToIdentifier,
  tokenToIdentifier,
} from './inversify';
import type { Disposable, Syringe } from './core';
import { Utils } from './core';
import { Register } from './register';
import { isSyringeModule } from './module';

const ContainerMap = new Map<number, Syringe.Container>();

/* eslint-disable @typescript-eslint/no-explicit-any */
export class Container implements Syringe.Container, InversifyContext {
  static setContainer(key: interfaces.Container, value: Syringe.Container) {
    return ContainerMap.set(key.id, value);
  }
  static getContainer(key: interfaces.Container) {
    const exist = ContainerMap.get(key.id);
    if (!exist) {
      const container = new Container(key);
      Container.setContainer(key, container);
      return container;
    }
    return exist;
  }
  static config(option: Syringe.InjectOption<void>): void {
    Register.globalConfig = option;
  }

  protected loadedModules: number[] = [];
  container: interfaces.Container;
  protected inversify: boolean = true;
  parent?: Container;
  constructor(inversifyContainer?: interfaces.Container) {
    if (inversifyContainer) {
      this.container = inversifyContainer;
    } else {
      this.container = new InversifyContainer();
    }
    Container.setContainer(this.container, this);
  }
  load(module: Syringe.Module, force?: boolean): Disposable {
    if (force || !this.loadedModules.includes(module.id)) {
      if (isSyringeModule(module)) {
        this.container.load(module.inversifyModule);
      } else {
        console.warn('Unsupported module.', module);
      }
      this.loadedModules.push(module.id);
      return {
        dispose: () => {
          this.unload(module);
        },
      };
    }
    return { dispose: () => {} };
  }
  unload(module: Syringe.Module): void {
    if (isSyringeModule(module)) {
      this.container.unload(module.inversifyModule);
      this.loadedModules = this.loadedModules.filter(id => id !== module.id);
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
      Register.resolveOption(this.container, token);
    } else {
      Register.resolveTarget(this.container, token, options);
    }
  }
}

export const GlobalContainer = new Container(InversifyGlobalContainer);

export const register: Syringe.Register = GlobalContainer.register.bind(GlobalContainer);
