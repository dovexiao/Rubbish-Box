import { createFetch } from '@/utils/request';

/**
 * 用户相关接口
 */

// 获取账户信息
export const getAccountInfo = createFetch<any, any>(
  '/boke/user/accountInfo',
  'GET',
);

// 修改手机号 - 验证旧手机
export const changeMobileVerify = createFetch<any, any>(
  '/boke/user/changeMobile/verify/old',
  'POST',
);

// 获取修改手机号验证码
export const getChangeMobileCode = createFetch<any, any>(
  '/boke/user/changeMobile/initiate',
  'POST',
);

// 修改手机号 - 验证新手机
export const changeNewVerify = createFetch<any, any>(
  '/boke/user/changeMobile/verify/new',
  'POST',
);

// 获取新手机号验证码
export const getChangeNewCode = createFetch<any, any>(
  '/boke/user/changeMobile/sendSms/new',
  'POST',
);

// 重新发送验证码
export const getCodeResent = createFetch<any, any>(
  '/boke/user/changeMobile/resend',
  'POST',
);

// 解绑微信
export const wechatUnBind = createFetch<any, any>(
  '/boke/user/third/unbind',
  'POST',
);

// 发送私有短信
export const getPrivateSendSms = createFetch<any, any>(
  '/boke/user/sendSms/private',
  'POST',
);

// 修改密码 - 验证码
export const changePwdVerify = createFetch<any, any>(
  '/boke/user/changePwd/verifyCode',
  'POST',
);

// 修改密码
export const changePwd = createFetch<any, any>('/boke/user/changePwd', 'POST');

// 重置密码 - 验证码
export const restPasswordVerify = createFetch<any, any>(
  '/boke/user/resetPwd/verifyCode',
  'POST',
);

// 重置密码
export const restPassword = createFetch<any, any>(
  '/boke/user/resetPwd',
  'POST',
);

// 退出登录
export const logout = createFetch<any, any>('/boke/user/logout', 'POST');

// 第三方绑定
export const thirdBind = createFetch<any, any>(
  '/boke/user/login/third/bind',
  'POST',
);

// 获取第三方状态
export const getThirdState = createFetch<any, any>(
  '/boke/user/third/state',
  'GET',
);

// 获取地址详情
export const getAddressDetail = createFetch<any, any>(
  '/boke/user/address/detail',
  'GET',
);

// 获取基础信息
export const baseInfo = createFetch<any, any>('/boke/user/baseInfo', 'GET');

// 更新信息
export const updateInfo = createFetch<any, any>('/boke/user/update', 'POST');

// 小程序绑定
export const miniBind = createFetch<any, any>('/boke/user/mini/bind', 'POST');

// 小程序绑定手机号
export const miniBindMobile = createFetch<any, any>(
  '/boke/user/mini/bindMobile',
  'POST',
);

// 检查用户锁是否存在
export const getUserLockExist = createFetch<any, any>(
  '/boke/userLock/exist',
  'GET',
);

// 未读消息数
export const unreadCount = createFetch<any, any>(
  '/boke/message/unreadCount',
  'GET',
);

// 读取消息
export const readMsg = createFetch<any, any>('/boke/message/read', 'GET');

// 一键换肤 - 获取皮肤列表
export const getSkinList = createFetch<any, any>(
  '/boke/user/lockBg/list',
  'GET',
);

// 前端日志上报
export const saveFrontLog = createFetch<{ code: string; content: string }, any>(
  '/boke/frontLog/save',
  'POST',
);

// 切换主题
export const chooseSkin = createFetch<any, any>(
  '/boke/user/lockBg/choose',
  'POST',
);

// 获取用户广告信息
export const getBannerDetails = createFetch<any, any>(
  '/boke/user/banner/info',
  'GET',
);

// 修改用户广告信息
export const updateBannerDetails = createFetch<any, any>(
  '/boke/user/banner/update',
  'POST',
);

// 保存贵宾邀请
export const saveInvite = createFetch<any, any>(
  '/boke/userLockInvite/save',
  'POST',
);

// 获取地锁管理员列表
export const getAdmins = createFetch<any, any>('/boke/userLock/admins', 'GET');

// 根据管理员查询地锁列表
export const getLockListByAdmin = createFetch<any, any>(
  '/boke/userLock/admin/list',
  'POST',
);

// 获取贵宾用户列表
export const getVipList = createFetch<any, any>(
  '/boke/invite/user/list',
  'POST',
);

// 根据姓名查询手机号
export const getMobileByName = createFetch<any, any>(
  '/boke/invite/user/getMobileByName',
  'POST',
);

