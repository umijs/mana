/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Event } from './event';
import { Emitter } from './event';
import { Disposable } from './disposable';

export class DisposableCollection implements Disposable {
  protected readonly disposables: Disposable[] = [];
  protected readonly onDisposeEmitter = new Emitter<void>();
  private disposingElements = false;

  constructor(...toDispose: Disposable[]) {
    this.pushAll(toDispose);
  }

  get disposed(): boolean {
    return this.disposables.length === 0;
  }

  get onDispose(): Event<void> {
    return this.onDisposeEmitter.event;
  }

  protected checkDisposed(): void {
    if (this.disposed && !this.disposingElements) {
      this.onDisposeEmitter.fire(undefined);
      this.onDisposeEmitter.dispose();
    }
  }

  dispose(): void {
    if (this.disposed || this.disposingElements) {
      return;
    }
    this.disposingElements = true;
    while (!this.disposed) {
      try {
        this.disposables.pop()!.dispose();
      } catch (e) {
        console.error(e);
      }
    }
    this.disposingElements = false;
    this.checkDisposed();
  }

  push(disposable: Disposable): Disposable {
    const { disposables } = this;
    disposables.push(disposable);
    const originalDispose = disposable.dispose.bind(disposable);
    const toRemove = Disposable.create(() => {
      const index = disposables.indexOf(disposable);
      if (index !== -1) {
        disposables.splice(index, 1);
      }
      this.checkDisposed();
    });
    disposable.dispose = () => {
      toRemove.dispose();
      originalDispose();
    };
    return toRemove;
  }

  pushAll(disposables: Disposable[]): Disposable[] {
    return disposables.map(disposable => this.push(disposable));
  }
}
