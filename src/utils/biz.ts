import {
  BATTERY_STATUS,
  BATTERY_STATUS_DEEP,
  SIGNAL_STATUS,
  SIGNAL_STATUS_DEEP,
} from '@/constants';

export const getBatteryStatus = (
  battery: number,
  type: 'deep' | 'shallow' = 'shallow',
) => {
  const map = type === 'deep' ? BATTERY_STATUS_DEEP : BATTERY_STATUS;
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
export const getSignalStatus = (
  signal: number,
  type: 'deep' | 'shallow' = 'shallow',
) => {
  const map = type === 'deep' ? SIGNAL_STATUS_DEEP : SIGNAL_STATUS;
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
