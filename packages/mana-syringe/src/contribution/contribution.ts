import { Syringe } from '../core';
import type { ContributionProviderOption } from './interface';
import { ContributionProvider } from './interface';
import { DefaultContributionProvider } from './provider';

export namespace Contribution {
  export type Provider<T extends Record<string, any>> = ContributionProvider<T>;
  export const Provider = ContributionProvider;
  export function register(
    registerMethod: Syringe.Register,
    identifier: Syringe.DefinedToken,
    option?: ContributionProviderOption,
  ): void {
    registerMethod({
      token: { token: Contribution.Provider, named: identifier },
      useDynamic: ctx => {
        return new DefaultContributionProvider(identifier, ctx.container, option);
      },
      lifecycle: Syringe.Lifecycle.singleton,
    });
  }
}
