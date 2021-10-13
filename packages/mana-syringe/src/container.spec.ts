import assert from 'assert';
import { register, GlobalContainer, Container } from './container';
import { singleton, transient, injectable } from './decorator';
import { Syringe } from './core';

describe('container', () => {
  describe('default', () => {
    it('#injectable register', () => {
      @injectable()
      class Injectable {}
      register(Injectable);
      const foo = GlobalContainer.get(Injectable);
      assert(foo instanceof Injectable);
    });
    it('#injectable child container', () => {
      const child = GlobalContainer.createChild();
      assert(child.parent === GlobalContainer);
    });
    it('#singleton register', () => {
      @singleton()
      class Singleton {}
      register(Singleton);
      const foo1 = GlobalContainer.get(Singleton);
      const foo2 = GlobalContainer.get(Singleton);
      assert(foo1 === foo2);
    });
    it('#transient register', () => {
      @transient()
      class Transient {}
      register(Transient, {});
      const foo1 = GlobalContainer.get(Transient);
      const foo2 = GlobalContainer.get(Transient);
      assert(foo1 !== foo2);
    });
    it('#option register', () => {
      @injectable()
      class Injectable {}
      register({ token: Injectable, useClass: Injectable });
      const foo = GlobalContainer.get(Injectable);
      assert(foo instanceof Injectable);
    });
    it('#isBound', () => {
      @injectable()
      class Injectable {}
      register({ token: Injectable, useClass: Injectable });
      assert(GlobalContainer.isBound(Injectable));
    });
    it('#rebind', () => {
      @injectable()
      class InjectableFoo {}
      register(InjectableFoo);
      assert(GlobalContainer.isBound(InjectableFoo));
      const childContainer = GlobalContainer.createChild();
      @injectable()
      class InjectableFoo1 extends InjectableFoo {}
      childContainer.register({ token: InjectableFoo, useClass: InjectableFoo1 });
      const instance = childContainer.get(InjectableFoo);
      assert(instance instanceof InjectableFoo1);
    });
    it('#token', () => {
      const TokenSymbol = Symbol('TokenSymbol');
      @singleton({ token: TokenSymbol })
      class Token {}
      register(Token);
      const foo1 = GlobalContainer.get(Token);
      const foo2 = GlobalContainer.get(TokenSymbol);
      assert(foo1 !== foo2);
    });
    it('#named token', () => {
      const TokenSymbol = Symbol('TokenSymbol');
      const named = 'named';
      @singleton({ token: [{ token: TokenSymbol, named }] })
      class Token {}
      register(Token);
      const foo1 = GlobalContainer.getNamed(TokenSymbol, named);
      const foo2 = GlobalContainer.get(Token);
      assert(foo1 !== foo2);
    });
    it('#named tokens', () => {
      const TokenSymbol = Symbol('TokenSymbol');
      const named = 'named';
      @singleton({ token: { token: TokenSymbol, named } })
      class Token {}
      register(Token);
      const foo1 = GlobalContainer.getNamed(TokenSymbol, named);
      const fooArray = GlobalContainer.getAllNamed(TokenSymbol, named);
      assert(fooArray.includes(foo1));
    });
    it('#array token', () => {
      const FooSymbol = Symbol('FooSymbol');
      const BarSymbol = Symbol('BarSymbol');
      @singleton({ token: [FooSymbol, BarSymbol] })
      class ArrayToken {}
      register(ArrayToken);
      const foo1 = GlobalContainer.get(ArrayToken);
      const foo2 = GlobalContainer.get(FooSymbol);
      const foo3 = GlobalContainer.get(BarSymbol);
      assert(foo1 !== foo2);
      assert(foo1 !== foo3);
      assert(foo3 !== foo2);
    });
    it('#undefined value', () => {
      const TokenSymbol = Symbol('UndefinedToken');
      register({ token: TokenSymbol, useValue: undefined });
      const foo1 = GlobalContainer.get(TokenSymbol);
      assert(typeof foo1 === 'undefined');
    });
    it('#get all', () => {
      const token = Syringe.defineToken('token');
      @singleton()
      class Foo {}
      @singleton()
      class Bar {}
      register(token, { useClass: [Foo, Bar] });
      const list = GlobalContainer.getAll(token);
      assert(list instanceof Array);
      assert(list.length === 2);
    });
    it('#get from parent', () => {
      const token = Syringe.defineToken('token');
      @singleton()
      class Foo {}
      const childContainer = GlobalContainer.createChild();
      @singleton()
      class Bar {}
      register(token, { useClass: Foo });
      childContainer.register(token, { useClass: Bar });
      const list = GlobalContainer.getAll(token);
      assert(list instanceof Array);
      assert(list.length === 1);
    });
    it('#mono token', () => {
      @singleton()
      class Foo {}
      @singleton()
      class Bar {}
      register(Bar, { useClass: [Foo] });
      const foo1 = GlobalContainer.get(Bar);
      assert(foo1 instanceof Foo);
    });
    it('#contrib', () => {
      const FooSymbol = Symbol('FooSymbol');
      @singleton({ contrib: FooSymbol })
      class Contrib {}
      register(Contrib);
      const foo1 = GlobalContainer.get(Contrib);
      const foo2 = GlobalContainer.get(FooSymbol);
      assert(foo1 === foo2);
    });
    it('#contrib with transient', () => {
      const FooSymbol = Symbol('FooSymbol');
      @transient({ contrib: FooSymbol })
      class ContribTransient {}
      register(ContribTransient);
      const foo1 = GlobalContainer.get(ContribTransient);
      const foo2 = GlobalContainer.get(FooSymbol);
      assert(foo1 === foo2);
    });
    it('#array contrib', () => {
      const FooSymbol = Symbol('FooSymbol');
      const BarSymbol = Symbol('BarSymbol');
      @singleton({ contrib: [FooSymbol, BarSymbol] })
      class ArrayContrib {}
      register(ArrayContrib);
      const foo1 = GlobalContainer.get(ArrayContrib);
      const foo2 = GlobalContainer.get(FooSymbol);
      assert(foo1 === foo2);
    });
    it('#remove', () => {
      @singleton()
      class Foo {}
      try {
        register(Foo);
        GlobalContainer.remove(Foo);
        GlobalContainer.get(Foo);
        assert(false);
      } catch (ex) {
        assert(true);
      }
    });
  });
  describe('basic', () => {
    it('#new container', () => {
      @injectable()
      class NewContainer {}
      const container = new Container();
      container.register(NewContainer);
      const foo = container.get(NewContainer);
      assert(foo instanceof NewContainer);
    });
    it('#global config', () => {
      Container.config({ lifecycle: Syringe.Lifecycle.singleton });
      @injectable()
      class GlobalConfig {}
      register(GlobalConfig);
      const foo1 = GlobalContainer.get(GlobalConfig);
      const foo2 = GlobalContainer.get(GlobalConfig);
      assert(foo1 === foo2);
    });
    it('#global config downgrade', () => {
      Container.config({});
      @injectable()
      class GlobalConfigDown {}
      register(GlobalConfigDown);
      const foo1 = GlobalContainer.get(GlobalConfigDown);
      const foo2 = GlobalContainer.get(GlobalConfigDown);
      assert(foo1 !== foo2);
    });
    it('#invalid register', () => {
      const InvalidSymbol = Symbol('InvalidSymbol');
      register(InvalidSymbol);
      let flag = true;
      try {
        GlobalContainer.get(InvalidSymbol);
      } catch (ex) {
        flag = false;
      }
      assert(!flag);
    });
    it('#invalid register empty', () => {
      const InvalidSymbol = Symbol('InvalidSymbol');
      register(InvalidSymbol);
      let flag = true;
      try {
        GlobalContainer.get(InvalidSymbol);
      } catch (ex) {
        flag = false;
      }
      assert(!flag);
    });
  });
});
