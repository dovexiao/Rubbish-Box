/**
 * 蓝牙等原生能力 API（迁移自 Taro utils/api）
 * 依赖：react-native-ble-plx, buffer（Uint8Array -> base64 可选）
 */
import {
  Platform,
  PermissionsAndroid,
  Linking,
  NativeModules,
} from 'react-native';
import IntentLauncher from 'react-native-intent-launcher';
import {
  BleManager,
  type Characteristic,
  type Device,
} from 'react-native-ble-plx';
import { getStorage, setStorage } from '@/utils';
import { saveFrontLog } from '@/services';

import { getSystemConnectedDevices as getSystemConnectedDevicesFromUtils } from '@/utils';
import { isSameMac, parseMacFromBase64 } from '@/utils';
import { RefObject } from 'react';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

let bleInstance: BleManager;

const getBleManagerInstance = (): BleManager => {
  if (!bleInstance) {
    bleInstance = new BleManager();
  }
  return bleInstance;
};

const recreateBleManager = (): BleManager => {
  try {
    bleInstance?.destroy?.();
  } catch {}
  bleInstance = new BleManager();
  return bleInstance;
};

const ensureBleManagerAlive = async (): Promise<BleManager> => {
  if (!bleInstance) {
    return getBleManagerInstance();
  }
  try {
    await bleInstance.state();
    return bleInstance;
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg.includes('destroyed')) {
      return recreateBleManager();
    }
    throw error;
  }
};

try {
  getBleManagerInstance();
} catch (_) {}

// ---------- 权限与开关 ----------

export const authBluetooth = async (): Promise<{ success: boolean }> => {
  if (Platform.OS === 'ios') {
    return { success: true };
  }
  if (
    Platform.OS === 'android' &&
    PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION']
  ) {
    const apiLevel = parseInt(String(Platform.Version), 10);
    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION'],
      );
      return { success: granted === PermissionsAndroid.RESULTS.GRANTED };
    }
    if (
      PermissionsAndroid.PERMISSIONS['BLUETOOTH_SCAN'] &&
      PermissionsAndroid.PERMISSIONS['BLUETOOTH_CONNECT']
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS['BLUETOOTH_SCAN'],
        PermissionsAndroid.PERMISSIONS['BLUETOOTH_CONNECT'],
        PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION'],
      ]);
      return {
        success:
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED,
      };
    }
  }
  return { success: false };
};

export const openBluetooth = (): Promise<{ success: boolean }> => {
  return new Promise(async resolve => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let sub: { remove: () => void } | null = null;
    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      sub?.remove?.();
    };
    try {
      await ensureBleManagerAlive();
      const state = await bleInstance.state();
      if (state === 'PoweredOn') {
        return resolve({ success: true });
      }
      if (Platform.OS === 'android') {
        try {
          await bleInstance.enable();
        } catch (e) {
          console.warn('[openBluetooth] enable() failed:', e);
        }
      }
      sub = bleInstance.onStateChange(newState => {
        if (newState === 'PoweredOn') {
          cleanup();
          resolve({ success: true });
        }
      }, true);
      timeout = setTimeout(() => {
        cleanup();
        resolve({ success: false });
      }, 8000);
    } catch {
      cleanup();
      resolve({ success: false });
    }
  });
};

// ---------- 系统已连接设备（兼容 { success, data } 形状） ----------

export const getSystemConnectedDevices = async (): Promise<{
  success: boolean;
  data: any[];
  message?: string;
}> => {
  const res = await getSystemConnectedDevicesFromUtils();
  const code = (res as any)?.code;
  const data = (res as any)?.data ?? [];
  return {
    success: code === '200',
    data: Array.isArray(data) ? data : [],
    message: (res as any)?.message,
  };
};

// ---------- 连接/断开 ----------

