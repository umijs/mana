import type { Abstract, Newable } from 'mana-common';

/* eslint-disable @typescript-eslint/no-explicit-any */
export namespace ObservableSymbol {
  export const Reactor = Symbol('Reactor');
  export const Tracker = Symbol('Tracker');
  export const Observable = Symbol('Observable');
  export const ObservableProperties = Symbol('ObservableProperties');
  export const ObjectSelf = Symbol('ObjectSelf');
}

export type Reaction = (target?: any, prop?: any) => void;

export namespace Observable {
  export type Container = {
    get: <T>(identifier: Token<T>) => T;
    createChild: () => Container;
  };
  export type Token<T> = string | symbol | Newable<T> | Abstract<T>;
  export type ContainerContext = {
    getContainer: () => Container | undefined;
  };
}
