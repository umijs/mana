# mana-common

Common utils for mana.

[![NPM version](https://img.shields.io/npm/v/mana-common.svg?style=flat)](https://npmjs.org/package/mana-common) [![NPM downloads](https://img.shields.io/npm/dm/mana-common.svg?style=flat)](https://npmjs.org/package/mana-common)

## 安装

```bash
npm i mana-common --save
```

## 用法

### 可销毁对象 Disposable

可销毁对象的定义，这里的销毁除有时候也代表撤销

```typescript
interface Disposable {
  /**
   * Dispose this object.
   */
  dispose: () => void;
}
```

提供了一些工具方法

```typescript
namespace Disposable {
  function is(arg: any): arg is Disposable; // 类型断言，判断是否为 Disposable 对象
  function create(func: () => void): Disposable; // 将方法创建为 Disposable 对象
  const NONE: Disposable; // 空的 Disposable 对象
}
```

#### 可销毁集合 DisposableCollection

可毁对象的集合

```typescript
constructor(...toDispose: Disposable[]) // 基于可销毁对象的列表创建
push(disposable: Disposable): Disposable // 加入一个可销毁对象
pushAll(disposable: Disposable[]): Disposable[] // 加入多个可销毁对象
get onDispose(): Event<void> // 监听集合的销毁事件
```

- 可销毁对象集合本身就是可销毁的，其销毁动作可以销毁几个内的所有对象。
- 可销毁对象的添加动作会返回一个可销毁对象，其销毁动作会撤销这些对象对集合的添加。
- 可销毁对象销毁事件的监听，也会返回一个可销毁对象，其销毁动作会撤销监听动作。

事件定义，通过 Emitter 定义和发起事件，通过 Event 订阅事件，一个常见的使用方式如下

### 事件订阅 Emitter Event

```typescript
class EventEmitter {
  protected emitter = new Emitter<void>();
  get onEventEmit(): Event<void> {
    return emitter.event;
  }
  emit() {
    emitter.fire();
  }
}
const emitter = new EventEmitter();
const disposable = emitter.onEventEmit(() => {});
```

可以方便的设置 Event 的 listener 限制

```typescript
emitter.onEventEmit.maxListeners = 10; // 默认为 0，即没有限制
```

可以遍历事件的订阅者, 返回 false 以中止遍历

```typescript
emitter.sequence(listener => {
  return true;
});
```

### 延迟取值 Deferred

作为 promise 的生成工具使用, 其定义非常简单，完整定义如下

```typescript
export class Deferred<T> {
  public resolve: (value: T | PromiseLike<T>) => void;
  public reject: (err?: any) => void;
  public readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
```

### 中止器 Cancellation

作为可中止操作的句柄使用，实际上中止器的作用并不是在函数的执行过程中中止执行，而是提供一个标志来判断是否被中止过，函数本身是会被调用完的.

- 执行结束后返回

```typescript
const source = new CancellationTokenSource();
const wait = async (cb: () => Promise<void>, token: CancellationToken): Promise<boolean> => {
  await cb();
  if (token.isCancellationRequested) {
    return false;
  }
  return true;
};
wait(() => {
  // do something
}, source.token);
source.cancel();
```

- 中止事立即返回

```typescript
const source = new CancellationTokenSource();
// 中止时返回
const wait = async (cb: () => Promise<void>, token: CancellationToken): Promise<boolean> => {
  const waitDeferred = new Deferred<boolean>();
  token.onCancellationRequested(() => {
    waitDeferred.resolve(false);
  });
  cb().then(() => {
    waitDeferred.resolve(true);
  });
  return waitDeferred.promise;
};
wait(() => {
  // do something
}, source.token);
source.cancel();
```

### 重试 retry

对于同一操作在出错的情况下多次重试, 可设置重试间隔和重试次数上限

```typescript
async function retry<T>(task: () => Promise<T>, delay: number, retries: number): Promise<T>;
```

### 超时 timeout

在程序中设置一个可取消的延迟

```typescript
function timeout(ms: number, token = CancellationToken.None): Promise<void>;
```