export const connectBluetoothDevice = (
  deviceId: string,
): Promise<{ success: boolean; data?: any; error?: any }> => {
  return new Promise(async resolve => {
    try {
      await ensureBleManagerAlive();
      let connectedDevice = await bleInstance.connectToDevice(deviceId);
      if (!connectedDevice) return resolve({ success: false });
      connectedDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();
      resolve({
        success: true,
        data: {
          deviceId: connectedDevice.id,
          name: connectedDevice.name,
          device: connectedDevice,
        },
      });
    } catch {
      resolve({ success: false });
    }
  });
};

export const disconnectBluetoothDevice = (
  deviceId: string,
): Promise<{ success: boolean }> => {
  return new Promise(async resolve => {
    try {
      await bleInstance.cancelDeviceConnection(deviceId);
      resolve({ success: true });
    } catch {
      resolve({ success: false });
    }
  });
};

// ---------- 扫描 ----------

export const searchBluetoothDevices = async (
  ref: RefObject<any>,
): Promise<{ success: boolean }> => {
  try {
    // 首次启动/权限弹窗等场景可能导致 BleManager 被销毁，这里兜底重建
    await ensureBleManagerAlive();

    // 检查并请求蓝牙权限
    const permissionResult = await authBluetooth();

    if (!permissionResult.success) {
      try {
        // 跳转到系统设置
        if (Platform.OS === 'ios') {
          // iOS: 跳转到系统蓝牙设置
          await Linking.openURL('App-Prefs:root=Bluetooth');
        } else {
          await IntentLauncher.startActivity({
            action: 'android.settings.BLUETOOTH_SETTINGS',
          });
        }
      } catch (error) {
        await Linking.openSettings();
      }
      return { success: false };
    }

    // 检查蓝牙状态
    const state = await bleInstance.state();

    if (state !== 'PoweredOn') {
      return { success: false };
    }

    return new Promise(async resolve => {
      // 先停止之前的扫描
      try {
        await bleInstance.stopDeviceScan();
      } catch (stopError) {
        console.log('停止扫描出错(可能没有正在进行的扫描):', stopError);
      }

      // 等待一小段时间确保停止操作完成
      await sleep(300);

      // 开始扫描
      bleInstance.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device: any) => {
          if (error) {
            bleInstance.stopDeviceScan();
            resolve({ success: false });
            console.log('搜索设备error', error);
          } else if (device) {
            // 监听寻找到新设备的事件
            ref.current.found({
              devices: [
                {
                  deviceId: device.id,
                  name: device.name,
                  localName: device.localName,
                  rssi: device.rssi,
                  manufacturerData: device.manufacturerData,
                },
              ],
            });
            resolve({ success: true });
          }
        },
      );
    });
  } catch (error) {
    console.log('❌ searchBluetoothDevices 失败:', error);
    return { success: false };
  }
};

export const stopSearchBluetoothDevices = (
  ref: RefObject<any>,
): Promise<{ success: boolean }> => {
  return new Promise(async resolve => {
    try {
      await bleInstance.stopDeviceScan();
    } catch {}
    resolve({ success: true });
  });
};

// ---------- iOS 设备是否被忽略；Android 用 NativeModules ----------

