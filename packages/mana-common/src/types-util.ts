import type { MaybeArray } from './types';

export function toArray<T>(v: MaybeArray<T>): T[] {
  if (v instanceof Array) {
    return v;
  }
  return [v];
}
