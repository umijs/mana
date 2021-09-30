import * as React from 'react';
import type { Observable } from './core';

export type ContextConfig<T> = {
  context: T;
};

export const defaultContainerContext: Observable.ContainerContext = {
  getContainer: () => undefined,
};
export class ObservableContextImpl implements Observable.ContainerContext {
  protected context: Observable.ContainerContext = defaultContainerContext;
  config(info: Observable.ContainerContext): void {
    this.context = info;
  }
  getContainer = (): Observable.Container | undefined => this.context.getContainer();
}

export const defaultObservableContext = new ObservableContextImpl();

export const ObservableContext =
  React.createContext<Observable.ContainerContext>(defaultObservableContext);

export const Provider: React.FC<Observable.ContainerContext> = props => (
  <ObservableContext.Provider value={{ getContainer: props.getContainer }}>
    {props.children}
  </ObservableContext.Provider>
);
