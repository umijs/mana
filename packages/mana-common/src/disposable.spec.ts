import assert from 'assert';
import { Disposable } from './';
import { DisposableCollection } from './';

console.warn = () => {};
console.log = () => {};
console.error = () => {};
describe('Disposable', () => {
  it('#Disposable is', () => {
    assert(Disposable.is({ dispose: () => {} }));
  });
  it('#Disposable create', () => {
    let disposed = false;
    const disposable = Disposable.create(() => {
      disposed = true;
    });
    disposable.dispose();
    assert(disposed);
  });

  it('#Disposable collection', done => {
    let disposeTimes = 0;
    let disposed = false;
    const collection = new DisposableCollection(
      Disposable.create(() => {
        disposeTimes += 1;
      }),
    );
    collection.push(
      Disposable.create(() => {
        disposeTimes += 1;
      }),
    );
    collection.pushAll([
      Disposable.create(() => {
        disposeTimes += 1;
      }),
    ]);
    collection.onDispose(() => {
      disposed = true;
      assert(disposed);
      done();
    });
    collection.dispose();
    assert(disposeTimes === 3);
  });

  it('#Disposable collection error disposable', () => {
    let disposeTimes = 0;
    const collection = new DisposableCollection(
      Disposable.create(() => {
        disposeTimes += 1;
        throw new Error('Disposable collection error disposable');
      }),
    );
    collection.dispose();
    collection.dispose();
    assert(disposeTimes === 1);
  });

  it('#Disposable collection dispose add', () => {
    let disposed = false;
    const collection = new DisposableCollection();

    const disposable = collection.push(
      Disposable.create(() => {
        disposed = true;
        throw new Error('Disposable collection error disposable');
      }),
    );
    disposable.dispose();
    collection.dispose();
    assert(!disposed);
  });
});
