/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import type { Reaction } from './core';
import { ReactiveSymbol, logger } from './core';
import { Emitter } from 'mana-common';
import type { Disposable } from 'mana-common';
import { isTracked } from './utils';

const log = logger.extend('tracker');

export type TrackedObject = {
  [ReactiveSymbol.ObjectSelf]: Record<string, any>;
};

export function isTrackedObject(target: Record<string, any>): target is TrackedObject {
  return target && typeof target === 'object' && (target as any)[ReactiveSymbol.ObjectSelf];
}

export function getOrigin<T extends Record<string, any>>(target: T): T {
  if (isTrackedObject(target)) {
    return (target as any)[ReactiveSymbol.ObjectSelf];
  }
  return target;
}

export interface TrackInfo<T = any> {
  target: T;
  prop?: any;
}
export class Tracker implements Disposable {
  protected changedEmitter = new Emitter<TrackInfo>();
  disposed: boolean = false;
  get changed() {
    return this.changedEmitter.event;
  }

  dispose() {
    this.changedEmitter.dispose();
    this.disposed = true;
  }

  add(trigger: Reaction): Disposable {
    return this.changed(trigger);
  }

  once(trigger: Reaction): Disposable {
    const toDispose = this.changed(e => {
      trigger(e.target, e.prop);
      log('once trigger', e, this);
      toDispose.dispose();
    });
    return toDispose;
  }

  notify(target: any, prop?: any): void {
    log('notify', target, prop, this);
    this.changedEmitter.fire({ target, prop });
    if (prop) {
      Tracker.trigger(target);
    }
  }

  static trigger(target: any, prop?: any): void {
    const tracker: Tracker | undefined = Reflect.getMetadata(ReactiveSymbol.Tracker, target, prop);
    log('trigger', target, prop, tracker);
    if (tracker) {
      tracker.notify(target, prop);
    }
  }
  static getOrCreate(target: any, prop?: any): Tracker {
    const exist = Reflect.getMetadata(ReactiveSymbol.Tracker, target, prop);
    if (!exist || exist.disposed) {
      const tracker = new Tracker();
      log('create tracker', target, prop, tracker);
      Reflect.defineMetadata(ReactiveSymbol.Tracker, tracker, target, prop);
      return tracker;
    }
    return exist;
  }
  static find(target: any, prop?: any): Tracker | undefined {
    if (!isTracked(target, prop)) {
      return undefined;
    }
    return Tracker.getOrCreate(target, prop);
  }
}
