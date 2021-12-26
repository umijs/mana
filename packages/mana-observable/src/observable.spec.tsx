import 'regenerator-runtime/runtime';
import 'react';
import { GlobalContainer } from 'mana-syringe';
import assert from 'assert';
import { defaultObservableContext } from './context';
import { observable } from './observable';
import { Tracker } from './tracker';
import { Observable, ObservableProperties } from './utils';
import { prop } from './decorator';
import { Reactable } from './reactivity';

describe('observable', () => {
  defaultObservableContext.config({
    getContainer: () => GlobalContainer,
  });
  it('#observable properties', () => {
    class ClassBasic {
      @prop() name: string = '';
      constructor() {
        observable(this);
      }
    }
    const instanceBasic = new ClassBasic();
    assert(ObservableProperties.get(instanceBasic)?.includes('name'));
    assert(Observable.is(instanceBasic, 'name'));
  });
  it('#extends properties', () => {
    class ClassBasic {
      @prop() name: string = '';
      name1: string = '';
      name2: string = '';
      constructor() {
        observable(this);
      }
    }
    class ClassBasic1 extends ClassBasic {
      @prop() name1: string = '';
      constructor() {
        super();
        observable(this);
      }
    }
    class ClassBasic2 extends ClassBasic1 {
      name1: string = '';
      @prop() name2: string = '';
      constructor() {
        super();
        observable(this);
      }
    }
    const instanceBasic = new ClassBasic();
    const instanceBasic1 = new ClassBasic1();
    const instanceBasic2 = new ClassBasic2();
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
      constructor() {
        observable(this);
      }
    }
    const instanceBasic = new ClassBasic();
    let changed = false;
    const tracker = Tracker.find(instanceBasic, 'name');
    tracker?.add(() => {
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
      constructor() {
        observable(this);
      }
    }
    const instanceArray = new ClassArray();
    let changed = false;
    if (Reactable.is(instanceArray.list)) {
      const reactor = Reactable.get(instanceArray.list);
      reactor.onChange(() => {
        changed = true;
      });
    }
    const tracker = Tracker.find(instanceArray, 'list');
    tracker?.add(() => {
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
      constructor() {
        observable(this);
      }
    }
    class Bar extends Foo {
      @prop() barName?: string;
      @prop() barInfo?: string;
      constructor() {
        super();
        observable(this);
      }
    }
    const bar = new Bar();
    let changed = false;
    const tracker = Tracker.find(bar, 'fooName');
    tracker?.add(() => {
      changed = true;
      assert(changed);
      done();
    });
    bar.fooName = 'foo name';
  });
});
