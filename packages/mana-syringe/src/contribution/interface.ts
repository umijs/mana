import { Syringe } from '../core';

export interface ContributionProviderOption {
  /**
   * collected from the parent containers
   */
  recursive?: boolean;
  /**
   * use cache
   */
  cache?: boolean;
}

export const ContributionProvider = Syringe.defineToken('ContributionProvider');
export type ContributionProvider<T extends Record<string, any>> = {
  getContributions: (option?: ContributionProviderOption) => T[];
};
