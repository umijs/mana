/* eslint-disable @typescript-eslint/no-explicit-any */
export namespace ObservableSymbol {
  export const Tracker = Symbol('Tracker');
  export const Observable = Symbol('Observable');
  export const ObservableProperties = Symbol('ObservableProperties');
  export const ObjectSelf = Symbol('ObjectSelf');
}

export type Newable<T> = new (...args: any[]) => T;

export type Abstract<T> = {
  prototype: T;
};
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
