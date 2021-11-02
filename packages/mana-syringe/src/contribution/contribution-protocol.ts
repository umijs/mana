import { Syringe } from '../core';

export type Option = {
  /**
   * collected from the parent containers
   */
  recursive?: boolean;
  /**
   * use cache
   */
  cache?: boolean;
};
export type Provider<T extends Record<string, any>> = {
  getContributions: (option?: Option) => T[];
};
export const Provider = Syringe.defineToken('ContributionProvider');
