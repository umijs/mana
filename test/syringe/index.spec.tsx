import assert from 'assert';
import {
  Module,
  contrib,
  Contribution,
  Syringe,
  register,
  GlobalContainer,
  Container,
  singleton,
  transient,
  injectable,
} from 'mana-syringe';
import { Container as InversifyContainer } from 'inversify';

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
    it('#contrib to mono/multi token', () => {
      const FooSymbol = Symbol('FooSymbol');
      const BarSymbol = Syringe.defineToken('BarSymbol');
      register({ token: FooSymbol, useValue: FooSymbol });
      register({ token: BarSymbol, useValue: undefined });
      @singleton({ contrib: [FooSymbol, BarSymbol] })
      class FooContribToMonoMulti {}
      register(FooContribToMonoMulti);
      const obj = GlobalContainer.get(FooContribToMonoMulti);
      const objFoo = GlobalContainer.get(FooSymbol);
      const barList = GlobalContainer.getAll(BarSymbol);
      assert(obj === objFoo);
      assert(barList.includes(objFoo));
      assert(barList.includes(undefined));
      assert(barList.length === 2);
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
    it('#remove contrib', () => {
      const FooSymbol = Syringe.defineToken('FooSymbol');
      @singleton({ contrib: FooSymbol })
      class FooContribution {}
      @singleton({ contrib: FooSymbol })
      class BarContribution {}
      register(FooContribution);
      register(BarContribution);
      const contribs = GlobalContainer.getAll(FooSymbol);
      assert(contribs.length === 2);
      assert(contribs[0] instanceof FooContribution);
      GlobalContainer.remove(FooSymbol);
      assert(!GlobalContainer.isBound(FooSymbol));
      register(FooContribution);
      const emptyContribs = GlobalContainer.getAll(FooSymbol);
      assert(emptyContribs.length === 1);
    });

    it('#remove contrib in module', () => {
      const FooSymbol = Syringe.defineToken('FooSymbol');
      @singleton({ contrib: FooSymbol })
      class FooContribution {}
      @singleton({ contrib: FooSymbol })
      class BarContribution {}

      @singleton()
      class Foo {
        constructor(@contrib(FooSymbol) public provider: Contribution.Provider<Record<any, any>>) {}
      }
      const baseModule = Module().register(Foo).contribution(FooSymbol);
      const fooModule = Module(reg => {
        reg(FooContribution);
      });
      const barModule = Module(reg => {
        reg(BarContribution);
      });
      GlobalContainer.load(baseModule);
      GlobalContainer.load(fooModule);
      const foo = GlobalContainer.get(Foo);
      const contribs = foo.provider.getContributions();
      assert(contribs.length === 1);
      assert(contribs[0] instanceof FooContribution);
      GlobalContainer.unload(fooModule);
      const toDispose = GlobalContainer.load(barModule);
      const newContribs = foo.provider.getContributions({ cache: false });
      assert(newContribs.length === 1);
      assert(newContribs[0] instanceof BarContribution);
      toDispose.dispose();
      const emptyContribs = foo.provider.getContributions({ cache: false });
      assert(emptyContribs.length === 0);
    });
  });
  describe('basic', () => {
    it('#new container', () => {
      @injectable()
      class NewFoo {}
      const ctn = new InversifyContainer();
      const container = Container.getContainer(ctn);
      const cachedContainer = Container.getContainer(ctn);
      const fooContainer = new Container();
      assert(cachedContainer === container);
      assert(cachedContainer !== fooContainer);
      container.register(NewFoo);
      const foo = container.get(NewFoo);
      assert(foo instanceof NewFoo);
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
