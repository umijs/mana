import { GlobalContainer } from 'mana-syringe';
import { defaultObservableContext } from 'mana-observable';
import { ToDoModule } from './todo-list/module';
import { CoreModule } from './application/module';
import { Application } from './application/application';
import { CountdownToDoModule } from './countdown-todo/module';

defaultObservableContext.config({ getContainer: () => GlobalContainer });

GlobalContainer.load(CoreModule);
GlobalContainer.load(ToDoModule);
GlobalContainer.load(CountdownToDoModule);

GlobalContainer.get(Application);
