export const routes = {
  tabs: [
    {
      name: 'Multiple',
      label: '组合设备',
      component: require('@/pages/multiple').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/multiple.png',
      chooseIcon: 'https://g.18qjz.cn/img/boklock/tabBar/multipleSelected.png',
    },
    {
      name: 'Index',
      label: '设备',
      component: require('@/pages/index/index').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/index.png',
      chooseIcon: 'https://g.18qjz.cn/img/boklock/tabBar/indexSelected.png',
    },
    {
      name: 'Mine',
      label: '我的',
      component: require('@/pages/mine').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/mine.png',
      chooseIcon: 'https://g.18qjz.cn/img/boklock/tabBar/mineSelected.png',
    },
  ],
  pages: [
    {
      name: 'Login',
      component: require('@/pages/login').default,
      label: '登录',
    },
    {
      name: 'ForgetPassword',
      component: require('@/pages/forgetPassword').default,
      label: '忘记密码',
    },
  ],
} as const;
