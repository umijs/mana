import type { MaybeArray } from './types';

export function toArray<T>(v: MaybeArray<T>): T[] {
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
}
