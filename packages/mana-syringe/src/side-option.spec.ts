import assert from 'assert';
import { register, GlobalContainer } from './container';
import { singleton } from './decorator';
import { registerSideOption } from './side-option';

describe('side option', () => {
  it('#side register', () => {
    const side = (target: any) => {
      registerSideOption({ token: 'side', useValue: true }, target);
    };
    @side
    @singleton()
    class Foo {}
    register(Foo);
    const foo = GlobalContainer.get(Foo);
    const sideValue = GlobalContainer.get<boolean>('side');
    assert(foo instanceof Foo && sideValue === true);
  });
});
