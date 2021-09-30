/* eslint-disable @typescript-eslint/no-explicit-any */
import 'regenerator-runtime/runtime';

import 'react';
import assert from 'power-assert';
import { prop, observable } from './observable';
import { defaultObservableContext } from './context';
import { ReactiveSymbol } from './core';
import { GlobalContainer } from 'mana-syringe';
import { watch } from './watch';

describe('reactive', () => {
  defaultObservableContext.config({
    getContainer: () => GlobalContainer,
  });
  it('#reactive array', () => {
    class ClassArray {
      @prop() list: string[] = [];
      constructor() {
        observable(this);
      }
    }
    const instanceArray = new ClassArray();
    assert((instanceArray.list as any)[ReactiveSymbol.ObjectSelf]);
  });

  it('#reactive map', done => {
    class Foo {
      @prop() map: Map<string, string> = new Map();
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    let changedTimes = 0;
    watch(foo, () => {
      changedTimes += 1;
      if (changedTimes === 4) {
        done();
      }
    });
    assert((foo.map as any)[ReactiveSymbol.ObjectSelf]);
    foo.map.set('a', 'a');
    const aValue = foo.map.get('a');
    assert(aValue === 'a');
    assert(foo.map.size === 1);
    foo.map.set('b', 'b');
    foo.map.delete('a');
    foo.map.clear();
  });

  it('#reactive plain object', done => {
    class Foo {
      @prop() map: Record<string, string> = {};
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    let changedTimes = 0;
    watch(foo, () => {
      changedTimes += 1;
      if (changedTimes === 3) {
        done();
      }
    });
    assert((foo.map as any)[ReactiveSymbol.ObjectSelf]);
    foo.map.a = 'a';
    assert(foo.map.a === 'a');
    foo.map.b = 'b';
    delete foo.map.b;
    assert(Object.keys(foo.map).length === 1);
  });
});