export const checkIfDeviceIgnoredOnIOS = (
  deviceId: string,
  bleNo?: string,
): Promise<{ isIgnored: boolean; reason?: string }> => {
  return new Promise(async resolve => {
    if (Platform.OS === 'ios') {
      if (!deviceId) {
        resolve({ isIgnored: false, reason: '设备ID为空' });
        return;
      }
      const SCAN_TIMEOUT_MS = 10000;
      try {
        try {
          const connectedDevices = await bleInstance.connectedDevices([
            '0000fff0-0000-1000-8000-00805f9b34fb',
          ]);
          const isConnected = connectedDevices.some(d => d.id === deviceId);
          if (isConnected) {
            resolve({ isIgnored: false, reason: '设备已连接' });
            return;
          }
        } catch (e) {
          console.log('检查已连接设备失败:', e);
        }
        const scanResult = await new Promise<{ found: boolean }>(
          resolveScan => {
            let done = false;
            const finish = (result: { found: boolean }) => {
              if (done) return;
              done = true;
              try {
                bleInstance.stopDeviceScan();
              } catch {}
              resolveScan(result);
            };
            const timer = setTimeout(
              () => finish({ found: false }),
              SCAN_TIMEOUT_MS,
            );
            try {
              bleInstance.startDeviceScan(
                null,
                { allowDuplicates: false },
                (error, device) => {
                  if (error) {
                    clearTimeout(timer);
                    finish({ found: false });
                    return;
                  }
                  if (!device?.id) return;
                  if (
                    device.id === deviceId &&
                    device.manufacturerData &&
                    parseMacFromBase64(
                      (device.manufacturerData as string) || '',
                    )?.includes(bleNo ?? '')
                  ) {
                    clearTimeout(timer);
                    finish({ found: true });
                  }
                },
              );
            } catch {
              clearTimeout(timer);
              finish({ found: false });
            }
          },
        );
        if (scanResult.found) {
          resolve({ isIgnored: true, reason: '扫描到设备' });
          return;
        }
        resolve({
          isIgnored: false,
          reason: '设备不在已连接列表中，无法确定是否被忽略',
        });
      } catch (error: any) {
        resolve({
          isIgnored: false,
          reason: `检查失败: ${error?.message || '未知错误'}`,
        });
      }
      return;
    }
    const { BluetoothManager } = NativeModules;
    if (!BluetoothManager?.getBondedDevices) {
      resolve({
        isIgnored: false,
        reason: 'BluetoothManager 不可用，默认未忽略',
      });
      return;
    }
    BluetoothManager.getBondedDevices((result: any) => {
      if (result?.success && Array.isArray(result.devices)) {
        const isBonded = result.devices.some(
          (d: any) =>
            isSameMac(d.mac, deviceId) || isSameMac(d.mac, bleNo ?? ''),
        );
        resolve({
          isIgnored: !isBonded,
          reason: isBonded ? '设备未被忽略' : '设备已被忽略',
        });
      } else {
        resolve({
          isIgnored: false,
          reason: result?.message || '获取配对列表失败',
        });
      }
    });
  });
};

// ---------- 设备是否已连接 ----------

export const isDeviceConnected = (
  deviceIdentifier: string,
): Promise<{ success: boolean }> => {
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve({ success: false }), 3000);
    (async () => {
      try {
        const device = await bleInstance.devices([deviceIdentifier]);
        if (device?.[0]) {
          const isConnected = await device[0].isConnected();
          clearTimeout(timeout);
          resolve({ success: isConnected });
          return;
        }
      } catch {}
      try {
        const connectedDevices = await bleInstance.connectedDevices([]);
        const isConnected = connectedDevices.some(
          d => d.id === deviceIdentifier,
        );
        clearTimeout(timeout);
        resolve({ success: isConnected });
      } catch {
        clearTimeout(timeout);
        resolve({ success: false });
      }
    })();
  });
};

// ---------- Notify / 写数据 / 解码 ----------

export const notifyBLECharacteristicValueChange = (options: {
  deviceId: string;
  notifyCharacteristicUuid: string;
  notifyServiceUuid: string;
  onData?: (params: {
    base64: string;
    characteristic?: Characteristic;
  }) => void;
  onError?: (error: Error) => void;
}): Promise<{ success: boolean; msg?: string }> => {
  return new Promise(resolve => {
    try {
      bleInstance.monitorCharacteristicForDevice(
        options.deviceId,
        options.notifyServiceUuid,
        options.notifyCharacteristicUuid,
        (error, characteristic) => {
          if (error) {
            options.onError?.(error);
            return;
          }
          const base64 = characteristic?.value || '';
          options.onData?.({
            base64,
            characteristic: characteristic ?? undefined,
          });
        },
      );
      resolve({ success: true });
    } catch (err: any) {
      resolve({ success: false, msg: err?.message || 'monitor failed' });
    }
  });
};

