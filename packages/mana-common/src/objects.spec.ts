import assert from 'assert';
import { getPropertyDescriptor } from './objects';

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
});
