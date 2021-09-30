/* eslint-disable @typescript-eslint/no-explicit-any */

import 'regenerator-runtime/runtime';
import React from 'react';
import assert from 'power-assert';
import { prop, observable } from './observable';
import { defaultObservableContext } from './context';
import { GlobalContainer } from 'mana-syringe';
import { singleton } from 'mana-syringe';
import { useInject } from './hooks';
import { getOrigin } from './tracker';
import renderer from 'react-test-renderer';

describe('use', () => {
  defaultObservableContext.config({
    getContainer: () => GlobalContainer,
  });
  it('#use inject', () => {
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
    const FooRender2 = () => {
      const foo = useInject(FooModel);
      return <div>{foo.info}</div>;
    };
    const component = renderer.create(
      <>
        <FooRender />
        <FooRender2 />
      </>,
    );
    const json: any = component.toJSON();
    assert(json && json.find((item: any) => item.children.includes('1')));
  });

  it('#use inject onChange', done => {
    @singleton()
    class FooModel {
      @prop() info: number = 0;
      @prop() info1: number = 1;
      constructor() {
        observable(this);
      }
      getInfo(): number {
        return this.info;
      }
    }
    GlobalContainer.register(FooModel);
    const fooInstance = GlobalContainer.get(FooModel);
    const FooRender = () => {
      const foo = useInject(FooModel);
      React.useEffect(() => {
        assert(fooInstance !== foo);
        assert(fooInstance === getOrigin(foo));
        foo.info += 1;
        foo.info1 += 1;

        setTimeout(() => {
          foo.info1 += 1;
        }, 50);
      }, [foo]);
      return (
        <div>
          {foo.info}
          {foo.info1}
          {foo.getInfo()}
        </div>
      );
    };
    const component = renderer.create(<FooRender />);
    setTimeout(() => {
      const json: any = component.toJSON();
      assert(json && json.children.includes('3'));
      assert(json && json.children.includes('1'));
      done();
    }, 100);
  });
});
