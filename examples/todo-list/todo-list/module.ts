import { Module, Contribution } from 'mana-syringe';
import { defaultToDoName, ToDoName, DefaultToDoItem } from './default-todo-item/todo-item';
import { ToDoManager } from './manager';
import { ToDoItemContribution, ToDoItemRegistry } from './todo-item-registry';
import {
  DefaultToDoFactory,
  DefaultToDoItemContribution,
} from './default-todo-item/default-todo-item-contribution';

export const ToDoModule = Module(register => {
  register(ToDoName, { useValue: defaultToDoName });

  // 注册扩展点
  Contribution.register(register, ToDoItemContribution);

  // 扩展 application
  register(ToDoItemRegistry);

  register(DefaultToDoFactory, {
    useFactory: context => (name: string) => {
      const child = context.container.createChild();
      child.register(ToDoName, { useValue: name });
      child.register(DefaultToDoItem);
      return child.get(DefaultToDoItem);
    },
  });

  register(DefaultToDoItemContribution);

  register(ToDoManager);
});
