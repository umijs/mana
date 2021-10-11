/* eslint-disable @typescript-eslint/no-explicit-any */

import 'regenerator-runtime/runtime';

import React from 'react';
import assert from 'assert';
import { prop, observable } from './observable';
import { Provider } from './context';
import { GlobalContainer } from 'mana-syringe';
import { singleton } from 'mana-syringe';
import { useInject } from './hooks';
import renderer from 'react-test-renderer';

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
    const FooRender = () => {
      const foo = useInject(FooModel);
      return <div>{foo?.info || (foo as any).message}</div>;
    };
    try {
      renderer.create(<FooRender />);
    } catch (ex: any) {
      assert(ex.message.includes('please check the context settings'));
    }
  });

  it('#provider', () => {
    @singleton()
    class FooModel {
      @prop() info: number = 1;
      constructor() {
        observable(this);
      }
    }
    GlobalContainer.register(FooModel);
    const FooRender = () => {
      const foo = useInject(FooModel);
      return <div>{foo.info}</div>;
    };
    const component = renderer.create(
      <Provider getContainer={() => GlobalContainer}>
        <FooRender />
      </Provider>,
    );
    const json: any = component.toJSON();
    assert(json && json.children.includes('1'));
  });
});
