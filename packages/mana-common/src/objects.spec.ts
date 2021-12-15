import assert from 'assert';
import { getPropertyDescriptor, isPlainObject } from './objects';

describe('Objects', () => {
  it('#getPropertyDescriptor', () => {
    class A {
      get a() {
        return 0;
      }
    }
    class B extends A {
      b = 1;
    }
    class C extends B {
      get a(): number {
        return 2;
      }
    }
    const objA = new A();
    const objB = new B();
    const objC = new C();
    let desc = getPropertyDescriptor(objA, 'a');
    assert(desc?.get && desc.get() === 0);
    desc = getPropertyDescriptor(objB, 'a');
    assert(desc?.get && desc.get() === 0);
    desc = getPropertyDescriptor(objB, 'b');
    assert(!desc?.get);
    desc = getPropertyDescriptor(objC, 'a');
    assert(desc?.get && desc.get() === 2);
  });
  it('#isPlainObject', () => {
    class A {}
    class B extends A {}
    const objA = new A();
    const objB = new B();
    assert(isPlainObject({}));
    assert(isPlainObject(Object.getPrototypeOf({})));
    assert(!isPlainObject(global));
    assert(!isPlainObject(objA));
    assert(!isPlainObject(objB));
    assert(!isPlainObject(null));
  });
});
