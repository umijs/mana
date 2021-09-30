/* eslint-disable @typescript-eslint/no-explicit-any */

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer I)[] ? RecursivePartial<I>[] : RecursivePartial<T[P]>;
};
export type MaybeArray<T> = T | T[];
export type MaybePromise<T> = T | PromiseLike<T>;
export type Newable<T> = new (...args: any[]) => T;
export type Abstract<T> = {
  prototype: T;
};
