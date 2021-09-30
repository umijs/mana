/* eslint-disable @typescript-eslint/no-explicit-any */

import { debug } from 'debug';

export namespace ReactiveSymbol {
  export const Config = Symbol('Config');
  export const Trigger = Symbol('Trigger');
  export const Tracker = Symbol('PropertyTracker');
  export const TrackedObjectSelf = Symbol('TrackedObjectSelf');
  export const TrackableProperty = Symbol('TraceableProperty');
  export const TrackableProperties = Symbol('TraceableProperties');
  export const Tracked = Symbol('Tracked');
  export const ObjectSelf = Symbol('ObjectSelf');
}

export const logger = debug('[mana-observable]');

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
