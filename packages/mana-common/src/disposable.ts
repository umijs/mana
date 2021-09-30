/* eslint-disable @typescript-eslint/no-explicit-any */
export type Disposable = {
  /**
   * Dispose this object.
   */
  dispose: () => void;
};
export namespace Disposable {
  export function is(arg: any): arg is Disposable {
    return (
      !!arg && typeof arg === 'object' && 'dispose' in arg && typeof arg.dispose === 'function'
    );
  }
  export function create(func: () => void): Disposable {
    return {
      dispose: func,
    };
  }

  export const NONE = create(() => {});
}
