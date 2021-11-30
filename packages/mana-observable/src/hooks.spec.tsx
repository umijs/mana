/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import 'regenerator-runtime/runtime';
import React from 'react';
import assert from 'assert';
import { prop, observable } from './observable';
import { defaultObservableContext } from './context';
import { GlobalContainer, inject } from 'mana-syringe';
import { singleton } from 'mana-syringe';
import { useInject } from './hooks';
import { getOrigin } from './tracker';
import renderer, { act } from 'react-test-renderer';

describe('use', () => {
  defaultObservableContext.config({
    getContainer: () => GlobalContainer,
  });
  it('#use inject', done => {
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
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <FooRender />
          <FooRender2 />
        </>,
      );
    });
    act(() => {
      const json: any = component.toJSON();
      assert(json && json.find((item: any) => item.children.includes('1')));
      done();
    });
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
        act(() => {
          foo.info1 += 1;
        });
      }, [foo]);
      return (
        <div>
          {foo.info}
          {foo.info1}
          {foo.getInfo()}
        </div>
      );
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<FooRender />);
    });
    setTimeout(() => {
      const json: any = component.toJSON();
      assert(json && json.children.includes('3'));
      assert(json && json.children.includes('1'));
      done();
    }, 100);
  });

  it('#computed property with this', done => {
    @singleton()
    class FooModel {
      @prop() info: number[] = [];
      get length(): number {
        return this.info.length;
      }
      constructor() {
        observable(this);
      }
    }
    GlobalContainer.register(FooModel);
    const fooInstance = GlobalContainer.get(FooModel);
    const FooRender = () => {
      const foo = useInject(FooModel);
      return <div>{foo.length}</div>;
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<FooRender />);
    });
    act(() => {
      fooInstance.info.push(1);
    });
    setTimeout(() => {
      const json: any = component.toJSON();
      assert(json && json.children.includes('1'));
      done();
    }, 100);
  });

  it('#indirect inject', done => {
    @singleton()
    class Foo {
      @prop() info: number = 0;
      constructor() {
        observable(this);
      }
    }
    @singleton()
    class Bar {
      constructor(@inject(Foo) public foo: Foo) {
        observable(this);
      }
    }
    GlobalContainer.register(Foo);
    GlobalContainer.register(Bar);
    const FooRender = () => {
      const bar = useInject(Bar);
      return <div>{bar.foo.info}</div>;
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <FooRender />
        </>,
      );
    });
    const fooInstance = GlobalContainer.get(Foo);
    act(() => {
      fooInstance.info = 1;
    });
    setTimeout(() => {
      const json: any = component.toJSON();
      assert(json && json.children.includes('1'));
      done();
    }, 100);
  });
});
