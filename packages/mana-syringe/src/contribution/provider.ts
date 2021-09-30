import type { Syringe } from '../core';
import type { ContributionProvider, ContributionProviderOption } from './interface';

export class DefaultContributionProvider<T extends Record<string, any>>
  implements ContributionProvider<T>
{
  protected option: ContributionProviderOption = { recursive: false, cache: true };
  protected services: T[] | undefined;
  protected readonly serviceIdentifier: Syringe.Token<T>;
  protected readonly container: Syringe.Container;
  constructor(
    serviceIdentifier: Syringe.Token<T>,
    container: Syringe.Container,
    option?: ContributionProviderOption,
  ) {
    this.container = container;
    this.serviceIdentifier = serviceIdentifier;
    if (option) {
      this.option = { ...this.option, ...option };
    }
  }

  protected setServices(recursive: boolean): T[] {
    const currentServices: T[] = [];
    let currentContainer: Syringe.Container | undefined = this.container;
    while (currentContainer) {
      if (currentContainer.isBound(this.serviceIdentifier)) {
        const list = currentContainer.getAll(this.serviceIdentifier);
        currentServices.push(...list);
      }
      currentContainer = recursive ? currentContainer.parent : undefined;
    }
    return currentServices;
  }

  getContributions(option: ContributionProviderOption = {}): T[] {
    const { cache, recursive } = { ...this.option, ...option };
    if (!cache || this.services === undefined) {
      this.services = this.setServices(!!recursive);
    }
    return this.services;
  }
}
