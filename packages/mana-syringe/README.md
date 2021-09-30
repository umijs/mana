# mana-syringe

[![NPM version](https://img.shields.io/npm/v/mana-syringe.svg?style=flat)](https://npmjs.org/package/mana-syringe) [![NPM downloads](https://img.shields.io/npm/dm/mana-syringe.svg?style=flat)](https://npmjs.org/package/mana-syringe)

提供易于使用的依赖注入容器，参考 TSyringe 项目，参考并基于 inversify。

## 安装

```bash
npm i mana-syringe --save
```

## 概念

1. 注入标识 token

注入绑定对象所使用的的标识，可以带有一定的类型约束

```typescript
Token<T> = string | symbol | Newable<T> | Abstract<T> | Syringe.DefinedToken<T>;
```

我们可以比较开放的使用标识，考虑到多包的协作，一般会使用 symbol 类型，标识默认支持单绑定，需要使用多绑定时，应该使用 Syringe.defineToken 方法获得，其接受是否可多绑定的设置。

2. 容器 Container

包含一组绑定标识与注入对象关系描述的上下文成为容器，当我们通过容器获取实例时，容器会根据注入对象及其与标识的关系自动构建所需的其他实例。

3. 生命期 lifecycle

容器会根据注入对象的生命期描述托管这些对象。

```typescript
export enum Lifecycle {
  singleton = 'singleton',
  transient = 'transient',
}
```

## 使用

### 装饰器

我们提供了一组对类与属性的装饰器函数，用来快速完成基于依赖注入的类型描述，并完成基本的绑定关系描述。

- injectable: 通用装饰器，接受所有绑定描述参数
- singleton: 单例装饰器，接受除生命期外的描述参数
- transient: 多例装饰器，接受除生命期外的描述参数
- inject: 注入，接受注入标识作为参数，并接受类型描述

```typescript
@singleton()
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
@transient()
class Ninja {
  @inject(Weapon) public weapon: Weapon;
  public hit() {
    this.weapon.hit();
  }
}
```

### 容器

用户可以手动创建容器，使用全局默认的容器，或者创建子容器

```typescript
import { GlobalContainer, Container } from './container';
const global = GlobalContainer;
const container = new Container();
const child = container.createChild();
```

### 注册

容器上暴露了 register 方法，这个 API 是整个体系的核心。 register 方法有两种签名

```typescript
register<T = any>(options: Syringe.InjectOption<T>): void;
register<T = any>(token: Syringe.Token<T>, options?: Syringe.InjectOption<T>): void;
```

可以调用容器实例上的 register 方法，也可以直接调用全局的 register 方法，其相对于调用 GlobalContainer 的方法。

从签名可以看出，注册绑定需要一组配置，在不同场景下配置会有所不同，可能出现的配置项如下

```typescript
interface {
  token?: MaybeArray<UnionToken<T>>;
  contrib?: MaybeArray<Token<T>>;
  lifecycle?: Lifecycle;
  useClass?: MaybeArray<Class<T>>;
  useDynamic?: MaybeArray<Dynamic<T>>;
  useFactory?: MaybeArray<Factory<T>>;
  useValue?: T;
}
```

- token 可以为数组，本次绑定关系需要声明的标识，不同标识分别注册
- contrib 可以为数组，可用于注册扩展点，也可用于注册 token 别名
- lifecycle 生命期，参见前文
- useClass 可以为数组，给出一个或多个类
- useToken 可以为数组，根据 token 从容器内动态获取对象
- useFactory 可以为数组，基于带有容器信息的上下文，给出动态获得实例的方法
- useDynamic 可以为数组，基于带有容器信息的上下文给出实例
- useValue 可以为数组，常量直接给出值

```typescript
@singleton()
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
GlobalContainer.register(Shuriken);
GlobalContainer.register({ token: Shuriken, useClass: Shuriken });
```

### 模块

可以通过用一组注册动作创建一个模块，方便在不同容器上下文间内加载

```typescript
const module = Module(register => {
  register(Shuriken);
});
GlobalContainer.load(module);
```

### 扩展点

为了方便注册扩展点，容器提供了一组扩展的注册与使用接口。扩展点定义使用的 token 必须为 DefinedToken。

```typescript
const Waepon = Syringe.defineToken('Weapon');
@singleton({ contrib: Weapon })
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
const module = Module(register => {
  Contribution.register(register, Weapon);
  register(Shuriken);
  register(Ninja);
});

@transient()
class Ninja {
  @contrib(Weapon) public weapons: Weapon[];
}
```

## 其他

1. 相同 module 默认不重复加载。
2. Contribution 可以通过多种传参形式处理缓存及是否从父组件获取。
3. 除非通过 defineToken 声明允许多绑定，token 默认单一绑定，重复注册时进行替换操作。
