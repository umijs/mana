import { ReactiveSymbol } from './core';

export function isTracked(obj: Record<string, any>, property?: string | symbol): boolean {
  // TODO: use Reflect.hasOwnMetadata
  if (!property) {
    return Reflect.hasMetadata(ReactiveSymbol.Tracked, obj);
  }
  return Reflect.hasMetadata(ReactiveSymbol.Tracked, obj, property);
}

export function markTracked(obj: Record<string, any>, property?: string | symbol) {
  if (!property) {
    Reflect.defineMetadata(ReactiveSymbol.Tracked, true, obj);
  } else {
    Reflect.defineMetadata(ReactiveSymbol.Tracked, true, obj, property);
  }
}
