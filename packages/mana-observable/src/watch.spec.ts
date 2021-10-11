import 'reflect-metadata';
import 'regenerator-runtime/runtime';

import assert from 'assert';
import { prop, observable } from './observable';
import { watch } from './watch';
import { Disposable } from 'mana-common';

describe('watch', () => {
  it('#prop watch', done => {
    class Foo {
      @prop() name?: string;
      @prop() name1?: string;
      constructor() {
        observable(this);
      }
    }
    const newName = 'new name';
    let watchLatest: string | undefined;
    const foo = new Foo();
    watchLatest = foo.name;
    watch(foo, 'name', () => {
      watchLatest = foo.name;
      assert(watchLatest === newName);
      done();
    });
    foo.name = newName;
  });
  it('#prop object', done => {
    class Foo {
      @prop() name?: string;
      @prop() info?: string;
      constructor() {
        observable(this);
      }
    }
    let changed = 0;
    const newName = 'new name';
    let watchLatest: string | undefined;
    const foo = new Foo();
    watchLatest = foo.name;
    watch(foo, () => {});
    watch(foo, () => {
      changed += 1;
      watchLatest = foo.name;
      assert(watchLatest === newName);
      if (changed === 2) {
        done();
      }
    });
    foo.name = newName;
    foo.info = '';
  });
  it('#watch unobservable prop', done => {
    class Foo {
      @prop() name?: string;
      info?: string;
      constructor() {
        observable(this);
      }
    }
    const newName = 'new name';
    let watchLatest: string | undefined;
    const foo = new Foo();
    watchLatest = foo.info;
    watch(foo, 'info', () => {
      watchLatest = foo.info;
      done();
    });
    foo.info = newName;
    watch(foo, 'name', () => {
      assert(watchLatest !== newName);
      done();
    });
    foo.name = newName;
  });

  it('#invalid watch', () => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const toDispose = (watch as any)(foo, 'name');
    assert(toDispose === Disposable.NONE);
  });
});
