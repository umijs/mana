# mana-observable

[![NPM version](https://img.shields.io/npm/v/mana-observable.svg?style=flat)](https://npmjs.org/package/mana-observable) [![NPM downloads](https://img.shields.io/npm/dm/mana-observable.svg?style=flat)](https://npmjs.org/package/mana-observable)

## 功能

1. 对基于类的数据管理系统提供变更追踪机制。可独立使用，
2. 配合依赖注入容器使用，为 React 组件提供管理数据。

## 安装

```bash
npm i mana-observable --save
```

## 用法

### 数据 API

数据 api 可以独立使用，不需要在依赖注入的环境中

#### @prop

将类中的基础类型属性转化为可追踪属性。对于基础类型 (当前支持数值、字符、布尔) 以及一般的引用类型，当值或引用发生变化时，触发数据的变更。对于部分内置类型 (数组、map、plainObject) 除引用变更外，其管理的内部值或引用发生变化时，也会触发数据变更。

```typescript
class Ninja {
  @prop name: string = '';
}
```

#### watch

监听一个带有可追踪属性对象的属性变更

```typescript
// 监听某个可追踪属性的变化
watch(ninja, 'name', (obj, prop) => {
  // ninja name changed
});
// 监听对象所有可追踪属性的变化
watch(ninja, (obj, prop) => {
  // any observable property on ninja changed
});
```

#### observable

经过 babel 处理的类可能会在实例上定义属性，而属性装饰器作用在原型上，因而无法进行属性转换。所以这里引入新的 API 解决相关的问题，后续希望提供免除该 API 调用的使用方式。

```typescript
class Ninja {
  @prop name: string = '';
  constructor() {
    observable(this);
  }
}
```

### React API

当前仅提供基于 React hooks 的 API。

#### useInject

在 react 组件中，如果希望使用依赖注入容器中带有可追踪属性的对象，那么可以使用 useInject 来获取他们。

```typescript
@singleton()
class Ninja {
  @prop name: string = '';
  constructor() {
    observable(this);
  }
}

container.register(Ninja);

export function NinjaRender() {
  const ninja = useInject(Ninja);
  return <div>{ninja.name}</div>;
}
```

#### useObserve

为了精确控制每个 React 组件只因为自己访问的可追踪属性变更而进行 update，也为了在子组件内提供 hook 的创建时机，通过除 useInject 外方式获取到的对象，应当通过 useObserve 进行处理，重置其作用组件更新的范围。

```typescript
export function NinjaName(props: { ninja: Ninja }) {
  const ninja = useObserve(props.ninja);
  return <div>{ninja.name}</div>;
}
```

### getOrigin

在 React 组件中，我们访问的组件并不是原始实例，而是实例的代理，如果在 API 调用等环节需要获取原始对象（例如作为参数传递给其他 API），需要通过调用 getOrigin 方法获得。
