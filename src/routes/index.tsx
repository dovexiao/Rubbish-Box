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
      name: 'DeviceList',
      component: require('@/pages/deviceList').default,
      label: '设备列表',
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
      name: 'PickupCodeDaily',
      component: require('@/pages/pickupCodeDaily').default,
      label: '绑定礼品卡',
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
    {
      name: 'BindDevice',
      component: require('@/pages/bindDevice').default,
      label: '绑定设备',
    },
    {
      name: 'FindDevice',
      component: require('@/pages/findDevice').default,
      label: '查找设备',
    },
    {
      name: 'CombineDevice',
      component: require('@/pages/combineDevice').default,
      label: '组合设备',
    },
    {
      name: 'HandOver',
      component: require('@/pages/handOver').default,
      label: '移交设备',
    },
    {
      name: 'HandOverDevice',
      component: require('@/pages/handOver/handOverDevice').default,
      label: '移交设备',
    },
    {
      name: 'HandOverVerify',
      component: require('@/pages/handOver/handOverVerify').default,
      label: '移交设备验证',
    },
    {
      name: 'HandOverVerifyNew',
      component: require('@/pages/handOver/handOverVerifyNew').default,
      label: '移交设备验证',
    },
    {
      name: 'BluetoothLinkSuccess',
      component: require('@/pages/bluetooth/linkSuccess').default,
      label: '蓝牙连接成功',
    },
    {
      name: 'Unbind',
      component: require('@/pages/unbind').default,
      label: '解除绑定须知',
    },
    {
      name: 'UnbindDevice',
      component: require('@/pages/unbind/unbindDevice').default,
      label: '解除绑定',
    },
    {
      name: 'UnBindSuccess',
      component: require('@/pages/unBindSuccess').default,
      label: '解除绑定成功',
    },
    {
      name: 'BluetoothControl',
      component: require('@/pages/bluetooth/control').default,
      label: '自动升降',
    },
    {
      name: 'Message',
      component: require('@/pages/message').default,
      label: '消息中心',
    },
    {
      name: 'MessageDetail',
      component: require('@/pages/messageDetail').default,
      label: '消息详情',
    },
    {
      name: 'MyDevice',
      component: require('@/pages/myDevice').default,
      label: '添加设备',
    },
    {
      name: 'ApplyRecordList',
      component: require('@/pages/apply/applyRecord/index').default,
      label: '地锁使用申请记录',
    },
    {
      name: 'ApplyRecordDetail',
      component: require('@/pages/apply/applyRecord/detail/index').default,
      label: '地锁使用申请详情',
    },
    {
      name: 'UserScan',
      component: require('@/pages/apply/userScan/index').default,
      label: '用户操作地锁',
    },
    {
      name: 'RemoteKeyUnbind',
      component: require('@/pages/remoteKeyUnbind').default,
      label: '遥控钥匙解绑',
    },
    {
      name: 'RemoteKeyPairingVideo',
      component: require('@/pages/remoteKeyPairingVideo').default,
      label: '遥控钥匙配对视频',
    },
    {
      name: 'RcvPayment',
      component: require('@/pages/rcvPayment/index').default,
      label: '收款设置',
    },
    {
      name: 'RcvPaymentRule',
      component: require('@/pages/rcvPayment/rcvPaymentRule/index').default,
      label: '设备收费规则',
    },
    {
      name: 'RcvPaymentRuleEdit',
      component: require('@/pages/rcvPayment/rcvPaymentRule/edit').default,
      label: '新增收费规则',
    },
    {
      name: 'RcvPaymentChangeBank',
      component: require('@/pages/rcvPayment/changeBank/index').default,
      label: '换绑银行卡',
    },
    {
      name: 'BalanceWallet',
      component: require('@/pages/balanceWallet/index').default,
      label: '余额钱包',
    },
    {
      name: 'BalanceWalletWithdrawDetail',
      component: require('@/pages/balanceWallet/detail/index').default,
      label: '提现明细',
    },
    {
      name: 'BalanceWalletExtract',
      component: require('@/pages/balanceWallet/extract/index').default,
      label: '提现明细',
    },
    {
      name: 'MyOrder',
      component: require('@/pages/myOrder/index').default,
      label: '我的订单',
    },
    {
      name: 'MyOrderDetail',
      component: require('@/pages/myOrder/detail/index').default,
      label: '订单详情',
    },
    {
      name: 'MyOrderRefundDetail',
      component: require('@/pages/myOrder/refundDetail/index').default,
      label: '退款详情',
    },
  ],
} as const;
