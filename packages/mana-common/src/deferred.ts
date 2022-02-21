/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

const noop = () => {};

export class Deferred<T> {
  public resolve: (value: T | PromiseLike<T>) => void = noop;
  public reject: (err?: any) => void = noop;
  public readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
