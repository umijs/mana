import assert from 'assert';
import { ObservableProperties } from './utils';
import { prop } from './decorator';

describe('decorator', () => {
  it('#prop', () => {
    class Foo {
      @prop()
      name?: string;
    }

    class ExtFoo extends Foo {
      @prop()
      info?: string;
    }
    const p = ObservableProperties.getOwn(Foo.prototype);
    assert(p?.length === 1 && p.includes('name'));
    const extp = ObservableProperties.getOwn(ExtFoo.prototype);
    assert(extp?.length === 2 && extp.includes('info'));
    const ps = ObservableProperties.get(ExtFoo.prototype);
    assert(ps?.length === 2);
  });
});
