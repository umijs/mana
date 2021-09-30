import 'react';
import { dynamic } from 'umi';
import './mana';

export default dynamic({
  loader: async (): Promise<() => React.ReactNode> => {
    // 这里的注释 webpackChunkName 可以指导 webpack 将该组件 HugeA 以这个名字单独拆出去
    const { TODOList } = await import(/* webpackChunkName: "todo" */ './page');
    return TODOList;
  },
});
