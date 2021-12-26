/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import type { Reaction } from './core';
import { ObservableSymbol } from './core';
import { Emitter } from 'mana-common';
import type { Disposable } from 'mana-common';
import { Observable } from './utils';

export type TrackedObject = {
  [ObservableSymbol.ObjectSelf]: Record<string, any>;
};

export function isTrackedObject(target: any): target is TrackedObject {
  return !!target && typeof target === 'object' && (target as any)[ObservableSymbol.ObjectSelf];
}

export function getOrigin<T>(target: T): T {
  if (isTrackedObject(target)) {
    return (target as any)[ObservableSymbol.ObjectSelf];
  }
  return target;
}

function setTracker(tracker: Tracker, obj: Record<string, any>, property?: string | symbol) {
  if (property === undefined) {
    Reflect.defineMetadata(ObservableSymbol.Tracker, tracker, obj);
  } else {
    Reflect.defineMetadata(ObservableSymbol.Tracker, tracker, obj, property);
  }
}

function getTracker(obj: Record<string, any>, property?: string | symbol): Tracker | undefined {
  if (property === undefined) {
    return Reflect.getMetadata(ObservableSymbol.Tracker, obj);
  } else {
    return Reflect.getMetadata(ObservableSymbol.Tracker, obj, property);
  }
}

export interface TrackInfo<T = any> {
  target: T;
  prop?: any;
}
export class Tracker implements Disposable {
  protected changedEmitter = new Emitter<TrackInfo>();
  disposed: boolean = false;
  get onChange() {
    return this.changedEmitter.event;
  }

  dispose() {
    this.changedEmitter.dispose();
    this.disposed = true;
  }

  add(trigger: Reaction): Disposable {
    return this.onChange(trigger);
  }

  once(trigger: Reaction): Disposable {
    const toDispose = this.onChange(e => {
      trigger(e.target, e.prop);
      toDispose.dispose();
    });
    return toDispose;
  }

  notify(target: any, prop?: any): void {
    this.changedEmitter.fire({ target, prop });
    if (prop) {
      Tracker.trigger(target);
    }
  }

  static trigger(target: any, prop?: any): void {
    const exist = getTracker(target, prop);
    if (exist) {
      exist.notify(target, prop);
    }
  }
  static getOrCreate(target: any, prop?: any): Tracker {
    const exist = getTracker(target, prop);
    if (!exist || exist.disposed) {
      const tracker = new Tracker();
      setTracker(tracker, target, prop);
      return tracker;
    }
    return exist;
  }
  static find(target: any, prop?: any): Tracker | undefined {
    if (!Observable.tarckable(target)) {
      return undefined;
    }
    if (prop && !Observable.is(target, prop)) {
      return undefined;
    }
    return Tracker.getOrCreate(target, prop);
  }
}
