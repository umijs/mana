import 'regenerator-runtime/runtime';
import 'reflect-metadata';
import assert from 'assert';
import { getDesignType, ObservableProperties, Observability, InstanceValue } from './utils';
import { prop } from './decorator';
import { Disposable } from 'mana-common';
import { equals, ObservableSymbol } from '.';

describe('utils', () => {
  it('#Observability', () => {
    class Foo {
      info = '';
    }
    const foo = new Foo();
    const meta = 'meta';
    Observability.setDisposable(meta, Disposable.NONE, foo);
    Observability.setDisposable(meta, Disposable.NONE, foo, 'info');
    const toDispose = Observability.getDisposable(meta, foo);
    const toDispose1 = Observability.getDisposable(meta, foo, 'info');
    const fooProxy = new Proxy(foo, {
      get: (target, propertyKey) => {
        if (propertyKey === ObservableSymbol.Self) {
          return target;
        }
        return (target as any)[propertyKey];
      },
    });
    assert(toDispose === Disposable.NONE);
    assert(toDispose1 === Disposable.NONE);
    assert(Observability.getOrigin(fooProxy) === foo);
    assert(equals(fooProxy, foo));
    assert(Observability.getOrigin(null) === null);
    assert(!Observability.trackable(null));
    assert(!Observability.is(null, 'name'));
    assert(Observability.trackable({}));
    Observability.mark(foo, 'info');
    Observability.mark(foo);
    assert(Observability.is(foo, 'info'));
    assert(Observability.is(foo));
    assert(Observability.trackable(foo));
    assert(Observability.notifiable(foo, 'info'));
  });
  it('#ObservableProperties', () => {
    class ClassBasic {
      name = '';
    }
    class ClassBasic1 extends ClassBasic {
      name1 = '';
    }
    const instanceBasic = new ClassBasic();
    let properties = ObservableProperties.get(instanceBasic);
    assert(!properties);
    ObservableProperties.add(ClassBasic, 'name');
    properties = ObservableProperties.get(ClassBasic);
    assert(properties?.length === 1);
    assert(properties.includes('name'));
    ObservableProperties.add(ClassBasic1, 'name1');
    properties = ObservableProperties.get(ClassBasic1);
    assert(properties?.length === 2);
    assert(properties.includes('name1'));
    properties = ObservableProperties.get(instanceBasic);
    assert(!properties);
    assert(!ObservableProperties.find({}));
    assert(!ObservableProperties.find(null as any));
    const instanceProperties = ObservableProperties.find(instanceBasic) || [];
    assert(instanceProperties.includes('name'));
    instanceProperties.forEach(property => {
      ObservableProperties.add(instanceBasic, property);
    });
    properties = ObservableProperties.getOwn(instanceBasic);
    assert(properties?.length === 1);
  });

  it('#InstanceValue', () => {
    const foo = {};
    InstanceValue.set(foo, 'name', 'foo');
    assert(InstanceValue.get(foo, 'name') === 'foo');
  });
  it('#getDesignType', () => {
    class ClassBasic {
      @prop()
      name?: string;
      @prop()
      name1 = '';
      @prop()
      map?: Map<string, string>;
    }
    const instanceBasic = new ClassBasic();
    assert(getDesignType(instanceBasic, 'name') === String);
    assert(getDesignType(instanceBasic, 'name1') === Object);
    assert(getDesignType(instanceBasic, 'map') === Map);
  });
});