// 根据手机号查询姓名
export const getNameByMobile = createFetch<any, any>(
  '/boke/invite/user/getNameByMobile',
  'POST',
);

// 保存贵宾用户
export const saveVip = createFetch<any, any>('/boke/invite/user/save', 'POST');

// 删除贵宾用户
export const deleteVip = createFetch<any, any>(
  '/boke/invite/user/delete',
  'POST',
);

// 获取贵宾邀请列表
export const getRecordList = createFetch<any, any>(
  '/boke/userLockInvite/list',
  'POST',
);

// 作废贵宾邀请
export const cancelInvite = createFetch<any, any>(
  '/boke/userLockInvite/cancel',
  'POST',
);

// 获取贵宾邀请简略详情
export const simpleDetails = createFetch<any, any>(
  '/boke/userLockInvite/detailSimple',
  'GET',
);

// 获取贵宾邀请详情
export const getDetails = createFetch<any, any>(
  '/boke/userLockInvite/detail',
  'GET',
);

// 扫码地锁二维码
export const userScanDevice = createFetch<any, any>(
  '/boke/userLockInvite/scanDevice',
  'GET',
);

// 验证码校验
export const checkCode = createFetch<any, any>(
  '/boke/userLockInvite/checkCode',
  'POST',
);

// 寻找地锁鸣叫
export const findLock = createFetch<any, any>(
  '/boke/userLockInvite/findLock',
  'POST',
);

// 通过ac查询地锁详情
export const getAcLockDetail = createFetch<any, any>(
  '/boke/userLock/acDetail',
  'GET',
);

// 设备移交管理员-发送验证码给当前管理员
export const handOverSendSms = createFetch<any, any>(
  '/boke/userLock/transfer/admin/sendSms',
  'POST',
);

// 设备移交管理员-校验当前管理员验证码
export const handOverVerify = createFetch<any, any>(
  '/boke/userLock/transfer/admin/verifyCode',
  'POST',
);

// 设备移交管理员-发送验证码给新管理员
export const handOverSendSmsNew = createFetch<any, any>(
  '/boke/userLock/transfer/newAdmin/sendSms',
  'POST',
);

// 设备移交管理员-校验新管理员验证码
export const handOverAdmin = createFetch<any, any>(
  '/boke/userLock/transfer/admin',
  'POST',
);

// 获取安装详情
export const getInstallTaskDetail = createFetch<any, any>(
  '/boke/message/installDetail',
  'GET',
);

// 安装确认
export const installConfirm = createFetch<any, any>(
  '/boke/message/installCheck',
  'POST',
);

// 绑定第三方
export const userThirdBind = createFetch<any, any>(
  '/boke/user/third/bind',
  'POST',
);

// 检查是否为组合设备
export const isCombDevice = createFetch<any, any>(
  '/boke/userLock/isCombDevice',
  'GET',
);

// 获取移交设备列表
export const getHandOverList = createFetch<any, any>(
  '/boke/userLock/admin/list/split',
  'POST',
);

// 获取消息列表
export const getMsgList = createFetch<any, any>('/boke/message/list', 'POST');

// 获取成员列表
export const getMemberList = createFetch<any, any>(
  '/boke/userLock/member/list',
  'POST',
);

// 获取地址列表
export const getAddressList = createFetch<any, any>(
  '/boke/user/address/list',
  'POST',
);

// 获取员工列表
export const getStaffList = createFetch<any, any>(
  '/boke/userLock/mine/member/list',
  'POST',
);

// 修改员工
export const modifyStaff = createFetch<any, any>(
  '/boke/userLock/mine/member/save',
  'POST',
);

// 删除员工
export const deleteStaff = createFetch<any, any>(
  '/boke/userLock/mine/member/delete',
  'POST',
);

// 员工详情
export const staffDetail = createFetch<any, any>(
  '/boke/userLock/mine/member/detail',
  'POST',
);

// 员工锁列表
export const staffLockList = createFetch<any, any>(
  '/boke/userLock/mine/member/detail/list',
  'POST',
);

// 报修添加
export const repairAdd = createFetch<any, any>('/boke/repair/add', 'POST');

// 获取报修列表
export const getRepairList = createFetch<any, any>('/boke/repair/page', 'POST');

// 获取报修详情
export const getRepairDetail = (id: number) => {
  return createFetch<any, any>(`/boke/repair/detail/${id}`, 'GET')();
};

// 获取贵宾码未使用数量
export const getUnUseCount = createFetch<any, any>(
  '/boke/userLockInvite/unUseCount',
  'GET',
);
