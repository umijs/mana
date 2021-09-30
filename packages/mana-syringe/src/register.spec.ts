import assert from 'power-assert';
import { injectable } from 'inversify';
import { toRegistryOption } from './register';
import { Syringe, Utils } from './core';

describe('register helper', () => {
  describe('option parser', () => {
    it('#simple class', () => {
      @injectable()
      class Foo {}
      const parsed = toRegistryOption({
        token: Foo,
        useClass: Foo,
      });
      assert(parsed.token.length === 1);
      assert(parsed.token.includes(Foo));
      assert(parsed.useClass.length === 1);
      assert(parsed.useClass.includes(Foo));
      assert(parsed.lifecycle === Syringe.DefaultOption.lifecycle);
    });
    it('#simple token', () => {
      @injectable()
      class Foo {}
      const parsed = toRegistryOption({
        token: Foo,
        lifecycle: Syringe.Lifecycle.singleton,
      });
      assert(parsed.token.length === 1);
      assert(parsed.token.includes(Foo));
      assert(parsed.lifecycle === Syringe.Lifecycle.singleton);
    });
    it('#multiple', () => {
      @injectable()
      class Foo {}
      @injectable()
      class Bar {}
      const parsed = toRegistryOption({
        token: Foo,
        useClass: [Foo, Bar],
      });
      assert(parsed.token.length === 1);
      assert(parsed.token.includes(Foo));
      assert(parsed.useClass.length === 2);
      assert(parsed.useClass.includes(Foo));
      assert(parsed.useClass.includes(Bar));
    });
  });

  describe('error option', () => {
    it('#Named token can not be service to other tokens', () => {
      const named = 'named';
      @injectable()
      class Foo {}
      const parsed = toRegistryOption({
        token: { token: Foo, named },
      });
      assert(parsed.token.length === 1);
      assert(parsed.token.find(item => Utils.isNamedToken(item)));
      assert(parsed.lifecycle === Syringe.DefaultOption.lifecycle);
    });
  });
});
