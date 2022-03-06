import React from 'react';
import { Checkbox, Tooltip, Tag, List, Button, Progress } from 'antd';
import type { CountdownToDoItem } from '../countdown-todo-item';
import { useInject, useObserve, getOrigin } from 'mana-observable';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ToDoManager } from '../../todo-list/manager';
import styles from './index.less';

export const CountdownToDoItemView: React.FC<{ todo: CountdownToDoItem }> = props => {
  const todo = useObserve(props.todo);
  const manager = useInject<ToDoManager>(ToDoManager);
  const percent = parseFloat(((todo.delta * 100) / todo.deadLine).toFixed(2));
  let status: 'active' | 'success' | 'exception' = 'active';
  if (todo.outdated) {
    status = 'exception';
  }
  if (todo.completed) {
    status = 'success';
  }
  return (
    <List.Item
      actions={[
        <Tooltip title="Remove Todo" key="remove">
          <Button danger onClick={() => manager.remove(getOrigin(todo))}>
            X
          </Button>
        </Tooltip>,
      ]}
      className={styles.listItem}
    >
      <div className={styles.todoItem}>
        <Tooltip title={todo.completed ? 'Mark as uncompleted' : 'Mark as completed'}>
          <Checkbox
            checked={todo.completed}
            defaultChecked={todo.completed}
            onChange={(e: CheckboxChangeEvent) => todo.toggle(e.target.value)}
          />
        </Tooltip>

        <Tag color={todo.completed ? 'green' : 'volcano'} className={styles.todoTag}>
          {todo.completed ? '✅' : '-'}
        </Tag>

        <div className={styles.todoName}>{todo.completed ? <del>{todo.name}</del> : todo.name}</div>
        <div className={styles.progress}>
          <Progress percent={percent} status={status} />
        </div>
      </div>
    </List.Item>
  );
};
