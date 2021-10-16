import type { MaybeArray } from './types';

export enum Priority {
  PRIOR = 1000,
  DEFAULT = 100,
  IDLE = -1,
}

export namespace Priority {
  export type PriorityObject<T> = {
    readonly priority: number;
    readonly value: T;
  };
  export type GetPriority<T> = (value: T) => number;
  export function toPriorityObject<T>(rawValue: T, getPriority: GetPriority<T>): PriorityObject<T>;
  export function toPriorityObject<T>(
    rawValue: T[],
    getPriority: GetPriority<T>,
  ): PriorityObject<T>[];
  export function toPriorityObject<T>(
    rawValue: MaybeArray<T>,
    getPriority: GetPriority<T>,
  ): MaybeArray<PriorityObject<T>> {
    if (rawValue instanceof Array) {
      return rawValue.map(v => toPriorityObject(v, getPriority));
    }
    const value = rawValue;
    const priority = getPriority(value);
    return { priority, value };
  }

  export function sort<T>(values: T[], getPriority: GetPriority<T>): PriorityObject<T>[] {
    const prioritizeable = toPriorityObject(values, getPriority);
    return prioritizeable.filter(isValid).sort(compare);
  }
  export function isValid<T>(p: PriorityObject<T>): boolean {
    return p.priority > 0;
  }
  export function compare<T>(p: PriorityObject<T>, p2: PriorityObject<T>): number {
    return p2.priority - p.priority;
  }
}
