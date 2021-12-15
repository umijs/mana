import 'regenerator-runtime/runtime';
import 'reflect-metadata';
import assert from 'assert';
import {
  isObservable,
  getDesignType,
  getObservableProperties,
  getOwnObservableProperties,
  setObservableProperty,
  markObservable,
  setConstructorProperties,
} from './utils';
/**
 * Define observable property
 */
export function prop() {
  return (target: Record<string, any>, propertyKey: string) => {
    markObservable(target, propertyKey);
    setObservableProperty(target, propertyKey);
  };
}

describe('utils', () => {
  it('#markObservable', () => {
    class ClassBasic {
      @prop()
      name?: string;
    }
    const instanceBasic = new ClassBasic();
    assert(isObservable(ClassBasic.prototype, 'name'));
    assert(isObservable(instanceBasic, 'name'));
    assert(!isObservable(null));
  });
  it('#observable properties', () => {
    class ClassBasic {
      name = '';
      name1 = '';
    }
    class ClassBasic1 extends ClassBasic {}
    const instanceBasic = new ClassBasic();
    let properties = getObservableProperties(instanceBasic);
    assert(!properties);
    setObservableProperty(ClassBasic, 'name');
    properties = getObservableProperties(ClassBasic);
    assert(properties?.length === 1);
    assert(properties.includes('name'));
    setObservableProperty(ClassBasic1, 'name1');
    properties = getObservableProperties(ClassBasic1);
    assert(properties?.length === 2);
    assert(properties.includes('name1'));
    properties = getObservableProperties(instanceBasic);
    assert(!properties);
    setConstructorProperties(instanceBasic);
    properties = getOwnObservableProperties(instanceBasic);
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
