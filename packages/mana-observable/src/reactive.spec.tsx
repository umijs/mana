/* eslint-disable @typescript-eslint/no-explicit-any */
import 'regenerator-runtime/runtime';

import 'react';
import assert from 'assert';
import { prop, observable } from './observable';
import { defaultObservableContext } from './context';
import { ObservableSymbol } from './core';
import { GlobalContainer } from 'mana-syringe';
import { Tracker } from './tracker';

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
    assert((instanceArray.list as any)[ObservableSymbol.ObjectSelf]);
  });

  it('#reactive map', () => {
    class Foo {
      @prop() map: Map<string, string> = new Map();
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    assert((foo.map as any)[ObservableSymbol.ObjectSelf]);
  });

  it('#reactive plain object', () => {
    class Foo {
      @prop() map: Record<string, string> = {};
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    assert((foo.map as any)[ObservableSymbol.ObjectSelf]);
  });

  it('#reactive array changed', () => {
    class ClassArray {
      @prop() list: string[] = [];
      constructor() {
        observable(this);
      }
    }
    const instanceArray = new ClassArray();
    const tracker = Tracker.find(instanceArray, 'list');
    let changedTimes = 0;
    tracker?.changed(() => {
      changedTimes += 1;
    });
    assert((instanceArray.list as any)[ObservableSymbol.ObjectSelf]);
    instanceArray.list.push('a');
    instanceArray.list.pop();
    assert(instanceArray.list.length === 0);
    assert(changedTimes === 3);
  });
  it('#reactive map changed', done => {
    class Foo {
      @prop() map: Map<string, string> = new Map();
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const tracker = Tracker.find(foo, 'map');
    let changedTimes = 0;
    tracker?.changed(() => {
      changedTimes += 1;
      if (changedTimes === 4) {
        done();
      }
    });
    foo.map.set('a', 'a');
    const aValue = foo.map.get('a');
    assert(aValue === 'a');
    assert(foo.map.size === 1);
    foo.map.set('b', 'b');
    foo.map.delete('a');
    foo.map.clear();
  });

  it('#reactive plain object changed', done => {
    class Foo {
      @prop() map: Record<string, string> = {};
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    let changedTimes = 0;
    const tracker = Tracker.find(foo, 'map');

    tracker?.changed(() => {
      changedTimes += 1;
      if (changedTimes === 3) {
        done();
      }
    });
    assert((foo.map as any)[ObservableSymbol.ObjectSelf]);
    foo.map.a = 'a';
    assert(foo.map.a === 'a');
    foo.map.b = 'b';
    delete foo.map.b;
    assert(Object.keys(foo.map).length === 1);
  });
});