const decodeBase64ToText = (base64: string): string => {
  if (!base64) return '';
  try {
    const BufferRef = (globalThis as any).Buffer;
    if (BufferRef) {
      return BufferRef.from(base64, 'base64').toString();
    }
    return '';
  } catch {
    return '';
  }
};

const uint8ArrayToBase64 = (arr: Uint8Array): string => {
  try {
    const BufferRef = (globalThis as any).Buffer;
    if (BufferRef) {
      return BufferRef.from(
        arr.buffer,
        arr.byteOffset,
        arr.byteLength,
      ).toString('base64');
    }
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    return (globalThis as any).btoa?.(binary) ?? '';
  } catch {
    return '';
  }
};

export const sendDataToDevice = (options: {
  deviceId: string;
  writeServiceUuid: string;
  writeCharacteristicUuid: string;
  value: Uint8Array;
  once?: boolean;
  lasterSuccess?: () => void;
  onError?: (err: any) => void;
}): void => {
  const byteLength = options.value.byteLength;
  const speed = 20;
  if (byteLength <= 0) return;
  const toSend = options.once
    ? options.value
    : options.value.slice(0, byteLength > speed ? speed : byteLength);
  const base64 = uint8ArrayToBase64(toSend);
  bleInstance
    .writeCharacteristicWithResponseForDevice(
      options.deviceId,
      options.writeServiceUuid,
      options.writeCharacteristicUuid,
      base64,
    )
    .then(() => {
      if (byteLength > speed && !options.once) {
        sendDataToDevice({
          ...options,
          value: options.value.slice(speed, byteLength),
        });
      } else {
        options.lasterSuccess?.();
      }
    })
    .catch(err => {
      options.onError?.(err);
    });
};

// ---------- 模式指令（sendBleCommandWithAck + sendModeCommandByBluetooth） ----------

type BleCommandType = 'mode' | 'pin' | 'operation' | 'near';

const calcChecksum = (bytes: number[]): number => {
  return bytes.reduce((acc, cur) => acc + (cur & 0xff), 0) & 0xff;
};

const buildPacket = (bytes: number[]): Uint8Array => {
  const buf = new Uint8Array(bytes.length);
  buf.set(bytes);
  return buf;
};

const encodePinToAsciiBytes = (pin: string): number[] => {
  const normalized = pin.slice(0, 6);
  const bytes: number[] = [];
  for (let i = 0; i < normalized.length; i++) {
    bytes.push(normalized.charCodeAt(i));
  }
  return bytes;
};

const encodeMacToAsciiBytes = (mac: string): number[] => {
  const normalized = mac
    .replace(/:/g, '')
    .toUpperCase()
    .slice(0, 12)
    .padEnd(12, '0');
  const bytes: number[] = [];
  for (let i = 0; i < 12; i += 2) {
    bytes.push(parseInt(normalized.slice(i, i + 2), 16) || 0);
  }
  if (bytes.length > 0) {
    bytes[bytes.length - 1] = (bytes[bytes.length - 1] || 0) | 0xc0;
  }
  return bytes;
};

