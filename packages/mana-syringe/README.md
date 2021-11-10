# mana-syringe

[![NPM version](https://img.shields.io/npm/v/mana-syringe.svg?style=flat)](https://npmjs.org/package/mana-syringe) [![NPM downloads](https://img.shields.io/npm/dm/mana-syringe.svg?style=flat)](https://npmjs.org/package/mana-syringe)

提供易于使用的依赖注入容器，参考 TSyringe 项目，参考并基于 inversify。

## 安装

```bash
npm i mana-syringe --save
```

## 概念与使用

### 注入标识 token

注入绑定对象所使用的的标识，可以带有一定的类型约束

```typescript
Token<T> = string | symbol | Newable<T> | Abstract<T> | Syringe.DefinedToken<T>;
```

除 `Syringe.DefinedToken<T>` 默认支持多绑定外，注入标识只支持单一绑定关系。可以使用如下 API 生成 DefinedToken

```typescript
Syringe.defineToken('sample-token');
```

### 容器 Container

包含一组绑定标识与注入对象关系描述的上下文成为容器，当我们通过容器获取实例时，容器会根据注入对象及其与标识的关系自动构建所需的其他实例。

用户可以手动创建容器，使用全局默认的容器，或者创建子容器

```typescript
import { GlobalContainer, Container } from './container';
const global = GlobalContainer;
const container = new Container();
const child = container.createChild();
```

我们使用 `token` 从容器里获取对象

```typescript
const ninja = child.get(Ninja);
```

当我们从子容器中获取对象时，会先从子容器查找绑定关系和缓存信息，如果不存在，则继续向父容器查找。

### 注册 register

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
- useClass 可以为数组，给出一个或多个类
- useToken 可以为数组，根据 token 从容器内动态获取对象
- useFactory 可以为数组，基于带有容器信息的上下文，给出动态获得实例的方法
- useDynamic 可以为数组，基于带有容器信息的上下文给出实例
- useValue 可以为数组，常量直接给出值

#### 生命期 lifecycle

容器会根据注入对象的生命期描述托管这些对象，决定是否使用缓存等。

```typescript
export enum Lifecycle {
  singleton = 'singleton',
  transient = 'transient',
}
```

#### 注册类和别名

```typescript
@singleton({ contrib: Alias })
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
GlobalContainer.register(Shuriken);
GlobalContainer.register(Shuriken, {
  useClass: Shuriken,
  lifecycle: Syringe.Lifecycle.singleton,
});
```

通过 token 注册后，每个 token 的注册关系是独立的，通过他们获取对象可以是不同的值，通过 contrib 注册的是别名关系，他们应该获取到同一个对象。不管是 token 还是 contrib，根据对多绑定的支持情况做处理。

```typescript
const Weapon = Symbol('Weapon');
const WeaponArray = Syringe.defineToken('Weapon');
@singleton({ contrib: Weapon })
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
GlobalContainer.register({ token: Weapon, useValue: undefined });
GlobalContainer.register({ token: WeaponArray, useValue: undefined });
GlobalContainer.register(Shuriken);
GlobalContainer.get(Weapon); // Shuriken
GlobalContainer.getAll(WeaponArray); // [undefined, Shuriken]
```

#### 注册值

```typescript
const ConstantValue = Symbol('ConstantValue');
GlobalContainer.register({ token: ConstantValue, useValue: {} });
```

#### 注册动态值

```typescript
const NinjaAlias = Symbol('NinjaAlias');
GlobalContainer.register({
  token: NinjaAlias,
  useDynamic: ctx => ctx.container.get(Ninja),
});
```

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

### 扩展点 Contribution

我们通常将依赖注入的多绑定模式以扩展点的形式使用，为了方便在项目中使用这种模式，我们内置了对扩展点的定义和支持。

#### 扩展点的定义与注册

```typescript
const Weapon = Syringe.defineToken('Weapon');
Contribution.register(GlobalContainer.register, Weapon);
```

#### 扩展服务 Contribution.Provider

内置了扩展点的管理服务，用户一般直接使用即可，注册扩展点以后，通过如下方式获取扩展服务

```typescript
@contrib(Weapon) public weaponProvider: Contribution.Provider<Weapon>;
```

等价于如下写法

```typescript
@inject(Contribution.Provider) @named(Weapon) public weaponProvider: Contribution.Provider<Weapon>;

```

#### 扩展点示例

```typescript
const Weapon = Syringe.defineToken('Weapon');
Contribution.register(GlobalContainer.register, Weapon);
@singleton({ contrib: Weapon })
class Shuriken implements Weapon {
  public hit() {
    console.log('Shuriken hit');
  }
}
@transient()
class Ninja {
  @contrib(Weapon) public weaponProvider: Contribution.Provider<Weapon>;
  hit() {
    const weapons = this.weaponProvider.getContributions();
    weapons.forEach(w => w.hit());
  }
}
const module = Module(register => {
  Contribution.register(register, Weapon);
  register(Shuriken);
  register(Ninja);
});
GlobalContainer.register(Shuriken);
GlobalContainer.register(Ninja);
GlobalContainer.get(Ninja).hit(); // Shuriken hit
```

### 模块

可以通过用一组注册动作创建一个模块，方便在不同容器上下文间内加载, 模块的构建支持注册函数和链式调用两种方式，前面扩展点示例里的模块也可以写成如下形式：

```typescript
const module = Module().contribution(Weapon).register(Shuriken, Ninja);

GlobalContainer.load(module);
```

- 相同 module 默认不重复加载。
