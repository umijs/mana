/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */

import 'reflect-metadata';

export type TokenOption = {
  multiple?: boolean;
};

export type Newable<T> = new (...args: any[]) => T;

export type Decorator<T> = (target: Newable<T> | Abstract<T>) => any;
export type Abstract<T> = {
  prototype: T;
};

export namespace Syringe {
  /**
   * 定义注入标识，默认允许多重注入
   */
  export const defineToken = (name: string, option: Partial<TokenOption> = { multiple: true }) =>
    new Syringe.DefinedToken(name, option);
  export class DefinedToken {
    /**
     * 兼容 inversify identifier
     */
    prototype: any = {};
    protected name: string;
    readonly multiple: boolean;
    readonly symbol: symbol;
    constructor(name: string, option: Partial<TokenOption> = {}) {
      const { multiple = false } = option;
      this.name = name;
      this.symbol = Symbol(this.name);
      this.multiple = multiple;
    }
  }

  export type Register = <T = any>(
    token: Syringe.Token<T> | Syringe.InjectOption<T>,
    options?: Syringe.InjectOption<T>,
  ) => void;

  export type Token<T> = string | symbol | Newable<T> | Abstract<T> | DefinedToken;
  export type Named = string | symbol | DefinedToken;
  export type NamedToken<T> = {
    token: Token<T>;
    named: Named;
  };
  export type OverrideToken<T> = {
    token: Token<T>;
    override: boolean;
  };

  export type Registry = (register: Register, ctx: Context) => void;
  export type Module = {
    id: number;
    registry: Registry;
  };

  export function isModule(data: Record<any, any> | undefined): data is Module {
    return !!data && typeof data === 'object' && 'id' in data && 'registry' in data;
  }

  export type Container = {
    parent?: Container;
    remove: <T>(token: Syringe.Token<T>) => void;
    register: <T = any>(
      token: Syringe.Token<T> | Syringe.InjectOption<T>,
      options?: Syringe.InjectOption<T>,
    ) => void;
    load: (module: Module, force?: boolean) => void;
    get: <T>(token: Syringe.Token<T>) => T;
    getNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => T;
    getAll: <T>(token: Syringe.Token<T>) => T[];
    getAllNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => T[];
    isBound: <T>(token: Syringe.Token<T>) => boolean;
    isBoundNamed: <T>(token: Syringe.Token<T>, named: Syringe.Named) => boolean;
    createChild: () => Container;
  };

  export type Context = {
    container: Container;
  };
  export type UnionToken<T> = Token<T> | NamedToken<T>;
  export type Class<T> = Newable<T>;
  export type Factory<T> = (ctx: Context) => (...args: any) => T;
  export type Dynamic<T> = (ctx: Context) => T;
  export type MaybeArray<T> = T | T[];

  export type DecoratorOption<T> = {
    token?: MaybeArray<UnionToken<T>>;
    contrib?: MaybeArray<Token<T>>;
    lifecycle?: Lifecycle;
  };

  export type TargetOption<T> = {
    contrib?: MaybeArray<Token<T>>;
  } & ValueOption<T>;

  export type ValueOption<T> = {
    useClass?: MaybeArray<Class<T>>;
    useDynamic?: MaybeArray<Dynamic<T>>;
    useFactory?: MaybeArray<Factory<T>>;
    useValue?: T;
  };

  export type InjectOption<T> = DecoratorOption<T> & ValueOption<T>;

  export enum Lifecycle {
    singleton = 'singleton',
    transient = 'transient',
  }
  export const ClassOptionSymbol = Symbol('SyringeClassOptionSymbol');

  export type FormattedInjectOption<T> = {
    token: UnionToken<T>[];
    contrib: Token<T>[];
    useClass: Class<T>[];
    lifecycle: Lifecycle;
    useDynamic: Dynamic<T>[];
    useFactory: Factory<T>[];
    useValue?: T;
  } & InjectOption<T>;

  export const DefaultOption: Syringe.InjectOption<any> = {
    lifecycle: Lifecycle.transient,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export namespace Utils {
  export function maybeArrayToArray<T>(maybeArray: Syringe.MaybeArray<T> | undefined): T[] {
    if (!(maybeArray instanceof Array)) {
      if (maybeArray !== undefined) {
        return [maybeArray];
      }
      return [];
    }
    return maybeArray;
  }
  export function isClass(
    data?: string | symbol | Record<string, any>,
  ): data is Syringe.Class<any> {
    return !!(data && typeof data === 'function' && 'prototype' in data);
  }
  export function isDefinedToken(
    data: Record<string, any> | undefined | symbol | string | number,
  ): data is Syringe.DefinedToken {
    return !!(data && typeof data === 'object' && 'symbol' in data && 'multiple' in data);
  }
  export function isInjectOption<T>(
    data: Syringe.Token<T> | Syringe.InjectOption<T> | undefined,
  ): data is Syringe.InjectOption<T> {
    return !!(data && typeof data === 'object' && 'token' in data);
  }

  export function isNamedToken<T>(
    data: Syringe.UnionToken<T> | undefined,
  ): data is Syringe.NamedToken<T> {
    return !!(data && typeof data === 'object' && 'token' in data && 'named' in data);
  }
  export function isMultipleEnabled<T>(token: Syringe.Token<T>): boolean {
    return Utils.isDefinedToken(token) && token.multiple;
  }
}