const sendBleCommandWithAck = async (options: {
  deviceId: string;
  type: BleCommandType;
  mode?: number;
  status?: number;
  operation?: number;
  deviceNo?: string;
  pin?: string;
  mac?: string;
  timeoutMs?: number;
  successMsg: string;
  failMsg: string;
}): Promise<{ success: boolean; code?: number; msg?: string }> => {
  const {
    deviceId,
    type,
    mode,
    operation,
    pin,
    mac,
    status,
    timeoutMs = 4000,
    successMsg,
    failMsg,
  } = options;
  if (!deviceId) return { success: false, msg: '缺少设备ID' };

  const alreadyConnected = await isDeviceConnected(deviceId);
  if (!alreadyConnected.success) {
    await connectBluetoothDevice(deviceId);
  }

  let body: number[];
  if (type === 'mode') {
    body = [0x55, 0x01, typeof mode === 'number' ? mode : 1];
  } else if (type === 'operation') {
    body = [0x55, 0x03, typeof operation === 'number' ? operation : 1];
  } else if (type === 'near') {
    body = [0x55, 0x04, typeof status === 'number' ? status : 1];
  } else {
    const pinBytes = encodePinToAsciiBytes(pin || '');
    if (mac) {
      body = [0x55, 0x02, ...pinBytes, ...encodeMacToAsciiBytes(mac)];
    } else {
      body = [0x55, 0x02, ...pinBytes];
    }
  }
  const packet = buildPacket([...body, calcChecksum(body)]);

  return new Promise(resolve => {
    let settled = false;
    const finish = (result: {
      success: boolean;
      code?: number;
      msg?: string;
    }) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const timer = setTimeout(
      () => finish({ success: false, code: -1, msg: '超时未收到设备响应' }),
      timeoutMs,
    );

    notifyBLECharacteristicValueChange({
      deviceId,
      notifyCharacteristicUuid: '0783b03e-8535-b5a0-7140-a304d2495cb8',
      notifyServiceUuid: '0000fff0-0000-1000-8000-00805f9b34fb',
      onData: ({ base64 }) => {
        const text = decodeBase64ToText(base64);
        const match = text.match(/(200|206)/);
        if (match) {
          const code = Number(match[1]);
          clearTimeout(timer);
          finish({
            success: code === 200,
            code,
            msg: code === 200 ? successMsg : failMsg,
          });
        }
      },
      onError: err => {
        clearTimeout(timer);
        finish({ success: false, msg: err?.message || '发送失败' });
      },
    }).then(res => {
      if (!res?.success) {
        clearTimeout(timer);
        finish({ success: false, msg: res?.msg || '发送失败' });
      }
    });

    sendDataToDevice({
      deviceId,
      writeCharacteristicUuid: '0783b03e-8535-b5a0-7140-a304d2495cba',
      writeServiceUuid: '0000fff0-0000-1000-8000-00805f9b34fb',
      value: packet,
      once: true,
      lasterSuccess: () => {},
      onError: err => {
        clearTimeout(timer);
        finish({ success: false, msg: err?.message || '发送失败' });
      },
    });
  });
};

export const sendModeCommandByBluetooth = async (options: {
  deviceId: string;
  mode: number;
  deviceNo?: string;
  timeoutMs?: number;
}): Promise<{
  success: boolean;
  deviceNo?: string;
  code?: number;
  msg?: string;
}> => {
  const { deviceId, mode, deviceNo, timeoutMs = 4000 } = options;
  const result = await sendBleCommandWithAck({
    deviceId,
    type: 'mode',
    mode,
    timeoutMs,
    successMsg: '切换成功',
    failMsg: '切换失败',
  });
  return { ...result, deviceNo };
};

