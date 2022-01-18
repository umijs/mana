import 'reflect-metadata';
import 'regenerator-runtime/runtime';

import assert from 'assert';
import { watch } from './watch';
import { Disposable } from 'mana-common';
import { prop } from './decorator';

console.warn = () => {};

describe('watch', () => {
  it('#watch prop', done => {
    class Foo {
      @prop() name?: string;
      @prop() name1?: string;
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
  it('#watch object', () => {
    class Foo {
      @prop() name?: string;
      @prop() info?: string;
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
    });
    foo.name = newName;
    foo.info = 'foo';
    assert(changed === 2);
  });
  it('#watch unobservable prop', done => {
    class Foo {
      @prop() name?: string;
      info?: string;
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
    }
    const foo = new Foo();
    const toDispose = (watch as any)(foo, 'name');
    const toDispose1 = watch(null, () => {});
    assert(toDispose === Disposable.NONE);
    assert(toDispose1 === Disposable.NONE);
  });
});
