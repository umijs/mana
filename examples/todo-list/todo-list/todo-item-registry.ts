/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-parameter-properties */
/* eslint-disable @typescript-eslint/no-redeclare */
import { singleton, contrib, Contribution, Syringe } from 'mana-syringe';
import type * as React from 'react';
import { ApplicationContribution } from '../application/application';
import { Disposable } from 'mana-common';

export interface ToDoItem {
  id: string;
  name: string;
  completed: boolean;
  toggle: (value?: boolean) => void;
}

export const ToDoItemFactory = Symbol('ToDoItemFactory');
export interface ToDoItemFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (name: string, ...args: any[]): ToDoItem;
}
export const ToDoItemContribution = Syringe.defineToken('ToDoItemContribution');
export interface ToDoItemContribution {
  registerTodoItems: (registry: ToDoItemRegistry) => void;
}
export interface ToDoItemProvider {
  readonly type: string;
  readonly title: string;
  provide: ToDoItemFactory;
  render: React.FC<{ todo: ToDoItem }>;
  canRender: (item: ToDoItem) => number;
}
@singleton({ contrib: ApplicationContribution })
export class ToDoItemRegistry implements ApplicationContribution {
  constructor(
    @contrib(ToDoItemContribution)
    protected readonly contributionProvider: Contribution.Provider<ToDoItemContribution>,
  ) {}
  protected providers: Map<string, ToDoItemProvider> = new Map();

  async onStart(): Promise<void> {
    const contributions = this.contributionProvider.getContributions();
    for (const contribution of contributions) {
      contribution.registerTodoItems(this);
    }
  }

  registerItem(item: ToDoItemProvider): Disposable {
    const { type } = item;
    this.providers.set(type, item);
    return Disposable.create(() => this.providers.delete(type));
  }

  get toDoItemProviderItems(): Map<string, ToDoItemProvider> {
    return this.providers;
  }
  getToDoItemProvider(type: string): ToDoItemProvider | undefined {
    return this.providers.get(type);
  }
  getRender(item: ToDoItem): React.FC<{ todo: ToDoItem }> {
    const providers = Array.from<ToDoItemProvider>(this.providers.values());
    const sortted = providers.sort((p, p2) => p2.canRender(item) - p.canRender(item));
    return sortted[0].render;
  }
}
