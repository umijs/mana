import React from 'react';
import { Form, Input, Select, message, Button } from 'antd';
import { ToDoManager } from '../manager';
import { useInject } from 'mana-observable';
import type { ValidateErrorEntity } from 'rc-field-form/lib/interface';

export const TodoAdd = () => {
  const manager = useInject<ToDoManager>(ToDoManager);
  const [form] = Form.useForm();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (todo: any): void => {
    form.resetFields(['name']);
    manager.add(todo.type, todo.name);
  };
  const handleFailed = (entity: ValidateErrorEntity) => {
    message.error(entity.errorFields.toString());
  };
  const selectAfter = (
    <Form.Item
      label=""
      name="type"
      rules={[
        {
          required: true,
          message: 'Please select type.',
        },
      ]}
      style={{ marginBottom: 0 }}
    >
      <Select style={{ width: 80 }}>
        {manager.getProviders().map(provider => (
          <Select.Option key={provider.type} value={provider.type}>
            {provider.title}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      onFinishFailed={handleFailed}
      layout="horizontal"
      initialValues={{ type: manager.getProviders()[0] && manager.getProviders()[0].type }}
    >
      <Form.Item
        label=""
        name="name"
        rules={[
          {
            required: true,
            message: 'Please type in the todo name.',
          },
        ]}
      >
        <Input
          placeholder="What needs to be done?"
          spellCheck={false}
          autoComplete={undefined}
          autoFocus={true}
          addonAfter={selectAfter}
        />
      </Form.Item>
      <Form.Item style={{ display: 'none' }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};
