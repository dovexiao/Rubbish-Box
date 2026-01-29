export const routes = {
  tabs: [
    {
      name: 'Multiple',
      label: '组合设备',
      component: require('@/pages/multiple').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/multiple_hd.png',
      chooseIcon:
        'https://g.18qjz.cn/img/boklock/tabBar/multiple_selected_hd.png',
    },
    {
      name: 'Index',
      label: '设备',
      component: require('@/pages/index/index').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/index_hd.png',
      chooseIcon: 'https://g.18qjz.cn/img/boklock/tabBar/index_selected_hd.png',
    },
    {
      name: 'Mine',
      label: '我的',
      component: require('@/pages/mine').default,
      icon: 'https://g.18qjz.cn/img/boklock/tabBar/mine_hd.png',
      chooseIcon: 'https://g.18qjz.cn/img/boklock/tabBar/mine_selected_hd.png',
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
    {
      name: 'WebView',
      label: '网页浏览',
      component: require('@/pages/WebView').default,
    },
    {
      name: 'LoginSms',
      component: require('@/pages/LoginSms').default,
      label: '登录短信',
    },
    {
      name: 'ForgetPasswordReset',
      component: require('@/pages/forgetPasswordReset').default,
      label: '忘记密码重置',
    },
    {
      name: 'MiniBind',
      component: require('@/pages/miniBind').default,
      label: '小程序绑定',
    },
    {
      name: 'BindPhone',
      component: require('@/pages/bindPhone').default,
      label: '绑定手机',
    },
    {
      name: 'UserInfo',
      component: require('@/pages/userInfo').default,
      label: '用户信息',
    },
  ],
} as const;
