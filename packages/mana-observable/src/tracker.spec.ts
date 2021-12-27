import 'regenerator-runtime/runtime';
import assert from 'assert';
import { Trackable, Tracker } from './tracker';
import { prop } from './decorator';
describe('Tracker', () => {
  it('#trackable', () => {
    class Foo {}
    const foo = new Foo();
    const f = Tracker.track(foo, () => {});
    assert(Trackable.is(f));
    assert(Trackable.tryGetOrigin(f) === foo);
    assert(null === Trackable.tryGetOrigin(null));
  });
  it('#track basic', () => {
    class Foo {
      @prop() info = '';
    }
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const f = Tracker.track(foo, reaction);
    f.info;
    f.info = 'foo';
    assert(f !== foo);
    assert(Trackable.tryGetOrigin(f) === foo);
    assert(Tracker.track(null as any, () => {}) === null);
    const empty = {};
    assert(Tracker.track(empty, () => {}) !== empty);
    const f1 = Tracker.track(f, reaction);
    f1.info;
    f1.info = 'foo1';
    assert(changeTimes === 2);
  });

  it('#track deep', () => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      foo = new Foo();
    }
    const bar = new Bar();
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const b = Tracker.track(bar, reaction);
    b.foo.info;
    b.foo.info = 'foo';
    assert(changeTimes === 1);
  });

  it('#track by function', () => {
    class Foo {
      @prop() info = '';
      @prop() info1 = '';
      get infoLength() {
        return this.info.length;
      }
      getInfoLength() {
        return this.info1.length;
      }
    }
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const f = Tracker.track(foo, reaction);
    f.infoLength;
    f.info = 'foo';
    f.getInfoLength();
    f.info1 = 'foo1';
    assert(changeTimes === 2);
  });

  it('#tracker by reactable array', () => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      @prop() list: Foo[] = [];
    }
    const bar = new Bar();
    const foo = new Foo();
    bar.list.push(foo);
    bar.list.push(new Foo());
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const b = Tracker.track(bar, reaction);
    b.list.filter(item => item.info.length > 0);
    foo.info = 'foo';
    assert(changeTimes === 1);
  });

  it('#tracker by reactable map', () => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      @prop() map = new Map<string, Foo | undefined>();
    }
    const bar = new Bar();
    const foo = new Foo();
    bar.map.set('foo', foo);
    bar.map.set('empty', undefined);
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const b = Tracker.track(bar, reaction);
    for (const key of b.map.keys()) {
      b.map.get(key)?.info;
    }
    foo.info = 'foo';
    assert(changeTimes === 1);
  });

  it('#tracker by reactable object', () => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      @prop() obj: { foo?: Foo; bar: Foo | undefined } = { foo: undefined, bar: undefined };
    }
    const bar = new Bar();
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const b = Tracker.track(bar, reaction);
    b.obj.bar?.info;
    bar.obj.foo = foo;
    b.obj.foo && b.obj.foo.info;
    foo.info = 'foo';
    assert(changeTimes === 2);
  });

  it('#tracker transform', () => {
    assert(Tracker.tramsform(null as any, () => {}) === null);
  });
});
