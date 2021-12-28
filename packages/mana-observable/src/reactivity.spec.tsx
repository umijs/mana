/* eslint-disable @typescript-eslint/no-explicit-any */
import 'regenerator-runtime/runtime';
import 'react';
import assert from 'assert';
import { Reactable } from './reactivity';
import { isPlainObject } from 'mana-common';
import { Observability } from './utils';

describe('reactivity', () => {
  it('#can be reactable', () => {
    class Foo {}
    const a = new Foo();
    assert(!Reactable.canBeReactable(a));
    assert(!Reactable.canBeReactable(null));
    assert(!Reactable.canBeReactable(undefined));
    assert(Reactable.canBeReactable([]));
    assert(Reactable.canBeReactable({}));
    assert(Reactable.canBeReactable(new Map()));
    const [arrValue] = Reactable.transform([]);
    assert(Reactable.canBeReactable(arrValue));
  });
  it('#transform base', () => {
    const [tValue, reactor] = Reactable.transform(undefined);
    assert(tValue === undefined);
    assert(reactor === undefined);
    const arr = ['a'];
    const [arrValue, arrReactor] = Reactable.transform(arr);
    const [arrValue1, arrReactor1] = Reactable.transform(arr);
    assert(arrReactor);
    assert(arrValue !== arr);
    assert(arrReactor?.value === arr);
    assert(arrValue1 === arrValue);
    assert(arrReactor1 === arrReactor);
    const [arrValue2, arrReactor2] = Reactable.transform(arrValue);
    assert(arrReactor === arrReactor2);
    assert(arrValue === arrValue2);
    class A {}
    const a = new A();
    const [objValue, objReactor] = Reactable.transform(a);
    assert(!objReactor);
    assert(a === objValue);
  });

  it('#transform array', () => {
    const v: any[] = [];
    const [tValue] = Reactable.transform(v);
    assert(tValue instanceof Array);
    assert(Reactable.is(tValue));
    assert(Observability.getOrigin(tValue) === v);
  });

  it('#transform map', () => {
    const v: Map<string, string> = new Map();
    const [tValue] = Reactable.transform(v);
    assert(tValue instanceof Map);
    assert(Reactable.is(tValue));
    assert(Observability.getOrigin(tValue) === v);
  });

  it('#transform plain object', () => {
    const v = {};
    const [tValue] = Reactable.transform(v);
    assert(isPlainObject(tValue));
    assert(Reactable.is(tValue));
    assert(Observability.getOrigin(tValue) === v);
  });

  it('#reactable array', () => {
    const v: any[] = [];
    const [tValue, reactor] = Reactable.transform(v);
    let changedTimes = 0;
    if (reactor) {
      reactor.onChange(() => {
        changedTimes += 1;
      });
    }
    // Pushing brings changes, one is the set value and the other is the set length
    tValue.push('a');
    tValue.pop();
    assert(tValue.length === 0);
    assert(changedTimes === 3);
  });
  it('#reactable map', () => {
    const v: Map<string, string> = new Map();
    const [tValue, reactor] = Reactable.transform(v);
    let changedTimes = 0;
    if (reactor) {
      reactor.onChange(() => {
        changedTimes += 1;
      });
    }
    tValue.set('a', 'a');
    const aValue = tValue.get('a');
    assert(aValue === 'a');
    assert(tValue.size === 1);
    tValue.set('b', 'b');
    tValue.delete('a');
    tValue.clear();
    assert(changedTimes === 4);
  });

  it('#reactable plain object', () => {
    const v = {};
    const [tValue, reactor] = Reactable.transform(v);
    let changedTimes = 0;
    if (reactor) {
      reactor.onChange(() => {
        changedTimes += 1;
      });
    }
    tValue.a = 'a';
    assert(tValue.a === 'a');
    tValue.b = 'b';
    delete tValue.b;
    assert(changedTimes === 3);
  });
});
