/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import type { Notify } from './core';
import { ObservableSymbol } from './core';
import { Emitter } from 'mana-common';
import type { Disposable } from 'mana-common';
import { Observability } from './utils';

function setNotifier(tracker: Notifier, obj: Record<string, any>, property?: string | symbol) {
  if (property === undefined) {
    Reflect.defineMetadata(ObservableSymbol.Notifier, tracker, obj);
  } else {
    Reflect.defineMetadata(ObservableSymbol.Notifier, tracker, obj, property);
  }
}

function getNotifier(obj: Record<string, any>, property?: string | symbol): Notifier | undefined {
  if (property === undefined) {
    return Reflect.getMetadata(ObservableSymbol.Notifier, obj);
  } else {
    return Reflect.getMetadata(ObservableSymbol.Notifier, obj, property);
  }
}

export interface Notification<T = any> {
  target: T;
  prop?: any;
}
export class Notifier implements Disposable {
  protected changedEmitter = new Emitter<Notification>();
  disposed: boolean = false;
  get onChange() {
    return this.changedEmitter.event;
  }

  dispose() {
    this.changedEmitter.dispose();
    this.disposed = true;
  }

  once(trigger: Notify): Disposable {
    const toDispose = this.onChange(e => {
      trigger(e.target, e.prop);
      toDispose.dispose();
    });
    return toDispose;
  }

  notify(target: any, prop?: any): void {
    this.changedEmitter.fire({ target, prop });
    if (prop) {
      Notifier.trigger(target);
    }
  }

  static trigger(target: any, prop?: any): void {
    const exist = getNotifier(target, prop);
    if (exist) {
      exist.notify(target, prop);
    }
  }
  static getOrCreate(target: any, prop?: any): Notifier {
    const origin = Observability.getOrigin(target);
    const exist = getNotifier(target, prop);
    if (!exist || exist.disposed) {
      const notifier = new Notifier();
      setNotifier(notifier, origin, prop);
      return notifier;
    }
    return exist;
  }
  static find(target: any, prop?: any): Notifier | undefined {
    if (!Observability.notifiable(target, prop)) {
      return undefined;
    }
    return Notifier.getOrCreate(target, prop);
  }
}
