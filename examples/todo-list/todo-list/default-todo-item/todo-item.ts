import { singleton, inject } from 'mana-syringe';
import { prop } from 'mana-observable';
import { v4 } from 'uuid';
import type { ToDoItem } from '../todo-item-registry';

export const ToDoName = Symbol('ToDoName');
export const defaultToDoName = '默认';

@singleton()
export class DefaultToDoItem implements ToDoItem {
  public id: string = v4();
  name: string;
  @prop()
  public completed: boolean = false;
  constructor(@inject(ToDoName) name: string) {
    this.name = name;
  }
  public toggle(value?: boolean): void {
    if (value === undefined) {
      this.completed = !this.completed;
    } else {
      this.completed = value;
    }
  }
}
