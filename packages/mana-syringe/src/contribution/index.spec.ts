/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';
import assert from 'assert';
import { GlobalContainer } from '../container';
import { register } from '../container';
import { inject, singleton } from '../decorator';
import { Contribution, contrib } from '../';
import { DefaultContributionProvider } from './contribution-provider';
import { Syringe } from '../core';

describe('contribution', () => {
  it('#register contribution', () => {
    const FooContribution = Syringe.defineToken('FooContribution');
    Contribution.register(register, FooContribution);
    const provider = GlobalContainer.getNamed(Contribution.Provider, FooContribution);
    assert(provider instanceof DefaultContributionProvider);
    assert(GlobalContainer.isBoundNamed(Contribution.Provider, FooContribution));
  });
  it('#contrib decorator', () => {
    const FooContribution = Syringe.defineToken('FooContribution');
    const BarContribution = Syringe.defineToken('BarContribution');
    Contribution.register(register, FooContribution);
    @singleton({ contrib: FooContribution })
    class Foo {}
    @singleton({ contrib: [FooContribution, BarContribution] })
    class Foo1 {}
    register(Foo);
    register(Foo1);
    @singleton()
    class Bar {
      constructor(
        @contrib(FooContribution) public contribs: Contribution.Provider<any>,
        @inject(BarContribution) public bar: Contribution.Provider<any>,
      ) {}
    }
    register(Bar);

    const bar = GlobalContainer.get(Bar);
    const list = bar.contribs.getContributions();
    assert(bar.bar instanceof Foo1);
    assert(list.length === 2);
    assert(list.find(item => item instanceof Foo));
  });
  it('#contribution option', () => {
    const FooContribution = Syringe.defineToken('FooContribution');
    @singleton({ contrib: FooContribution })
    class Foo {}
    register(Foo);
    const childContainer = GlobalContainer.createChild();
    Contribution.register(childContainer.register.bind(childContainer), FooContribution, {
      cache: true,
    });
    @singleton()
    class Bar {
      constructor(@contrib(FooContribution) public pr: Contribution.Provider<any>) {}
    }
    childContainer.register(Bar);
    const bar = childContainer.get(Bar);
    const list = bar.pr.getContributions();
    @singleton({ contrib: FooContribution })
    class Foo1 {}
    childContainer.register(Foo1);
    assert(list.length === 1);
    assert(list.find(item => item instanceof Foo));
    const cachelist = bar.pr.getContributions();
    assert(list === cachelist);
    const newlist = bar.pr.getContributions({ cache: false });
    assert(list !== newlist && newlist.length === 1);
    assert(newlist.find(item => item instanceof Foo1));
    const all = bar.pr.getContributions({ recursive: true, cache: false });
    assert(all !== newlist && all.length === 2);
    assert(all.find(item => item instanceof Foo));
    assert(all.find(item => item instanceof Foo1));
  });
});
