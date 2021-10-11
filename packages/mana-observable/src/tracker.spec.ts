import 'regenerator-runtime/runtime';
import assert from 'assert';
import { prop, observable } from './observable';
import { Tracker } from './tracker';

describe('tarcker', () => {
  it('#create tracker', () => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    class Bar {
      name?: string;
    }
    const foo = new Foo();
    const bar = new Bar();
    Tracker.find(foo, 'name');
    assert(!!Tracker.find(foo, 'name'));
    assert(!Tracker.find(bar, 'name'));
  });
  it('#dispose tracker', () => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const tracker = Tracker.find(foo, 'name');
    tracker?.dispose();
    const newTracker = Tracker.find(foo, 'name');
    assert(tracker?.disposed && newTracker !== tracker);
  });
});
