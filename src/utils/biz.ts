import {
  BATTERY_STATUS,
  BATTERY_STATUS_DEEP,
  SIGNAL_STATUS,
  SIGNAL_STATUS_DEEP,
} from '@/constants';
/**
 *
 * @param battery 电量值
 * @param type 主题类型：dark--深色  light--浅色
 * @returns
 */
export const getBatteryStatus = (
  battery: number,
  type: 'dark' | 'light' = 'light',
) => {
  const map = type === 'dark' ? BATTERY_STATUS_DEEP : BATTERY_STATUS;
  if (battery === 100) {
    return map[100];
  } else if (battery >= 75) {
    return map[75];
  } else if (battery >= 50) {
    return map[50];
  } else if (battery >= 25) {
    return map[25];
  } else {
    return map[0];
  }
};

/**
 *
 * @param signal 信号值
 * @param deviceStatus 设备状态
 * @param type 主题类型：dark--深色  light--浅色
 * @returns
 */
export const getSignalStatus = (
  signal: number,
  deviceStatus?: number,
  type: 'dark' | 'light' = 'light',
) => {
  // 设备处于故障状态
  if (deviceStatus === 6) {
    return type === 'dark'
      ? 'https://g.18qjz.cn/img/boklock/signal_no_signal_deep.png'
      : 'https://g.18qjz.cn/img/boklock/signal_no_signal.png';
  }
  // 正常状态
  const map = type === 'dark' ? SIGNAL_STATUS_DEEP : SIGNAL_STATUS;
  if (signal === 31) {
    return map[5];
  } else if (signal === 0) {
    return map[1];
  } else if (signal >= 30) {
    return map[4];
  } else if (signal >= 20) {
    return map[3];
  } else {
    return map[2];
  }
};
