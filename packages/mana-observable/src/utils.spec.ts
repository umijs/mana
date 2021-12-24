import 'regenerator-runtime/runtime';
import 'reflect-metadata';
import assert from 'assert';
import {
  getDesignType,
  getObservableProperties,
  getOwnObservableProperties,
  markObservableProperty,
  setConstructorProperties,
} from './utils';
import { prop } from './decorator';

describe('utils', () => {
  it('#observable properties', () => {
    class ClassBasic {
      name = '';
      name1 = '';
    }
    class ClassBasic1 extends ClassBasic {}
    const instanceBasic = new ClassBasic();
    let properties = getObservableProperties(instanceBasic);
    assert(!properties);
    markObservableProperty(ClassBasic, 'name');
    properties = getObservableProperties(ClassBasic);
    assert(properties?.length === 1);
    assert(properties.includes('name'));
    markObservableProperty(ClassBasic1, 'name1');
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
