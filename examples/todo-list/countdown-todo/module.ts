import { Module } from 'mana-syringe';
import { ToDoName } from '../todo-list/default-todo-item/todo-item';
import {
  CountdownToDoFactory,
  CountdownToDoItemContribution,
} from './countdown-todo-item-contribution';
import { CountdownToDoItem } from './countdown-todo-item';

export const CountdownToDoModule = Module(register => {
  register(CountdownToDoFactory, {
    useFactory: context => (name: string) => {
      const child = context.container.createChild();
      child.register(ToDoName, { useValue: name });
      child.register(CountdownToDoItem);
      return child.get(CountdownToDoItem);
    },
  });

  register(CountdownToDoItemContribution);
});
