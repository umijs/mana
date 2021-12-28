/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import 'regenerator-runtime/runtime';
import React, { useEffect } from 'react';
import assert from 'assert';
import { useObserve } from './hooks';
import renderer, { act } from 'react-test-renderer';
import { observable, useObservableState } from '.';
import { prop } from './decorator';

describe('use', () => {
  it('#useObserve basic ', done => {
    class Foo {
      @prop() info: number = 0;
    }
    const SINGLETON_FOO = new Foo();
    const FooRender = () => {
      const foo = useObserve(SINGLETON_FOO);
      return <div>{foo && foo.info}</div>;
    };
    let component: renderer.ReactTestRenderer;
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
      SINGLETON_FOO.info = 1;
    });
    act(() => {
      const json = component.toJSON();
      assert(!(json instanceof Array) && json && json.children?.find(item => item === '1'));
      done();
    });
  });
  it('#useObserve array', done => {
    class Foo {
      @prop() list: number[] = [];
    }
    const foo = new Foo();
    let renderTimes = 0;
    const FooRender = () => {
      const f = useObserve(foo);
      renderTimes += 1;
      return <div>{f.list.length}</div>;
    };
    let component: renderer.ReactTestRenderer;
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
      for (let index = 0; index < 100; index++) {
        foo.list.push(index);
      }
    });
    act(() => {
      assert(renderTimes < 25);
      done();
    });
  });
  it('#useObserve deep array ', done => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      @prop() list: Foo[] = [];
    }
    const SINGLETON_BAR = new Bar();
    const foo = new Foo();
    SINGLETON_BAR.list.push(foo);
    const FooRender = () => {
      const bar = useObserve(SINGLETON_BAR);
      return <div>{bar.list.filter(item => item.info.length > 0).length}</div>;
    };
    let component: renderer.ReactTestRenderer;
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
      foo.info = 'a';
    });
    act(() => {
      const json = component.toJSON();
      assert(!(json instanceof Array) && json && json.children?.find(item => item === '1'));
      done();
    });
  });

  it('#useObserve reactable array', done => {
    const ARR: any[] = observable([]);
    const Render = () => {
      const arr = useObserve(ARR);
      const arr1 = useObservableState<string[]>([]);
      useEffect(() => {
        arr.push('effect');
        arr1.push('effect1');
      }, [arr, arr1]);
      return (
        <div>
          {JSON.stringify(arr)}
          {arr1[0]}
          {arr.length}
        </div>
      );
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <>
          <Render />
        </>,
      );
      const json = component.toJSON();
      assert(json === null);
    });
    act(() => {
      ARR.push('a');
    });
    act(() => {
      const json = component.toJSON();
      assert(
        !(json instanceof Array) &&
          json &&
          json.children?.includes('2') &&
          json.children?.includes('effect1'),
      );
      done();
    });
  });
});
