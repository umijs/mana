import React from 'react';
import { Checkbox, Tooltip, Tag, List, Button } from 'antd';
import type { DefaultToDoItem } from '../todo-item';
import { useInject, useTrack, getOrigin } from 'mana-observable';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ToDoManager } from '../../manager';
import './index.css';

export const ToDoItemView: React.FC<{ todo: DefaultToDoItem }> = props => {
  const todo = useTrack(props.todo);
  const manager = useInject<ToDoManager>(ToDoManager);
  return (
    <List.Item
      actions={[
        <Tooltip title="Remove Todo" key="remove">
          <Button danger onClick={() => manager.remove(getOrigin(todo))}>
            X
          </Button>
        </Tooltip>,
      ]}
      className="listItem"
    >
      <div className="todoItem">
        <Tooltip title={todo.completed ? 'Mark as uncompleted' : 'Mark as completed'}>
          <Checkbox
            checked={todo.completed}
            defaultChecked={todo.completed}
            onChange={(e: CheckboxChangeEvent) => todo.toggle(e.target.value)}
          />
        </Tooltip>

        <Tag color={todo.completed ? 'green' : 'volcano'} className={'todoTag'}>
          {todo.completed ? '✅' : '-'}
        </Tag>

        <div className={'todoName'}>{todo.completed ? <del>{todo.name}</del> : todo.name}</div>
      </div>
    </List.Item>
  );
};
