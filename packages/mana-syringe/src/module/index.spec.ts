import assert from 'assert';
import { injectable, Module, GlobalContainer } from '..';

describe('module', () => {
  it('#load module', () => {
    @injectable()
    class Foo {}
    class Bar {}
    const module = Module(reg => {
      reg(Foo);
    }).register(Bar);
    GlobalContainer.load(module);
    const foo = GlobalContainer.get(Foo);
    assert(foo instanceof Foo);
  });

  it('#load module once', () => {
    @injectable()
    class Foo {}
    const module = Module(reg => {
      reg(Foo);
    });
    GlobalContainer.load(module);
    GlobalContainer.load(module);
    const foo = GlobalContainer.get(Foo);
    assert(foo instanceof Foo);
  });

  it('#force load module twice', () => {
    @injectable()
    class Foo {}
    const module = Module().register(Foo);
    GlobalContainer.load(module);
    GlobalContainer.load(module, true);
    try {
      GlobalContainer.get(Foo);
    } catch (ex) {
      assert(ex);
    }
  });
});
