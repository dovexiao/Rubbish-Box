/**
 * 蓝牙模式管理器（迁移自 Taro utils/bluetoothModeManager）
 * 负责续航模式下的操作前检查：权限 -> 蓝牙开关 -> 设备配对状态
 */
import {
  authBluetooth,
  openBluetooth,
  getSystemConnectedDevices,
  checkIfDeviceIgnoredOnIOS,
  disconnectBluetoothDevice,
} from './api';
import { getBluetoothDeviceInfo, removeBluetoothDeviceInfo } from './index';

export enum BluetoothMode {
  PERFORMANCE = 'performance',
  BATTERY_SAVER = 'battery_saver',
}

export interface BluetoothCheckResult {
  success: boolean;
  errorType?: 'no_permission' | 'bluetooth_off' | 'not_connected' | 'unknown';
  message?: string;
  needUserAction?: boolean;
}

class BluetoothModeManager {
  /**
   * 续航模式：操作前的完整检查流程
   */
  async checkBeforeOperation(deviceId: string): Promise<BluetoothCheckResult> {
    const permissionResult = await authBluetooth();
    if (!permissionResult.success) {
      return {
        success: false,
        errorType: 'no_permission',
        message: '需要蓝牙权限才能使用此功能',
        needUserAction: true,
      };
    }

    try {
      const openResult = await openBluetooth();
      if (!openResult.success) {
        return {
          success: false,
          errorType: 'bluetooth_off',
          message: '请打开蓝牙后重试',
          needUserAction: true,
        };
      }
    } catch (error) {
      console.error('[BluetoothModeManager] 检查蓝牙状态失败:', error);
      return {
        success: false,
        errorType: 'unknown',
        message: '检查蓝牙状态失败',
        needUserAction: false,
      };
    }

    try {
      let realDeviceId = '';
      const cached = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};

      let cacheEntry: any;
      if (cached[deviceId]) {
        cacheEntry = cached[deviceId];
        realDeviceId = cacheEntry?.deviceId ?? '';
      }
      if (!realDeviceId) {
        for (const [key, val] of Object.entries(cached)) {
          if ((val as any)?.deviceId === deviceId) {
            realDeviceId = deviceId;
            cacheEntry = val;
            break;
          }
        }
      }

      if (!realDeviceId) {
        return {
          success: false,
          errorType: 'not_connected',
          message: '设备未连接，请先连接设备',
          needUserAction: true,
        };
      }

      const sysInfo = await getSystemConnectedDevices();
      const data = sysInfo.data || [];
      const isPaired = data.some((item: any) => item.deviceId === realDeviceId);
      const res = await checkIfDeviceIgnoredOnIOS(realDeviceId, cacheEntry?.bleNo);
      if (!isPaired || res.isIgnored) {
        await removeBluetoothDeviceInfo(realDeviceId);
        await disconnectBluetoothDevice(realDeviceId);
        return {
          success: false,
          errorType: 'not_connected',
          message: '设备未连接，请先连接设备',
          needUserAction: true,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('[BluetoothModeManager] 检查配对状态失败:', error);
      return {
        success: false,
        errorType: 'unknown',
        message: '检查设备状态失败',
        needUserAction: false,
      };
    }
  }

  /**
   * 带检查执行操作（续航模式使用）
   */
  async executeWithCheck<T>(
    deviceId: string,
    operation: () => Promise<T>,
  ): Promise<{ success: boolean; data?: T; error?: BluetoothCheckResult }> {
    const checkResult = await this.checkBeforeOperation(deviceId);
    if (!checkResult.success) {
      return { success: false, error: checkResult };
    }
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          success: false,
          errorType: 'unknown',
          message: error instanceof Error ? error.message : '操作失败',
        },
      };
    }
  }
}

export const bluetoothModeManager = new BluetoothModeManager();
