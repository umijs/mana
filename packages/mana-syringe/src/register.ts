import type { interfaces } from 'inversify';
import type { InversifyContext } from './inversify/inversify-protocol';
import {
  bindNamed,
  bindGeneralToken,
  bindMonoToken,
  bindLifecycle,
  isInversifyContext,
} from './inversify';
import { Utils, Syringe } from './core';
import { OptionSymbol } from './side-option';

export function toRegistryOption<P>(
  options: Syringe.InjectOption<P>,
): Syringe.FormattedInjectOption<P> {
  const token = Utils.maybeArrayToArray(options.token);
  const useClass = Utils.maybeArrayToArray(options.useClass);
  const useDynamic = Utils.maybeArrayToArray(options.useDynamic);
  const useFactory = Utils.maybeArrayToArray(options.useFactory);
  const contrib = Utils.maybeArrayToArray(options.contrib);
  const lifecycle = options.lifecycle || Syringe.Lifecycle.transient;

  const generalOption: Syringe.FormattedInjectOption<P> = {
    token,
    useClass,
    lifecycle: contrib.length > 0 ? Syringe.Lifecycle.singleton : lifecycle,
    contrib,
    useDynamic,
    useFactory,
  };
  if ('useValue' in options) {
    generalOption.useValue = options.useValue;
  }
  return generalOption;
}
export class Register<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static globalConfig: Syringe.InjectOption<any> = Syringe.DefaultOption;
  /**
   * 注册目标 token，合并 token 配置后基于配置注册
   */
  static resolveTarget<R>(
    context: Syringe.Container,
    target: Syringe.Token<R>,
    option: Syringe.TargetOption<R> = {},
  ): void {
    try {
      try {
        const sideOption = Reflect.getMetadata(OptionSymbol, target);
        if (sideOption) {
          Register.resolveOption(context, sideOption);
        }
      } catch (ex) {
        // noop
      }
      // 当 target 为类时，将其插入 useClass 配置中
      if (Utils.isClass(target)) {
        if (!option.useClass) {
          option.useClass = [target];
        } else {
          const classes = Utils.maybeArrayToArray(option.useClass);
          classes.unshift(target);
          option.useClass = classes;
        }
      }
      let mixedOption;
      try {
        mixedOption = Reflect.getMetadata(Syringe.ClassOptionSymbol, target);
      } catch (ex) {
        // noop
      }
      mixedOption = {
        ...(mixedOption || {}),
        ...option,
      };
      if (!mixedOption.token) {
        mixedOption.token = [target];
      } else {
        const tokens = Utils.maybeArrayToArray(mixedOption.token);
        tokens.unshift(target);
        mixedOption.token = tokens;
      }
      Register.resolveOption(context, mixedOption);
    } catch (ex) {
      // noop
    }
  }
  /**
   * 基于配置注册
   */
  static resolveOption<R>(context: Syringe.Container, baseOption: Syringe.InjectOption<R>): void {
    const parsedOption = toRegistryOption({
      ...Register.globalConfig,
      ...baseOption,
    });
    if (
      parsedOption.useClass.length === 0 &&
      parsedOption.useDynamic.length === 0 &&
      parsedOption.useFactory.length === 0 &&
      !('useValue' in parsedOption)
    ) {
      return;
    }

    parsedOption.token.forEach(token => {
      const register = new Register(context, token, { ...parsedOption });
      register.resolve();
    });
  }

  protected token: Syringe.UnionToken<T>;
  protected rawToken: Syringe.Token<T>;
  protected named?: Syringe.Named;
  /**
   * 兼容 inversify
   */
  protected generalToken: interfaces.ServiceIdentifier<T>;
  protected option: Syringe.FormattedInjectOption<T>;
  protected context: Syringe.Container;
  protected mutiple: boolean;
  constructor(
    context: Syringe.Container,
    token: Syringe.UnionToken<T>,
    option: Syringe.FormattedInjectOption<T>,
  ) {
    this.context = context;
    this.token = token;
    this.option = option;
    this.rawToken = Utils.isNamedToken(token) ? token.token : token;
    this.named = Utils.isNamedToken(token) ? token.named : undefined;
    this.mutiple = !!this.named || Utils.isMultipleEnabled(this.rawToken);
    this.generalToken = this.rawToken;
  }
  /**
   * multi or mono register
   * mono bind 优先级 useValue > useDynamic > useFactory > useClass
   */
  resolve(): void {
    const { context } = this;
    if (!isInversifyContext(context)) {
      return;
    }
    if (this.mutiple) {
      this.resolveMutilple(context);
    } else {
      this.resolveMono(context);
      if (!this.named && this.option.contrib.length > 0) {
        this.option.contrib.forEach(contribution => {
          if (Utils.isMultipleEnabled(contribution)) {
            bindGeneralToken(contribution, context).toService(this.generalToken);
          } else {
            bindMonoToken(contribution, context).toService(this.generalToken);
          }
        });
      }
    }
  }
  // eslint-disable-next-line consistent-return
  protected resolveMono(context: InversifyContext): interfaces.BindingWhenOnSyntax<T> | undefined {
    if ('useValue' in this.option) {
      return bindMonoToken(this.generalToken, context).toConstantValue(this.option.useValue!);
    }
    if (this.option.useDynamic.length > 0) {
      const dynamic = this.option.useDynamic[this.option.useDynamic.length - 1];
      return bindLifecycle(
        bindMonoToken(this.generalToken, context).toDynamicValue(() =>
          dynamic({ container: this.context }),
        ),
        this.option,
      );
    }
    if (this.option.useFactory.length > 0) {
      const factrory = this.option.useFactory[this.option.useFactory.length - 1];
      return bindMonoToken(this.generalToken, context).toFactory(() =>
        factrory({ container: this.context }),
      );
    }
    if (this.option.useClass.length > 0) {
      const newable = this.option.useClass[this.option.useClass.length - 1];
      return bindLifecycle(bindMonoToken(this.generalToken, context).to(newable), this.option);
    }
  }
  protected resolveMutilple(context: InversifyContext): void {
    const classesList = this.option.useClass.map(newable =>
      bindLifecycle(bindGeneralToken(this.generalToken, context).to(newable), this.option),
    );
    const dynamicList = this.option.useDynamic.map(dynamic =>
      bindLifecycle(
        bindGeneralToken(this.generalToken, context).toDynamicValue(() =>
          dynamic({ container: this.context }),
        ),
        this.option,
      ),
    );
    const factoryList = this.option.useFactory.map(factrory =>
      bindGeneralToken(this.generalToken, context).toFactory(() =>
        factrory({ container: this.context }),
      ),
    );
    const valueToBind =
      'useValue' in this.option
        ? bindGeneralToken(this.generalToken, context).toConstantValue(this.option.useValue!)
        : undefined;
    if (this.named) {
      classesList.forEach(tobind => this.named && bindNamed(tobind, this.named));
      dynamicList.forEach(tobind => this.named && bindNamed(tobind, this.named));
      factoryList.forEach(tobind => this.named && bindNamed(tobind, this.named));
      if (valueToBind) {
        bindNamed(valueToBind, this.named);
      }
    }
  }
}