// 发送修改 PIN 指令：55 02 [PIN(6 字节 ASCII)] [MAC(6 字节 ASCII)] [CS]
export const sendChangePinByBluetooth = async (options: {
  deviceId: string;
  deviceNo?: string;
  pin: string;
  timeoutMs?: number;
}): Promise<{
  success: boolean;
  code?: number;
  deviceNo?: string;
  msg?: string;
  newMac?: string;
}> => {
  const { deviceId, pin, deviceNo, timeoutMs = 4000 } = options;

  // 先获取旧的MAC地址，计算新的MAC地址
  let oldBleNo: string | null = null;
  let newBleNo: string | null = null;
  let deviceInfo: any = null;

  try {
    // 获取设备信息列表
    const deviceInfoList = await getStorage({
      key: 'bluetoothDeviceInfoList',
    }).catch(() => ({
      data: {},
    }));
    const deviceMap = deviceInfoList?.data || {};

    // 查找匹配的设备（通过deviceId）
    for (const [bleNo, info] of Object.entries(deviceMap)) {
      if ((info as any)?.deviceId === deviceId) {
        oldBleNo = bleNo;
        deviceInfo = info;
        break;
      }
    }

    // 如果找到了设备信息，计算新的MAC地址
    if (oldBleNo) {
      // 规范化旧 MAC：去掉冒号、转大写，只保留前 12 个十六进制字符
      const baseMac = (oldBleNo || '')
        .replace(/:/g, '')
        .toUpperCase()
        .slice(0, 12);
      const ts = Date.now().toString();

      // 使用 SHA256 基于 oldBleNo + pin + 时间戳 生成一个较随机的 12 位十六进制字符串
      const hash = CryptoJS.SHA256(baseMac + pin + ts)
        .toString()
        .toUpperCase();
      newBleNo = hash.slice(0, 12);
    }
  } catch (error) {
    console.error('获取设备信息失败:', error);
  }

  // 执行修改PIN指令，同时发送新的MAC地址
  const result = await sendBleCommandWithAck({
    deviceId,
    type: 'pin',
    pin,
    deviceNo,
    mac: newBleNo || undefined, // 如果计算出了新MAC，则一起发送
    timeoutMs,
    successMsg: '修改 PIN 成功',
    failMsg: '修改 PIN 失败',
  });

  // 返回结果，包含新的MAC地址
  // 注意：硬件收到的MAC经过了 |0xc0 处理，所以返回给后端的MAC也需要同样处理
  let processedMac = newBleNo;
  if (processedMac && processedMac.length >= 12) {
    // 获取最后一个字节（最后2个十六进制字符）
    const lastByteHex = processedMac.slice(10, 12);
    const lastByte = parseInt(lastByteHex, 16);
    if (!isNaN(lastByte)) {
      // 执行 |0xc0 操作
      const processedLastByte = (lastByte | 0xc0)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
      // 替换最后一个字节
      processedMac = processedMac.slice(0, 10) + processedLastByte;
    }
  }

  // 上报前端日志
  try {
    await saveFrontLog({
      code: 'restPinAndMac',
      content: JSON.stringify({
        success: result.success,
        code: result.code,
        msg: result.msg,
        deviceId,
        deviceNo,
        oldBleNo,
        newBleNo: processedMac,
        pin,
        timestamp: Date.now(),
        mark: '重置PIN和MAC',
      }),
    });
  } catch (error) {
    console.error('上报前端日志失败:', error);
  }

  return {
    ...result,
    newMac: processedMac || undefined,
  };
};

// 近身功能开关
export const setNearbyPermission = async (options: {
  deviceId: string;
  deviceNo?: string;
  status: number; // 1: 开  2: 关
  timeoutMs?: number;
}): Promise<{
  success: boolean;
  code?: number;
  deviceNo?: string;
  msg?: string;
}> => {
  const { deviceId, status, deviceNo, timeoutMs = 4000 } = options;
  const result = await sendBleCommandWithAck({
    deviceId,
    type: 'near',
    status,
    deviceNo,
    timeoutMs,
    successMsg: '操作成功',
    failMsg: '操作失败',
  });

  // 上报前端日志
  try {
    await saveFrontLog({
      code: 'autoLift',
      content: JSON.stringify({
        success: result.success,
        code: result.code,
        msg: result.msg,
        deviceId,
        deviceNo,
        status,
        timestamp: Date.now(),
        mark: '自动升降功能',
      }),
    });
  } catch (error) {
    console.error('上报前端日志失败:', error);
  }

  return result;
};

// ---------- 打开蓝牙设置（可选） ----------

export const openBluetoothSettings = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:root=General')
          .then(() => resolve(true))
          .catch(reject);
      } else {
        IntentLauncher.startActivity({
          action: 'android.settings.BLUETOOTH_SETTINGS',
        })
          .then(() => resolve(true))
          .catch(reject);
      }
    } catch (error) {
      reject(error);
    }
  });
};
