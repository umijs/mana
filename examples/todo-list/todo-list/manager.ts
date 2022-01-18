/* eslint-disable @typescript-eslint/no-parameter-properties */
import { singleton, inject } from 'mana-syringe';
import { prop } from 'mana-observable';
import type { ToDoItem, ToDoItemProvider } from './todo-item-registry';
import { ToDoItemRegistry } from './todo-item-registry';

@singleton()
export class ToDoManager {
  @prop()
  test: boolean | undefined = undefined;

  @prop()
  collection: ToDoItem[] = [];

  @prop()
  count: number = 0;

  // get count (): number {
  //   return this.collection.length;
  // }

  constructor(@inject(ToDoItemRegistry) protected todoRegistry: ToDoItemRegistry) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public add(type: string, name: string, ...args: any[]): void {
    const provider = this.todoRegistry.getToDoItemProvider(type);
    if (!provider) {
      console.log(`没有找到${type}类型的ToDoItem注册信息，无法创建该类型的数据`);
      return;
    }
    const newToDo = provider.provide(name, ...args);
    this.collection.push(newToDo);
    this.count = this.collection.length;
  }

  public remove(item: ToDoItem): void {
    this.collection = this.collection.filter(todo => todo !== item);
    this.count = this.collection.length;
  }
  public getRender(item: ToDoItem): React.FC<{ todo: ToDoItem }> {
    return this.todoRegistry.getRender(item);
  }

  public getProviders(): ToDoItemProvider[] {
    return Array.from(this.todoRegistry.toDoItemProviderItems.values());
  }
}
