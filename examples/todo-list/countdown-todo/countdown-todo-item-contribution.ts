/* eslint-disable @typescript-eslint/no-parameter-properties */
import { inject, singleton } from 'mana-syringe';
import type { ToDoItemRegistry, ToDoItem } from '../todo-list/todo-item-registry';
import { ToDoItemContribution, ToDoItemFactory } from '../todo-list/todo-item-registry';
import { CountdownToDoItemView } from './countdown-todo-item-view';
import { CountdownToDoItem } from './countdown-todo-item';

export const CountdownToDoFactory = Symbol('CountDownToDoFactory');

@singleton({ contrib: ToDoItemContribution })
export class CountdownToDoItemContribution implements ToDoItemContribution {
  constructor(@inject(CountdownToDoFactory) protected readonly todoFactory: ToDoItemFactory) {}
  registerTodoItems(registry: ToDoItemRegistry): void {
    registry.registerItem({
      type: 'countDown',
      title: '倒计时',
      provide: this.todoFactory,
      render: CountdownToDoItemView as React.FC<{ todo: ToDoItem }>,
      canRender: (todo: ToDoItem) => {
        if (todo instanceof CountdownToDoItem) {
          return 400;
        }
        return 0;
      },
    });
  }
}
