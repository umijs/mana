/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import 'regenerator-runtime/runtime';

import type { ErrorInfo } from 'react';
import React from 'react';
import assert from 'assert';
import { defaultObservableContext, ObservableContext } from './context';
import { GlobalContainer, inject } from 'mana-syringe';
import { singleton } from 'mana-syringe';
import { useInject } from './context';
import renderer, { act } from 'react-test-renderer';
import { prop } from './decorator';
import { useObserve } from './hooks';
import { getOrigin } from './tracker';

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

describe('error context', () => {
  it('#without initial', () => {
    @singleton()
    class FooModel {
      @prop() info: number = 1;
    }
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
});

describe('context', () => {
  it('#provider', done => {
    @singleton()
    class Foo {
      @prop() info: number = 1;
    }
    const container = GlobalContainer.createChild();
    container.register(Foo);
    const ContextRender = () => {
      const foo = useInject(Foo);
      return <div>{foo.info}</div>;
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <ObservableContext.Provider value={{ getContainer: () => container }}>
          <ContextRender />
        </ObservableContext.Provider>,
      );
    });
    act(() => {
      defaultObservableContext.config({
        getContainer: () => GlobalContainer,
      });
      const json: any = component.toJSON();
      assert(json && json.children.includes('1'));
      done();
    });
  });

  it('#use inject', done => {
    @singleton()
    class FooModel {
      @prop() info: number = 1;
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

  it('#use observe', done => {
    class Bar {
      @prop() info: number = 1;
    }
    @singleton()
    class FooModel {
      @prop() bar?: Bar;
      set() {
        this.bar = new Bar();
      }
    }
    GlobalContainer.register(FooModel);
    const FooRender = () => {
      const foo = useInject(FooModel);
      const bar = useObserve(foo.bar);
      return <div>{bar && bar.info}</div>;
    };
    let component: renderer.ReactTestRenderer;
    const fooModel = GlobalContainer.get(FooModel);
    act(() => {
      component = renderer.create(
        <>
          <FooRender />
        </>,
      );

      const json = component.toJSON();
      assert(json === null);
    });
    act(() => {
      fooModel.set();
    });
    act(() => {
      const json = component.toJSON();

      assert(!(json instanceof Array) && json && json.children?.find(item => item === '1'));
      done();
    });
  });

  it('#use inject onChange', done => {
    @singleton()
    class FooModel {
      @prop() info: number = 0;
      @prop() info1: number = 1;
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
    }
    @singleton()
    class Bar {
      constructor(@inject(Foo) public foo: Foo) {}
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
