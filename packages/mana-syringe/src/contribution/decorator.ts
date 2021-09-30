import type { Syringe } from '../core';
import { Contribution } from './contribution';
import { inject, named } from '../decorator';

export const contrib =
  (token: Syringe.Named) =>
  (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    targetKey: string,
    index?: number | undefined,
  ) => {
    named(token)(target, targetKey, index);
    inject(Contribution.Provider)(target, targetKey, index);
  };
