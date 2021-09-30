/* eslint-disable @typescript-eslint/no-parameter-properties */
import { transient, inject } from 'mana-syringe';
import type { ToDoItemRegistry } from '../todo-item-registry';
import { ToDoItemContribution, ToDoItemFactory } from '../todo-item-registry';
import { ToDoItemView } from './todo-item-view';

export const DefaultToDoFactory = Symbol('DefaultToDoFactory');
const DefaultToDoItemType = 'default';

@transient({ contrib: ToDoItemContribution })
export class DefaultToDoItemContribution implements ToDoItemContribution {
  constructor(@inject(DefaultToDoFactory) protected readonly todoFactory: ToDoItemFactory) {}

  registerTodoItems(registry: ToDoItemRegistry): void {
    registry.registerItem({
      type: DefaultToDoItemType,
      title: '默认',
      provide: this.todoFactory,
      render: ToDoItemView,
      canRender: () => 200,
    });
  }
}
