import React from 'react';
import { ToDo } from './todo-list/todo-view';
import 'antd/dist/antd.css';
import './index.css';

export function TODOList(): React.ReactNode {
  return (
    <div className={'normal'}>
      <ToDo />
    </div>
  );
}
