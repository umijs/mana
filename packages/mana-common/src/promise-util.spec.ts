import assert from 'assert';
import { timeout, retry } from './';
import { CancellationTokenSource } from './';
import { Deferred } from './';

describe('Promise util', () => {
  it('#timeout', async () => {
    const source = new CancellationTokenSource();
    const res = await timeout(50, source.token);
    assert(res === undefined);
  });
  it('#timeout cancel', done => {
    const source = new CancellationTokenSource();
    timeout(100, source.token).catch(ex => {
      assert(!!ex);
      done();
    });
    setTimeout(() => {
      source.cancel();
    }, 50);
  });
  it('#restry', async () => {
    let errorTime = 0;
    let retryTimes = 0;
    const task = async () => {
      const deferred = new Deferred<void>();
      setTimeout(() => {
        if (errorTime < 2) {
          deferred.reject();
          errorTime += 1;
          retryTimes += 1;
        } else {
          retryTimes += 1;
          deferred.resolve();
        }
      }, 50);
      return deferred.promise;
    };
    await retry(task, 50, 3);
    assert(retryTimes === 3);
  });
  it('#restry last error', async () => {
    let errorTime = 0;
    const start = new Date().getTime();
    const task = async () => {
      const deferred = new Deferred<void>();
      setTimeout(() => {
        if (errorTime < 4) {
          deferred.reject();
          errorTime += 1;
        } else {
          deferred.resolve();
        }
      }, 50);
      return deferred.promise;
    };
    try {
      await retry(task, 50, 3);
    } catch (ex) {
      const end = new Date().getTime();
      assert(end - start > 300);
      assert(end - start < 400);
    }
  });
});
