import 'regenerator-runtime/runtime';
import 'reflect-metadata';
import assert from 'assert';
import { getDesignType, ObservableProperties, Observable } from './utils';
import { prop } from './decorator';

describe('utils', () => {
  it('#Observable', () => {
    class Foo {
      info = '';
    }
    const foo = new Foo();
    ObservableProperties.add(Foo, 'name');
    assert(!Observable.tarckable(null));
    assert(!Observable.is(null, 'name'));
    assert(Observable.tarckable({}));
    Observable.mark(foo, 'info');
    assert(Observable.is(foo, 'info'));
  });
  it('#ObservableProperties', () => {
    class ClassBasic {
      name = '';
      name1 = '';
    }
    class ClassBasic1 extends ClassBasic {}
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
    ObservableProperties.setInstance(instanceBasic);
    properties = ObservableProperties.getOwn(instanceBasic);
    assert(properties?.length === 1);
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
