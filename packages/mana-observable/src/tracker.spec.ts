import assert from 'assert';
import { Trackable, Tracker } from './tracker';
import { prop } from './decorator';
import { Observability } from './utils';
describe('Tracker', () => {
  it('#trackable', () => {
    const originList: string[] = [];
    const originMap = new Map();
    const originObj = {};
    class Foo {
      @prop()
      list = originList;
      @prop()
      map = originMap;
      @prop()
      obj = originObj;
    }
    const foo = new Foo();
    const callback = () => {};
    const f = Tracker.track(foo, callback);
    const f1 = Tracker.track(foo, callback);
    assert(f === f1);
    assert(Trackable.is(f));
    assert(Observability.getOrigin(f) === foo);
    assert(Observability.getOrigin(f.list) === originList);
    assert(Observability.getOrigin(f.map) === originMap);
    assert(Observability.getOrigin(f.obj) === originObj);
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

  it('#track observable deep', () => {
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
    // bar.foo.info = 'foo';
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

  it('#track reactable array', () => {
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

  it('#track reactable map', () => {
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

  it('#track reactable object', () => {
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

  it('#track deep', () => {
    class Foo {
      @prop() info = '';
    }
    class Bar {
      foo = new Foo();
    }
    const info = { bar: new Bar() };
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const i = Tracker.track(info, reaction);
    i.bar.foo.info;
    i.bar.foo.info = 'foo';
    assert(changeTimes === 1);
  });

  it('#tracker transform', () => {
    assert(Tracker.tramsform(null as any, () => {}) === null);
  });

  it('#track plain object', () => {
    const info = { name: 'info', age: 18 };
    let changeTimes: number = 0;
    const reaction = () => {
      changeTimes += 1;
    };
    const i = Tracker.track(info, reaction);
    i.name = 'foo';
    assert(changeTimes === 1);
  });
  it('#track array', () => {
    const arr: any[] = ['track array'];
    let changeTimes: number = 0;
    const reaction = () => {
      Tracker.track(arr, reaction);
      changeTimes += 1;
    };
    const a = Tracker.track(arr, reaction);
    const a1 = Tracker.track(arr, reaction);
    assert(a === a1);
    a.push('a');
    a1.push('a1');
    const a2 = Tracker.track(arr, reaction);
    a2.push('a2');
    assert(changeTimes === 6);
  });

  it('#track map', () => {
    const map = new Map<string, string>();
    let changeTimes: number = 0;
    const reaction = () => {
      Tracker.track(map, reaction);
      changeTimes += 1;
    };
    const a = Tracker.track(map, reaction);
    const a1 = Tracker.track(map, reaction);
    assert(a === a1);
    a1.set('a', 'a');
    a1.set('a1', 'a1');
    assert(changeTimes === 2);
  });

  it('#track plainObject', () => {
    const obj: Record<string, any> = {};
    let changeTimes: number = 0;
    const reaction = () => {
      Tracker.track(obj, reaction);
      changeTimes += 1;
    };
    const a = Tracker.track(obj, reaction);
    const a1 = Tracker.track(obj, reaction);
    assert(a === a1);
    a.a = 'a';
    a1.a1 = 'a1';
    assert(changeTimes === 2);
  });

  it('#track plainObject deep', () => {
    const obj: Record<string, any> = {};
    obj.info = {};
    obj.arr = [];
    let changeTimes: number = 0;
    const reaction = () => {
      Tracker.track(obj, reaction);
      changeTimes += 1;
    };
    const a = Tracker.track(obj, reaction);
    const a1 = Tracker.track(obj, reaction);
    assert(a === a1);
    a.a = 'a';
    a1.info.a1 = 'a1';
    a1.arr.push('a');
    assert(changeTimes === 3);
  });
  it('#track plainObject deep with class instance', () => {
    class Foo {
      @prop() info = '';
      @prop() info1 = '';
    }
    const obj: Record<string, any> = {};
    obj.foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      const object = Tracker.track(obj, reaction);
      object.foo.info;
      changeTimes += 1;
    };
    const a = Tracker.track(obj, reaction);
    const a1 = Tracker.track(obj, reaction);
    a1.foo.info;
    assert(a === a1);
    a1.foo.info = 'a';
    a1.foo.info1 = 'a1';
    assert(changeTimes === 1);
  });

  it('#track class instance deep with arr', () => {
    class Bar {
      @prop() name: string = '';
    }
    class Foo {
      @prop() arr: Bar[] = [];
    }
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      const trackable = Tracker.track(foo, reaction);
      trackable.arr.forEach(item => item.name);
      changeTimes += 1;
    };
    const a = Tracker.track(foo, reaction);
    const a1 = Tracker.track(foo, reaction);
    assert(a === a1);
    a.arr.forEach(item => item.name);
    a.arr.push(new Bar()); // 2
    a1.arr.push(new Bar()); // 2
    a.arr[0].name = 'a'; // 1
    assert(changeTimes === 5);
  });

  it('#track class instance with normal arr', () => {
    class Foo {
      arr: string[] = [];
    }
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      const trackable = Tracker.track(foo, reaction);
      trackable.arr;
      changeTimes += 1;
    };
    const a = Tracker.track(foo, reaction);
    const a1 = Tracker.track(foo, reaction);
    assert(a === a1);
    a.arr.push('a'); // 2
    a1.arr.push('b'); // 2
    assert(changeTimes === 0);
  });

  it('#track class instance with normal arr', () => {
    class Foo {
      map = new Map<string, string>();
      getArr() {
        return this.map;
      }
    }
    const foo = new Foo();
    let changeTimes: number = 0;
    const reaction = () => {
      const trackable = Tracker.track(foo, reaction);
      trackable.getArr();
      changeTimes += 1;
    };
    const a = Tracker.track(foo, reaction);
    const a1 = Tracker.track(foo, reaction);
    assert(a === a1);
    a.getArr().set('a', 'a');
    a1.getArr().set('a1', 'a1');
    const valueA = a1.getArr().get('a');
    assert(changeTimes === 0);
    assert(valueA === 'a');
  });
});
