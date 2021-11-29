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
  it('#tracker notify', done => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const tracker = Tracker.find(foo, 'name');
    tracker?.add(() => {
      done();
    });
    assert(!!Tracker.find(foo, 'name'));
    tracker?.notify(foo, 'name');
  });
  it('#tracker changed', done => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const tracker = Tracker.find(foo, 'name');
    tracker?.changed(() => {
      done();
    });
    assert(!!Tracker.find(foo, 'name'));
    tracker?.notify(foo, 'name');
  });
  it('#tracker once', done => {
    class Foo {
      @prop() name?: string;
      constructor() {
        observable(this);
      }
    }
    const foo = new Foo();
    const tracker = Tracker.find(foo, 'name');
    let times = 0;
    let once = 0;
    tracker?.once(() => {
      once += 1;
    });
    tracker?.changed(() => {
      times += 1;
      if (times == 2) {
        assert(once == 1);
        done();
      }
    });
    assert(!!Tracker.find(foo, 'name'));
    tracker?.notify(foo, 'name');
    tracker?.notify(foo, 'name');
  });
});
