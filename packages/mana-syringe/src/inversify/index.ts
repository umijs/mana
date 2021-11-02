import type { interfaces } from 'inversify';
import { Container } from 'inversify';
import { Syringe, Utils } from '../core';
import type { InversifyContext } from './inversify-protocol';

export function bindSingleton<T>(
  toBind: interfaces.BindingInSyntax<T>,
): interfaces.BindingWhenOnSyntax<T> {
  return toBind.inSingletonScope();
}

export function bindTransient<T>(
  toBind: interfaces.BindingInSyntax<T>,
): interfaces.BindingWhenOnSyntax<T> {
  return toBind.inTransientScope();
}
export function bindLifecycle<T>(
  toBind: interfaces.BindingInSyntax<T>,
  option: Syringe.FormattedInjectOption<T>,
): interfaces.BindingWhenOnSyntax<T> {
  if (option.lifecycle === Syringe.Lifecycle.singleton) {
    return bindSingleton(toBind);
  }
  return bindTransient(toBind);
}

export function bindNamed<T>(
  toBind: interfaces.BindingWhenOnSyntax<T>,
  named: Syringe.Named,
): void {
  toBind.whenTargetNamed(namedToIdentifier(named));
}

export function bindGeneralToken<T>(
  token: interfaces.ServiceIdentifier<T>,
  context: InversifyContext,
): interfaces.BindingToSyntax<T> {
  return context.container.bind(tokenToIdentifier(token));
}
export function bindMonoToken<T>(
  token: interfaces.ServiceIdentifier<T>,
  context: InversifyContext,
): interfaces.BindingToSyntax<T> {
  const { parent } = context.container;
  const bindFromParent = parent && parent.isBound(tokenToIdentifier(token));
  if (context.container.isBound(tokenToIdentifier(token)) && !bindFromParent) {
    return context.container.rebind(tokenToIdentifier(token));
  }
  return context.container.bind(tokenToIdentifier(token));
}

export function isInversifyContext(data: Record<any, any>): data is InversifyContext {
  return data && typeof data === 'object' && 'container' in data && 'inversify' in data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function namedToIdentifier(named: Syringe.Named): string | symbol {
  if (Utils.isDefinedToken(named)) {
    return named.symbol;
  }
  return named;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tokenToIdentifier<T = any>(
  token: Syringe.Token<T>,
): interfaces.ServiceIdentifier<T> {
  if (Utils.isDefinedToken(token)) {
    return token.symbol;
  }
  return token;
}
export const GlobalContainer = new Container();
