import { inject, singleton, postConstruct } from 'mana-syringe';
import { prop, observable } from 'mana-observable';
import { DefaultToDoItem, ToDoName } from '../todo-list/default-todo-item/todo-item';

@singleton()
export class CountdownToDoItem extends DefaultToDoItem {
  @prop() public outdated: boolean = false;
  @prop() public deadLine: number = 60;
  @prop() public delta: number = 0;

  protected timer: NodeJS.Timeout;

  constructor(@inject(ToDoName) name: string) {
    super(name);
    observable(this);
    this.timer = setInterval(this.progressToDeadline, 1000 / 3);
  }

  @postConstruct()
  protected init(): void {}
  protected progressToDeadline = () => {
    if (!this.completed && !this.outdated) {
      this.delta += 1;
    }
    if (this.delta > this.deadLine) {
      this.outdated = true;
      if (this.timer) {
        clearInterval(this.timer);
      }
    }
  };
  public toggle(value?: boolean): void {
    if (value === undefined) {
      this.completed = !this.completed;
    } else {
      this.completed = value;
    }
  }

  public setDeadLine = (value: number): void => {
    this.deadLine = value;
  };
}
