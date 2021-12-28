import 'regenerator-runtime/runtime';
import assert from 'assert';
import { observable } from './observable';
import { Notifier } from './notifier';
import { prop } from './decorator';

describe('tarcker', () => {
  it('#create tracker', () => {
    class Foo {
      @prop() name?: string;
    }
    class Bar {
      name?: string;
    }
    const foo = observable(new Foo());
    const bar = new Bar();
    Notifier.find(foo, 'name');
    assert(Notifier.find(observable([])));
    assert(!!Notifier.find(foo, 'name'));
    assert(!Notifier.find(bar, 'name'));
  });

  it('#trigger', () => {
    class Foo {
      @prop() name?: string;
    }
    const foo = observable(new Foo());
    let changed = false;
    const notifier = Notifier.find(foo, 'name');
    notifier?.onChange(() => {
      changed = true;
    });
    Notifier.trigger(foo, 'name');
    assert(changed);
  });
  it('#dispose tracker', () => {
    class Foo {
      @prop() name?: string;
    }
    const foo = observable(new Foo());
    const tracker = Notifier.find(foo, 'name');
    tracker?.dispose();
    const newTracker = Notifier.find(foo, 'name');
    assert(tracker?.disposed && newTracker !== tracker);
  });
  it('#tracker notify', done => {
    class Foo {
      @prop() name?: string;
    }
    const foo = observable(new Foo());
    const tracker = Notifier.find(foo, 'name');
    tracker?.onChange(() => {
      done();
    });
    assert(!!Notifier.find(foo, 'name'));
    tracker?.notify(foo, 'name');
  });
  it('#tracker changed', done => {
    class Foo {
      @prop() name?: string;
    }
    const foo = observable(new Foo());
    const tracker = Notifier.find(foo, 'name');
    tracker?.onChange(() => {
      done();
    });
    assert(!!Notifier.find(foo, 'name'));
    tracker?.notify(foo, 'name');
  });
  it('#tracker once', done => {
    class Foo {
      @prop() name?: string;
    }
    const foo = observable(new Foo());
    const tracker = Notifier.find(foo, 'name');
    let times = 0;
    let once = 0;
    tracker?.once(() => {
      once += 1;
    });
    tracker?.onChange(() => {
      times += 1;
      if (times == 2) {
        assert(once == 1);
        done();
      }
    });
    assert(!!Notifier.find(foo, 'name'));
    tracker?.notify(foo, 'name');
    tracker?.notify(foo, 'name');
  });
});
