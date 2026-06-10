export interface LockInfoDTO {
  /* 设备地址 */

  address: string;

  /* 设备id */
  id: number;

  /*是否为组合设备 */
  isGroup: boolean;

  /*设备名称 */
  lockName: string;

  /*角色 */
  role: number;

  /*角色名称 */
  roleName: string;

  /*摆臂颜色 */
  armColor: 'H' | 'U';

  /*是否显示电量 */
  showBattery: boolean;

  /*是否可以远控解锁机盖 */
  canOpenCover: boolean;

  /*设备数 */
  groupCount: number;

  /*设备电量（0-100） */
  battery: number;

  /*蓝牙信号强度 (0-31) */
  atCsq: number;

  /*设备外观颜色 */
  deviceColor: 'B' | 'O' | 'L' | 'P' | 'Y';

  /*设备颜色相关信息 */
  imageMap: {
    bgPng: string;
    closeCoverGif: string;
    fallLockGif: string;
    fallLockPng: string;
    lockBindGif: string;
    openCoverGif: string;
    openCoverPng: string;
    openLockPng: string;
    unlockLockGif: string;
    upLockGif: string;
    upLockPng: string;
    up30LockGif: string;
    up30LockPng: string;
    up120LockGif: string;
    up120LockPng: string;
    fall30LockGif: string;
    fall120LockGif: string;
  };

  /*当前地锁升降 0升起 2降下 */
  fallStatus: number;

  /*设备状态 -1正常 0升起 1下降中 2降下 3下降失败 4升起中 5升起失败 6离线 7故障 8亏电 9余额不足 -99车辆驶离 */
  deviceStatus: number;

  /*设备机盖状态：0-关闭 1-打开 */
  coverStatus: number;

  /*蓝牙状态：0-关闭 1-打开 */
  bluetoothStatus: number;

  /*离车升锁秒数 */
  leaveUpTime: number;

  /*电量提醒线 */
  warnBattery: number;

  /*没有蓝牙操作权限 */
  noBleOpt: boolean;

  /*蜂鸣器状态：0-关闭 1-打开 */
  buzzerStatus: number;

  /*碰撞蜂鸣时间 */
  buzzerTime: number;

  /*最近操作，0/2 */
  lastOptStatus: number;

  /*最近操作，升起/降下 */
  lastOptStatusName: string;

  /*最近操作时间 */
  lastOptTime: string;

  /*管理员姓名 */
  adminUsername: string;

  /*管理员联系方式 */
  adminMobile: string;

  /*是否需要蓝牙开启提示 */
  needOpenBluetoothNotice: boolean;

  /*电量不足列表 */
  lowBatteryNoticeList: LowBatteryNoticeList[];

  /* 设备编号 */
  deviceNo: string;

  /* 是否可以升锁 */
  canRise: boolean;

  /* 是否可以降锁 */
  canDown: boolean;

  /* 是否有覆盖物 */
  overlay: boolean;

  /* 上方覆盖状态 0无 1有 */
  aboveStatus: number;

  /* 蓝牙设备地址 */
  bleNo: string;

  /* 经度 */
  longitude: number;

  /* 纬度 */
  latitude: number;

  /* 位置列表 */
  locationList: any[];

  /* 该账号下是否存在设备 */
  hasDevice: boolean;

  /* 设备模式 1-性能优先 2-续航优先 */
  mode: number;
  /* 市电安装电话*/
  customerServicePhone: string;

  powerType: number; //电量类型

  bleName: string;

  needPin: number;

  has433Key: boolean;

  keyCount: number;

  resetTime: string;
}

interface LowBatteryNoticeList {
  /* 设备id */
  id: number;

  /* 设备名称 */
  lockName: string;

  /* 当前电量 */
  battery: number;
}
