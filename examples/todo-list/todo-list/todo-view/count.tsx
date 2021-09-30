import React from 'react';
import { useInject } from 'mana-observable';
import { ToDoManager } from '../manager';

export const ToDoCount: React.FC = () => {
  const manager = useInject<ToDoManager>(ToDoManager);
  return <div>count: {manager.count}</div>;
};
