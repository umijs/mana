import 'regenerator-runtime/runtime';
import 'react';
import assert from 'assert';
import { observable } from './observable';
import { Notifier } from './notifier';
import { Observability, ObservableProperties } from './utils';
import { prop } from './decorator';
import { Reactable } from './reactivity';

describe('observable', () => {
  it('#observable properties', () => {
    class Foo {
      @prop() name: string = '';
    }
    const foo = observable(new Foo());
    const instanceBasic = observable(foo);
    const nullInstance = observable(null as any);
    assert(!Observability.is(nullInstance));
    assert(Observability.is(instanceBasic));
    assert(Observability.is(instanceBasic, 'name'));
    assert(ObservableProperties.get(instanceBasic)?.includes('name'));
  });
  it('#extends properties', () => {
    class ClassBasic {
      @prop() name: string = '';
      name1: string = '';
      name2: string = '';
    }
    class ClassBasic1 extends ClassBasic {
      @prop() name1: string = '';
    }
    class ClassBasic2 extends ClassBasic1 {
      name1: string = '';
      @prop() name2: string = '';
    }
    const instanceBasic = observable(new ClassBasic());
    const instanceBasic1 = observable(new ClassBasic1());
    const instanceBasic2 = observable(new ClassBasic2());
    assert(ObservableProperties.get(instanceBasic)?.includes('name'));
    assert(ObservableProperties.get(instanceBasic)?.length === 1);
    assert(ObservableProperties.get(instanceBasic1)?.includes('name'));
    assert(ObservableProperties.get(instanceBasic1)?.includes('name1'));
    assert(ObservableProperties.get(instanceBasic1)?.length === 2);
    assert(ObservableProperties.get(instanceBasic2)?.includes('name'));
    assert(ObservableProperties.get(instanceBasic2)?.includes('name1'));
    assert(ObservableProperties.get(instanceBasic2)?.includes('name2'));
    assert(ObservableProperties.get(instanceBasic2)?.length === 3);
  });
  it('#basic usage', () => {
    class ClassBasic {
      @prop() name: string = '';
    }
    const instanceBasic = observable(new ClassBasic());
    let changed = false;
    const tracker = Notifier.find(instanceBasic, 'name');
    tracker?.onChange(() => {
      changed = true;
    });
    instanceBasic.name = 'a';
    instanceBasic.name = 'b';
    assert(instanceBasic.name === 'b');
    assert(changed);
  });
  it('#array usage', () => {
    class ClassArray {
      @prop() list: string[] = [];
    }
    const instanceArray = observable(new ClassArray());
    instanceArray.list = instanceArray.list;
    instanceArray.list = [];
    let changed = false;
    if (Reactable.is(instanceArray.list)) {
      const reactor = Reactable.getReactor(instanceArray.list);
      reactor.onChange(() => {
        changed = true;
      });
    }
    const tracker = Notifier.find(instanceArray, 'list');
    tracker?.onChange(() => {
      changed = true;
    });
    instanceArray.list.push('');
    assert(changed);
    instanceArray.list = [];
    assert(instanceArray.list.length === 0);
  });

  it('#child class', done => {
    class Foo {
      @prop() fooName: string = 'foo';
    }
    class Bar extends Foo {
      @prop() barName?: string;
      @prop() barInfo?: string;
    }
    const bar = observable(new Bar());
    let changed = false;
    const tracker = Notifier.find(bar, 'fooName');
    tracker?.onChange(() => {
      changed = true;
      assert(changed);
      done();
    });
    bar.fooName = 'foo name';
  });

  it('#shared properties', () => {
    class Foo {
      @prop() list: string[] = [];
    }
    class Bar {
      @prop() list: string[] = [];
    }
    const foo = observable(new Foo());
    const bar = observable(new Bar());
    foo.list = bar.list;
    let changed = false;
    const notifier = Notifier.find(bar, 'list');
    notifier?.onChange(() => {
      changed = true;
    });
    foo.list.push('');
    assert(changed);
  });

  it('#observable reactbale', () => {
    const v: any[] = [];
    class Foo {}
    const foo = new Foo();
    const reactable = observable(v);
    const reactable1 = observable(reactable);
    const observableFoo = observable(foo);
    assert(Reactable.is(reactable));
    assert(Observability.is(v));
    assert(observableFoo === foo);
    let changed = false;
    const notifier = Notifier.find(reactable);
    notifier?.onChange(() => {
      changed = true;
    });
    reactable1.push('');
    assert(changed);
  });
});
