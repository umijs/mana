import React from 'react';
import { useInject } from 'mana-observable';
import { Card } from 'antd';
import { ToDoManager } from '../manager';
import { TodoAdd } from './todo-add';
import { ToDoCount } from './count';
import './index.css';

export const ToDo: React.FC = () => {
  const manager = useInject<ToDoManager>(ToDoManager);
  return (
    <div className="todo">
      <ToDoCount />
      <TodoAdd />
      <Card title="Todo List">
        {manager.collection.map(todo => {
          const ItemView = manager.getRender(todo);
          return <ItemView key={todo.id} todo={todo} />;
        })}
      </Card>
    </div>
  );
};
