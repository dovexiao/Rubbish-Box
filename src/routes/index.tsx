export const routes = {
  tabs: [
    {
      name: 'Multiple',
      label: '组合设备',
      component: require('@/pages/multiple/index').default,
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
      component: require('@/pages/loginSms').default,
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
    {
      name: 'DeviceInfo',
      component: require('@/pages/deviceInfo').default,
      label: '设备信息',
    },
    {
      name: 'MemberList',
      component: require('@/pages/memberList').default,
      label: '成员列表',
    },
    {
      name: 'AddMember',
      component: require('@/pages/addMember').default,
      label: '添加成员',
    },
    {
      name: 'Shopping',
      component: require('@/pages/shopping').default,
      label: '商城',
    },
    {
      name: 'GoodsDetail',
      component: require('@/pages/goodsDetail').default,
      label: '商品详情',
    },
    {
      name: 'PickupCode',
      component: require('@/pages/pickupCode').default,
      label: '提货码',
    },
    {
      name: 'ScanPickupCode',
      component: require('@/pages/scanPickupCode').default,
      label: '扫描提货码',
    },
    {
      name: 'PickupCodeRecordList',
      component: require('@/pages/pickupCodeRecordList').default,
      label: '领取记录',
    },
    {
      name: 'PickupCodeRecordDetail',
      component: require('@/pages/pickupCodeRecordDetail').default,
      label: '领取详情',
    },
    {
      name: 'Order',
      component: require('@/pages/order').default,
      label: '我的订单',
    },
    {
      name: 'OrderDetail',
      component: require('@/pages/order/detail').default,
      label: '订单详情',
    },
    {
      name: 'OnlineRepair',
      component: require('@/pages/maintain').default,
      label: '在线报修',
    },
    {
      name: 'MaintainLockChoose',
      component: require('@/pages/maintain/lockChoose').default,
      label: '选择地锁',
    },
    {
      name: 'MaintainService',
      component: require('@/pages/maintain/service').default,
      label: '服务记录',
    },
    {
      name: 'MaintainServiceDetail',
      component: require('@/pages/maintain/serviceDetail').default,
      label: '服务单详情',
    },
    {
      name: 'Feedback',
      component: require('@/pages/feedback').default,
      label: '意见反馈',
    },
    {
      name: 'FeedbackRecord',
      component: require('@/pages/feedbackRecord').default,
      label: '意见反馈记录',
    },
    {
      name: 'FeedbackDetail',
      component: require('@/pages/feedbackDetail').default,
      label: '服务单详情',
    },
    {
      name: 'AdvertisingDisplay',
      component: require('@/pages/adDisplay').default,
      label: '广告展示',
    },
  ],
} as const;
