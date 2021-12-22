/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import 'regenerator-runtime/runtime';

import type { ErrorInfo } from 'react';
import React from 'react';
import assert from 'assert';
import { prop, observable } from './observable';
import { ObservableContext } from './context';
import { GlobalContainer } from 'mana-syringe';
import { singleton } from 'mana-syringe';
import { useInject } from './hooks';
import renderer from 'react-test-renderer';

console.error = () => {};
class ErrorBoundary extends React.Component {
  state: { error?: Error; errorInfo?: ErrorInfo } = {
    error: undefined,
    errorInfo: undefined,
  };
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.error) {
      return (
        <div>
          {this.state.error && this.state.error.toString()}
          <br />
          {this.state.errorInfo?.componentStack}
        </div>
      );
    }
    return this.props.children;
  }
}

describe('context', () => {
  it('#without initial', () => {
    @singleton()
    class FooModel {
      @prop() info: number = 1;
      constructor() {
        observable(this);
      }
    }
    GlobalContainer.register(FooModel);
    const ErrorRender = () => {
      const foo = useInject(FooModel);
      return <div>{foo.info}</div>;
    };
    const component = renderer.create(
      <ErrorBoundary>
        <ErrorRender />
      </ErrorBoundary>,
    );
    const json: any = component.toJSON();
    assert(
      json.children.find(
        (item: any) =>
          typeof item === 'string' && item.includes('please check the context settings'),
      ),
    );
  });

  it('#provider', done => {
    @singleton()
    class FooModel {
      @prop() info: number = 1;
      constructor() {
        observable(this);
      }
    }
    const container = GlobalContainer.createChild();
    container.register(FooModel);
    const ContextRender = () => {
      const foo = useInject(FooModel);
      return <div>{foo.info}</div>;
    };
    const component = renderer.create(
      <ObservableContext.Provider value={{ getContainer: () => container }}>
        <ContextRender />
      </ObservableContext.Provider>,
    );
    const json: any = component.toJSON();
    assert(json && json.children.includes('1'));
    done();
  });
});
