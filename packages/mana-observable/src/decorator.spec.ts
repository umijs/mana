import assert from 'assert';
import { ObservableProperties } from './utils';
import { prop } from './decorator';

describe('decorator', () => {
  it('#prop', () => {
    class Foo {
      @prop()
      name?: string;
    }

    class FooExt extends Foo {
      @prop()
      info?: string;
    }
    class FooExtExt extends FooExt {}
    const foo = new Foo();
    const properties = ObservableProperties.getOwn(Foo);
    assert(properties?.length === 1 && properties.includes('name'));
    const extProperties = ObservableProperties.getOwn(FooExt);
    assert(extProperties?.length === 2 && extProperties.includes('info'));
    const extextProperties = ObservableProperties.get(FooExtExt);
    assert(extextProperties?.length === 2);
    const instanceProperties = ObservableProperties.find(foo);
    assert(instanceProperties?.length === 1 && instanceProperties.includes('name'));
  });
});
