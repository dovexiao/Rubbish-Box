import { Platform } from 'react-native';

export type CurrentPlatform = 'ios' | 'android' | 'harmony';

const rawPlatformOS = Platform.OS;
const isIos = rawPlatformOS === 'ios';
const isAndroid = rawPlatformOS === 'android';
const isHarmony = !isIos && !isAndroid;

export const CURRENT_PLATFORM: CurrentPlatform = isIos
  ? 'ios'
  : isAndroid
  ? 'android'
  : 'harmony';

export const IS_IOS = isIos;
export const IS_ANDROID = isAndroid;
export const IS_HARMONY = isHarmony;

export const HOME_STACK_ROUTE = 'MainTabs';

export const LOGIN = '206';
export const UN_COMMIT = '207';
export const WAIT_APPROVE = '208';
export const FAIL_APPROVE = '209';
export const PERMISSION_DENIED = '210'; //角色权限不足
export const UNUSUAL_CODE = '1148';
export const STOCK_LACK_CODE = '825';
export const NO_INVITE_CODE = '528';
export const SCRIPT = '8000';

export const LOCK_STATUS = {
  /** 正常 */
  NORMAL: -1,
  /** 升起 */
  RISE: 0,
  /** 下降中 */
  FALL_ING: 1,
  /** 降下 */
  FALL_SUCCESS: 2,
  /** 下降失败 */
  FALL_FAIL: 3,
  /** 升起中 */
  RISE_ING: 4,
  /** 升起失败 */
  RISE_FAIL: 5,
  /** 离线 */
  OFF_LINE: 6,
  /** 故障 */
  FAULT: 7,
  // /** 亏电 */
  // LOW_POWER: 8,
  // /** 余额不足 */
  // LOW_BALANCE: 9,
  // /** 车辆开走 */
  // CAR_GO: -99,
};
export const FALL_STATUS = {
  RISE: 0,
  FALL_SUCCESS: 2,
  RISE_30: 8,
  RISE_120: 9,
};

export const LOCK_BTN_COLORS = {
  [LOCK_STATUS.FALL_SUCCESS]: ['#4A4A4A', '#282828'],
  [LOCK_STATUS.FAULT]: ['#A4A4A4', '#949494'],
};

export const LOCK_BTN_NAME = {
  [LOCK_STATUS.FALL_SUCCESS]: '升起地锁',
  [LOCK_STATUS.RISE]: '降下地锁',
  [LOCK_STATUS.FALL_ING]: '降锁中...',
  [LOCK_STATUS.RISE_ING]: '升起中...',
};

export const LOCK_STATUS_NAME = {
  [LOCK_STATUS.FALL_SUCCESS]: '已降下',
  [LOCK_STATUS.RISE]: '已升起',
  [LOCK_STATUS.FALL_ING]: '正在降下',
  [LOCK_STATUS.RISE_ING]: '正在升起',
  [LOCK_STATUS.OFF_LINE]: '设备离线',
  [LOCK_STATUS.FAULT]: '设备故障',
};

export const BATTERY_STATUS = {
  100: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_strong.png',
  75: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_better.png',
  50: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_generally.png',
  25: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_small.png',
  0: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_empty.png',
};
export const BATTERY_STATUS_DEEP = {
  100: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_strong_deep.png',
  75: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_better_deep.png',
  50: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_generally_deep.png',
  25: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_small_deep.png',
  0: 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_empty_deep.png',
};

export const SIGNAL_STATUS = {
  5: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_strong.png',
  4: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_better.png',
  3: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_generally.png',
  2: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_small.png',
  1: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_empty.png',
};

export const SIGNAL_STATUS_DEEP = {
  5: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_strong_deep.png',
  4: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_better_deep.png',
  3: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_generally_deep.png',
  2: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_small_deep.png',
  1: 'https://g.18qjz.cn/img/boklock/signalIcon/signal_empty_deep.png',
};

// 背景映射
export const BACKGROUND_MAP = {
  'https://g.18qjz.cn/img/boklock/staticLock/bg_deep.png': 'deep',
  'https://g.18qjz.cn/img/boklock/staticLock/bg_shallow.png': 'normal',
};

