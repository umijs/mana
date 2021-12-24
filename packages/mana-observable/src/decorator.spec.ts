import assert from 'assert';
import { getOwnObservableProperties, getObservableProperties } from './utils';
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
    const p = getOwnObservableProperties(Foo.prototype);
    assert(p?.length === 1 && p.includes('name'));
    const extp = getOwnObservableProperties(ExtFoo.prototype);
    assert(extp?.length === 2 && extp.includes('info'));
    const ps = getObservableProperties(ExtFoo.prototype);
    assert(ps?.length === 2);
  });
});
