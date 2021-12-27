/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import 'regenerator-runtime/runtime';
import React from 'react';
import assert from 'assert';
import { observable } from './observable';
import { useObserve } from './hooks';
import renderer, { act } from 'react-test-renderer';
import { prop } from './decorator';

describe('use', () => {
  it('#use observe', done => {
    class Foo {
      @prop() info: number = 0;
    }
    const SINGLETON_FOO = observable(new Foo());
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
});
