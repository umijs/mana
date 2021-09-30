import 'regenerator-runtime/runtime';
import 'react';
import { GlobalContainer } from 'mana-syringe';
import assert from 'power-assert';
import { defaultObservableContext } from './context';
import { prop, observable } from './observable';
import { Tracker } from './tracker';

describe('observable', () => {
  defaultObservableContext.config({
    getContainer: () => GlobalContainer,
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
