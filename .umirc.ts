// 配置文件
export default {
  title: 'MANA',
  mode: 'site',
  exportStatic: {},
  hash: true,
  navs: {
    'en-US': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/mana' },
      { title: 'Changelog', path: 'https://github.com/umijs/mana/releases' },
    ],
    'zh-CN': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/mana' },
      { title: '更新日志', path: 'https://github.com/umijs/mana/releases' },
    ],
  },
  locales: [['zh-CN', '中文']],
};
