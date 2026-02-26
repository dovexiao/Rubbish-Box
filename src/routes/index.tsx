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
      component: require('@/pages/webView').default,
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
    {
      name: 'DeviceInfo',
      component: require('@/pages/deviceInfo').default,
      label: '设备信息',
    },
    {
      name: 'FirmwareVersion',
      component: require('@/pages/firmwareVersion').default,
      label: '固件版本',
    },
    {
      name: 'VersionHistory',
      component: require('@/pages/versionHistory').default,
      label: '版本历史',
    },
    {
      name: 'DeviceLog',
      component: require('@/pages/deviceLog').default,
      label: '设备日志',
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
      name: 'CompositeManage',
      component: require('@/pages/composit/manage').default,
      label: '编辑组合设备',
    },
    {
      name: 'DevicesMember',
      component: require('@/pages/composit/member').default,
      label: '成员列表',
    },
    {
      name: 'CompositeShare',
      component: require('@/pages/composit/share/index').default,
      label: '组合设备分享',
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
      name: 'Account',
      component: require('@/pages/account').default,
      label: '账号与安全',
    },
    {
      name: 'ChangeMobile',
      component: require('@/pages/changeMobile').default,
      label: '更换手机号',
    },
    {
      name: 'WechatUnbind',
      component: require('@/pages/wechatUnbind').default,
      label: '解除微信绑定',
    },
    {
      name: 'PasswordSet',
      component: require('@/pages/passwordSet').default,
      label: '设置/修改登录密码',
    },
    {
      name: 'Logoff',
      component: require('@/pages/logoff').default,
      label: '注销账号',
    },
    {
      name: 'About',
      component: require('@/pages/about').default,
      label: '关于泊刻地锁',
    },
    {
      name: 'AddressCreate',
      component: require('@/pages/addressCreate').default,
      label: '新增/编辑地址',
    },
    {
      name: 'Address',
      component: require('@/pages/address').default,
      label: '收货地址',
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
      name: 'TestDevice',
      component: require('@/pages/testDevice').default,
      label: '泊刻地锁工厂测试',
    },
    {
      name: 'TestDeviceDetail',
      component: require('@/pages/testDeviceDetail').default,
      label: '泊刻地锁测试详情',
    },
    {
      name: 'FeedbackDetail',
      component: require('@/pages/feedbackDetail').default,
      label: '服务单详情',
    },
    {
      name: 'SkinPeeler',
      component: require('@/pages/skinPeeler').default,
      label: '换肤',
    },
    {
      name: 'Setting',
      component: require('@/pages/setting').default,
      label: '设置',
    },
    {
      name: 'AdvertisingDisplay',
      component: require('@/pages/adDisplay').default,
      label: '广告展示',
    },
    {
      name: 'DeviceAddress',
      component: require('@/pages/deviceAddress').default,
      label: '设备位置',
    },
    {
      name: 'Vip',
      component: require('@/pages/vip').default,
      label: '宾客邀请',
    },
    {
      name: 'VipInfo',
      component: require('@/pages/vip/info').default,
      label: '贵宾管理',
    },
    {
      name: 'VipRecord',
      component: require('@/pages/vip/record').default,
      label: '贵宾邀请记录',
    },
    {
      name: 'VipEditRecord',
      component: require('@/pages/vip/editRecord').default,
      label: '编辑宾客邀请记录',
    },
  ],
} as const;