export const DEVICE_MODE = {
  XN: 'https://g.18qjz.cn/img/boklock/xn_priority.png',
  XH: 'https://g.18qjz.cn/img/boklock/xh_priority.png',
};

export const SEARCH_BLUETOOTH_STATUS = {
  SEARCHING: 'searching',
  SEARCH_SUCCESS: 'searchSuccess',
  SEARCH_FAILED: 'searchFailed',
};

export const SEARCH_BLUETOOTH_STATUS_NAME = {
  [SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED]: '搜索失败',
};

export const SEARCH_BLUETOOTH_STATUS_IMAGE = {
  [SEARCH_BLUETOOTH_STATUS.SEARCHING]:
    'https://g.18qjz.cn/img/boklock/bluetooth_searched.gif',
  [SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS]:
    'https://g.18qjz.cn/img/boklock/bluetooth_success.png',
  [SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED]:
    'https://g.18qjz.cn/img/boklock/bluetooth_fail.png',
};

export const MESSAGE_TYPE = {
  1: '电量不足提醒',
  2: '碰撞蜂鸣',
  3: '设备安装服务完成',
  4: '高温提醒',
  5: '离线提醒',
  6: '火焰检测',
};

export const LOCK_ROLE = {
  ADMIN: 1,
  NORMAL: 2,
};

export const ORDER_STATUS = {
  /** 待支付 */
  10: 'WAIT_PAY',
  /** 待发货 */
  20: 'WAIT_SEND',
  /** 已发货 */
  30: 'SHIPPED',
  /** 已完成 */
  40: 'COMPLETED',
  /** 已取消 */
  50: 'CANCELLED',
};

export const ORDER_STATUS_NAME = {
  /** 待支付 */
  WAIT_PAY: '待支付',
  /** 待发货 */
  WAIT_SEND: '待发货',
  /** 已发货 */
  SHIPPED: '已发货',
  /** 已完成 */
  COMPLETED: '已完成',
  /** 已取消 */
  CANCELLED: '已取消',
};

export const OPT_TYPE = {
  FALL: 0,
  RISE: 1,
};

export const COVER_STATUS = {
  CLOSE: 0,
  OPEN: 1,
};

export const BLUETOOTH_STATUS = {
  CLOSE: 0,
  OPEN: 1,
};

export const BUZZER_STATUS = {
  CLOSE: 0,
  OPEN: 1,
};

export const ABOVE_STATUS = {
  CLOSE: 0,
  OPEN: 1,
};

export const OT_STATUS = {
  RISE: 0,
  DOWN: 2,
  BUZZER: 11,
  OPENCOVER: 13,
};

export const PURPOSE = {
  UNBIND: 4, //解绑
  MODIFY_PASSWORD: 5, //修改密码
  LOGOFF: 6, //注销
};

export const SMS_PURPOSE = {
  LOGIN: 1,
  BIND_PHONE: 2,
  RESET_PASSWORD: 3,
};
export const TEST_OT_STATUS = {
  /** 降下 */
  DOWN: 0,
  /** 升起 */
  RISE: 1,
  /** 蜂鸣器 */
  BUZZER: 3,
  /** 打开机盖 */
  OPENCOVER: 13,
} as const;

export const POST_SOURCE = {
  APP: 1,
  MINI: 2,
};
export const DAY_OF_WEEK = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  0: '周日',
};
export const INVITE_STATUS = {
  1: '未使用',
  2: '已使用',
  10: '过期未用',
  20: '已作废',
  5: '已使用',
};
export const INVITE_USE_STATUS = {
  1: '使用中',
  0: '空闲',
};
export const PAYTYPE = {
  WECHAT: 1,
  ALIPAY: 2,
} as const;

export const ANDRIOD_PAY_STATUS = {
  WAIT: 0, //未支付
  SUCCESS: 1, //支付成功
  FAIL: 2, //支付失败
  OVERDUE: 3, //订单支付超时
  CLOSE: 4, //订单关闭
};
