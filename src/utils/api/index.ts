/**
 * 蓝牙等原生能力 API（迁移自 Taro utils/api）
 * 依赖：react-native-ble-plx, buffer（Uint8Array -> base64 可选）
 */
import {
  Platform,
  PermissionsAndroid,
  Linking,
  NativeModules,
  TurboModuleRegistry,
} from 'react-native';
import CryptoJS from 'crypto-js';
import IntentLauncher from 'react-native-intent-launcher';
import {
  BleManager,
  type Characteristic,
  type Device,
} from 'react-native-ble-plx';
import { arrayBufferToBase64, getStorage, setStorage } from '@/utils';
import { saveFrontLog } from '@/services';
import { requestBluetoothPermissions } from '@/utils';
import { RefObject } from 'react';
import { storageUtil } from '../storage';
import { showToast } from '../toast';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

const isSameMac = (mac1?: string, mac2?: string): boolean => {
  if (!mac1 || !mac2) return false;
  const normalize = (mac: string) => mac.replace(/[:-]/g, '').toLowerCase();
  return normalize(mac1) === normalize(mac2);
};

export const formatMacForHarmony = (id: string): string => {
  const isHarmony = Platform.OS != 'android' && Platform.OS != 'ios';
  if (isHarmony && id && id.length === 12 && !id.includes(':')) {
    return id
      .replace(/(.{2})/g, '$1:')
      .slice(0, -1)
      .toUpperCase();
  }
  return id || '';
};

const parseMacFromBase64 = (base64Str: string): string | null => {
  if (!base64Str) return null;
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    const B = (g as any).Buffer;
    const bytes = B ? new Uint8Array(B.from(base64Str, 'base64')) : null;
    if (!bytes || bytes.length < 6) return null;
    const macBytes = bytes.slice(bytes.length - 6);
    return Array.from(macBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  } catch {
    return null;
  }
};

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
const isHarmony: boolean = Platform.OS !== 'ios' && Platform.OS !== 'android';

export const authBluetooth = async (): Promise<{ success: boolean }> => {
  if (Platform.OS === 'ios' || isHarmony) {
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
      console.log('确认蓝牙模块是否激活');
      await ensureBleManagerAlive();
      const state = await bleInstance.state();
      console.log('当前蓝牙状态:', state, Platform.OS);
      if (state === 'PoweredOn') {
        return resolve({ success: true });
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
      // iOS 也需要主动触发 enable 才可能弹出系统开启蓝牙弹窗
      //（bleInstance.enable 仅在部分环境/版本存在，因此做函数存在性判断）
      try {
        console.log('尝试启用蓝牙模块');
        const enabler = (bleInstance as any)?.enable;
        if (typeof enabler === 'function') {
          Promise.resolve(enabler.call(bleInstance)).catch(e => {
            console.warn('[openBluetooth] enable() failed:', e);
          });
        }
      } catch (e) {
        console.warn('[openBluetooth] enable() failed:', e);
      }
    } catch {
      cleanup();
      resolve({ success: false });
    }
  });
};

export const getBluetoothState = async (): Promise<string> => {
  try {
    await ensureBleManagerAlive();
    return await bleInstance.state();
  } catch {
    return 'Unknown';
  }
};

// ---------- 系统已连接设备（推荐：不受 UUID 限制，可获取 GATT/HID/A2DP/HFP 等） ----------

/**
 * 使用原生模块获取系统已连接的所有蓝牙设备（推荐）
 * 优势：不受 UUID 限制，可以获取所有类型的已连接设备（GATT/HID/A2DP/HFP等）
 * @returns Promise 返回设备列表
 */
export const getSystemConnectedDevices = (): Promise<{
  success: boolean;
  data: any[];
  message?: string;
}> => {
  return new Promise(async resolve => {
    try {
      // 首次启动/权限弹窗等场景可能导致 BleManager 被销毁，这里兜底重建
      await ensureBleManagerAlive();

      // 先请求蓝牙权限（Android 12+ 必需）
      if (Platform.OS === 'android') {
        const permResult = await requestBluetoothPermissions();
        if (!permResult.granted) {
          resolve({
            success: false,
            data: [],
            message: permResult.message || '蓝牙权限未授予',
          });
          return;
        }
      }

      const getTurboModuleSafely = (name: string): any => {
        try {
          return TurboModuleRegistry.get(name);
        } catch (error) {
          return null;
        }
      };

      if (isHarmony) {
        try {
          const hModule: any =
            NativeModules?.HarmonyAppInfo ||
            getTurboModuleSafely('HarmonyAppInfo');
          let pairedMacs: string[] = [];
          if (hModule && typeof hModule?.getPairedDevices === 'function') {
            pairedMacs = (await hModule.getPairedDevices()) || [];
          }

          const hasDevices = pairedMacs.length > 0;
          resolve({
            success: hasDevices,
            data: hasDevices
              ? pairedMacs.map((mac: string) => ({
                  deviceId: mac, // 鸿蒙系统下返回的配对设备是纯物理 MAC 地址
                  name: '已配对设备',
                  address: mac,
                  isConnected: true,
                }))
              : [],
            message: hasDevices ? undefined : '当前无已连接的设备',
          });
        } catch (error: any) {
          console.error('[蓝牙] Harmony 获取已连接设备失败', error);
          resolve({
            success: false,
            data: [],
            message: error?.message || '获取已连接设备失败',
          });
        }
      } else if (Platform.OS === 'ios') {
        try {
          // iOS：蓝牙状态可能为 unknown，直接调用 connectedDevices 会抛错
          // 这里先确保蓝牙处于 PoweredOn（或等待其变为 PoweredOn）
          const btState = await bleInstance.state();
          if (btState !== 'PoweredOn') {
            const openRes = await openBluetooth();
            if (!openRes?.success) {
              resolve({
                success: false,
                data: [],
                message: '蓝牙未开启或状态未知',
              });
              return;
            }
          }

          const res = await bleInstance.connectedDevices([
            '0000fff0-0000-1000-8000-00805f9b34fb',
          ]);

          const hasDevices = res?.length > 0;
          resolve({
            success: hasDevices,
            data: hasDevices
              ? res.map((device: any) => ({
                  deviceId: device.id,
                  name: device.name,
                  address: device.id,
                  isConnected: true,
                  device: device,
                }))
              : [],
            message: hasDevices ? undefined : '当前无已连接的设备',
          });
        } catch (error: any) {
          console.error('[蓝牙] iOS 获取已连接设备失败', error);
          resolve({
            success: false,
            data: [],
            message: error?.message || '获取已连接设备失败',
          });
        }
      } else {
        // Android 使用回调方式
        const { BluetoothManager } = NativeModules;
        if (!BluetoothManager || !BluetoothManager.getConnectedDevices) {
          resolve({
            success: false,
            data: [],
            message: 'BluetoothManager 模块不可用',
          });
          return;
        }

        BluetoothManager.getConnectedDevices((result: any) => {
          if (result.success && result.devices?.length > 0) {
            resolve({
              success: true,
              data: result.devices.map((device: any) => ({
                deviceId: device.address,
                name: device.name,
                address: device.address,
                type: device.typeDescription,
                isConnected: device.isConnected,
                bondState: device.bondStateDescription,
                uuids: device.uuids,
                device: device,
              })),
              message: undefined,
            });
          } else {
            resolve({
              success: false,
              data: [],
              message: result.message || '当前无已连接的设备',
            });
          }
        });
      }
    } catch (error: any) {
      console.error('[蓝牙] 获取系统设备失败:', error);
      resolve({
        success: false,
        data: [],
        message: error?.message || '获取系统已连接设备失败',
      });
    }
  });
};

// ---------- 连接/断开 ----------

export const connectBluetoothDevice = (
  deviceId: string,
): Promise<{ success: boolean; data?: any; error?: any }> => {
  return new Promise(async resolve => {
    try {
      await ensureBleManagerAlive();

      // 在鸿蒙底层，调用 connectToDevice 时，如果该 Mac 从未被该 session 的 ble-plx 实例化扫描过，
      // 可能会直接抛出 "Device xx:xx not found" 的错误。在这里通过 pre-fetch 缓存尽量避免
      if (isHarmony) {
        try {
          await bleInstance.connectedDevices([
            '0000fff0-0000-1000-8000-00805f9b34fb',
          ]);
        } catch (e) {}
      }

      let connectedDevice = await bleInstance
        .connectToDevice(deviceId)
        .catch(async (e: any) => {
          const errMsg = String(e?.message || '').toLowerCase();

          // 如果抛出的是设备已经连接，说明物理已连，直接返回一个仅包裹 discover 用的外壳
          if (
            errMsg.includes('already connected') ||
            errMsg.includes('connected')
          ) {
            try {
              return await bleInstance.discoverAllServicesAndCharacteristicsForDevice(
                deviceId,
              );
            } catch (innerErr) {
              const devs = await bleInstance
                .connectedDevices(['0000fff0-0000-1000-8000-00805f9b34fb'])
                .catch(() => []);
              const target = devs.find(
                d => d.id === deviceId || isSameMac(d.id, deviceId),
              );
              if (target) return target;

              const cached = await bleInstance
                .devices([deviceId])
                .catch(() => []);
              if (cached && cached.length > 0) return cached[0];
            }
          }

          // 兜底补丁：如果在鸿蒙下抛出 not found 或 connection failed，可能是底层对象未完成实例化或处于离线失效状态，进行一次静默扫描再尝试连接
          if (
            isHarmony &&
            (errMsg.includes('not found') ||
              errMsg.includes('connection failed') ||
              errMsg.includes('disconnected'))
          ) {
            return new Promise<any>(async (res, rej) => {
              console.log(
                '[Harmony BLE] Cleaning up zombie connection before fallback scan...',
              );
              await bleInstance
                .cancelDeviceConnection(deviceId)
                .catch(() => {});
              await sleep(1500); // 留给底层断开释放并让设备重新开始广播的时间

              try {
                await bleInstance.stopDeviceScan();
              } catch (stopErr) {}
              await sleep(300);

              let isHandled = false;
              let scanTimer: ReturnType<typeof setTimeout> | null = null;
              const handleFinish = (
                hasFound: boolean,
                targetIdToConnect?: string,
                errInfo?: any,
              ) => {
                if (isHandled) return;
                isHandled = true;
                if (scanTimer) clearTimeout(scanTimer);
                bleInstance.stopDeviceScan();
                if (hasFound && targetIdToConnect) {
                  console.log(
                    `[Harmony BLE] fallback scan found device ${targetIdToConnect}, attempting connectToDevice again...`,
                  );
                  bleInstance
                    .connectToDevice(targetIdToConnect)
                    .then(res)
                    .catch(rej);
                } else {
                  console.log(
                    '[Harmony BLE] fallback scan failed to find device.',
                  );
                  rej(errInfo || e);
                }
              };

              let targetBleNo = '';
              try {
                const deviceInfoList = await storageUtil
                  .getItem<any>('bluetoothDeviceInfoList')
                  .catch(() => null);
                const deviceMap =
                  deviceInfoList && typeof deviceInfoList === 'object'
                    ? 'data' in deviceInfoList
                      ? (deviceInfoList as any).data || {}
                      : (deviceInfoList as any)
                    : {};
                for (const [bleNo, info] of Object.entries(deviceMap)) {
                  if ((info as any)?.deviceId === deviceId) {
                    targetBleNo = bleNo;
                    break;
                  }
                }
              } catch (err) {}

              if (targetBleNo) {
                console.log(
                  '[Harmony BLE] fallback scan reverse lookup targetBleNo:',
                  targetBleNo,
                );
              }

              let seen: Record<string, boolean> = {};
              bleInstance.startDeviceScan(
                null,
                { allowDuplicates: false },
                (errScan, device) => {
                  if (errScan) {
                    console.log(
                      '[Harmony BLE] fallback scan error:',
                      errScan.message,
                    );
                    return;
                  }
                  if (device) {
                    if (!seen[device.id]) {
                      seen[device.id] = true;
                      console.log(
                        `[Harmony BLE] fallback scan saw: ${device.id} name: ${
                          device.name
                        } localName: ${
                          device.localName
                        } serviceData: ${JSON.stringify(
                          device.serviceData,
                        )} manufacturerData: ${device.manufacturerData}`,
                      );
                    }
                    if (
                      device.id === deviceId ||
                      isSameMac(device.id, deviceId)
                    ) {
                      handleFinish(true, device.id);
                    } else if (
                      targetBleNo &&
                      isSameMac(device.id, targetBleNo)
                    ) {
                      console.log(
                        '[Harmony BLE] fallback scan matched original bleNo MAC!',
                      );
                      handleFinish(true, device.id);
                    } else if (
                      targetBleNo &&
                      device.name &&
                      device.name.includes(
                        targetBleNo.substring(
                          Math.max(0, targetBleNo.length - 6),
                        ),
                      )
                    ) {
                      console.log(
                        '[Harmony BLE] fallback scan matched device name containing bleNo!',
                      );
                      handleFinish(true, device.id);
                    }
                  }
                },
              );
              // 给至少5秒扫描容错时间
              scanTimer = setTimeout(() => {
                console.log('[Harmony BLE] fallback scan timeout!');
                handleFinish(false, e);
              }, 10000);
            });
          }
          throw e;
        });

      if (!connectedDevice) {
        console.log('[Harmony BLE] connectToDevice returned null');
        return resolve({
          success: false,
          error: new Error('connectToDevice returned null'),
        });
      }
      connectedDevice =
        await connectedDevice.discoverAllServicesAndCharacteristics();

      if (isHarmony) {
        // 打印系统服务树，排查 UUID 大小写或短格式问题
        try {
          const services = await connectedDevice.services();
          for (const s of services) {
            const chars = await s.characteristics();
            console.log(
              chars.map((c: any) => c.uuid),
              `[Harmony BLE] Service: ${s.uuid}, Characteristics:`,
            );
          }
        } catch (err) {
          console.log('[Harmony BLE] Query services error', err);
        }

        // 鸿蒙系统下，discover后立刻拿去监听通知可能会因为底层服务树还没映射完毕导致报错，这里多给一点点初始化时间
        await sleep(1500);
      }
      resolve({
        success: true,
        data: {
          deviceId: connectedDevice.id,
          name: connectedDevice.name,
          device: connectedDevice,
        },
      });
    } catch (error) {
      console.log('[Harmony BLE] Outer connectBluetoothDevice catch', error);
      resolve({ success: false, error });
    }
  });
};

export const disconnectBluetoothDevice = (
  deviceId: string,
): Promise<{ success: boolean }> => {
  return new Promise(async resolve => {
    try {
      await ensureBleManagerAlive();
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
          const candidates = [
            'App-Prefs:root=Bluetooth',
            'App-Prefs:root=General',
            'app-settings:',
          ];
          let opened = false;
          for (const url of candidates) {
            try {
              const canOpen = await Linking.canOpenURL(url);
              if (!canOpen) continue;
              await Linking.openURL(url);
              opened = true;
              break;
            } catch {}
          }
          if (!opened) {
            await Linking.openSettings();
          }
        } else if (isHarmony) {
          let hModule;
          try {
            hModule =
              NativeModules?.HarmonyAppInfo ||
              (global as any).TurboModuleRegistry?.get('HarmonyAppInfo');
          } catch (e) {}
          if (hModule && typeof hModule?.openBluetoothSettings === 'function') {
            await hModule.openBluetoothSettings();
          } else {
            await Linking.openSettings();
          }
        } else {
          if (
            IntentLauncher &&
            typeof IntentLauncher.startActivity === 'function'
          ) {
            await IntentLauncher.startActivity({
              action: 'android.settings.BLUETOOTH_SETTINGS',
            });
          } else {
            await Linking.openSettings();
          }
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
        { allowDuplicates: true },
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
    console.log('🔍 searchBluetoothDevices 失败:', error);
    return { success: false };
  }
};

export const stopSearchBluetoothDevices = (
  ref: RefObject<any>,
): Promise<{ success: boolean }> => {
  return new Promise(async resolve => {
    try {
      await ensureBleManagerAlive();
      await bleInstance.stopDeviceScan();
    } catch {}
    resolve({ success: true });
  });
};

// ---------- iOS 设备是否被忽略；Android 使用 NativeModules ----------

export const checkIfDeviceIgnoredOnIOS = (
  deviceId: string,
  bleNo?: string,
  bleName?: string,
): Promise<{ isIgnored: boolean; reason?: string }> => {
  return new Promise(async resolve => {
    if (Platform.OS === 'ios' || isHarmony) {
      if (!deviceId) {
        resolve({ isIgnored: false, reason: '设备ID为空' });
        return;
      }
      const SCAN_TIMEOUT_MS = 10000;
      try {
        try {
          await ensureBleManagerAlive();
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
                { allowDuplicates: true },
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
          reason: `检查失败 ${error?.message || '未知错误'}`,
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
        const isBonded =
          result.devices.some(
            (d: any) =>
              isSameMac(d.mac, deviceId) || isSameMac(d.mac, bleNo ?? ''),
          ) || result.devices.some((d: any) => d.name === bleName);
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
    // 鸿蒙系统下底层 API 返回较慢，调长超时时间；其他系统保持原有 3000ms
    const timeoutMs = isHarmony ? 8000 : 3000;
    const timeout = setTimeout(() => resolve({ success: false }), timeoutMs);
    (async () => {
      // 鸿蒙专属校验逻辑（与安卓 iOS 彻底隔离）
      if (isHarmony) {
        try {
          const getTurboModuleSafely = (name: string): any => {
            try {
              return TurboModuleRegistry.get(name);
            } catch (error) {
              return null;
            }
          };
          const hModule: any =
            NativeModules?.HarmonyAppInfo ||
            getTurboModuleSafely('HarmonyAppInfo');
          let connectedMacs: string[] = [];

          if (
            hModule &&
            typeof hModule?.getConnectedBLEDevices === 'function'
          ) {
            connectedMacs = (await hModule.getConnectedBLEDevices()) || [];
          } else {
            // Fallback: 如果原生方法还没重新编译，只能走旧配对列表
            const sysDevices = await getSystemConnectedDevices();
            connectedMacs = sysDevices.data?.map((d: any) => d.deviceId) || [];
          }

          const sysConnected = connectedMacs.some(
            (mac: string) =>
              mac === deviceIdentifier || isSameMac(mac, deviceIdentifier),
          );

          // 如果底层压根没连上，直接返回 false 让外面去触发连接
          if (!sysConnected) {
            clearTimeout(timeout);
            resolve({ success: false });
            return;
          }

          // 如果系统物理底层连着此设备，还要确认识 react-native-ble-plx 并在本上下文中缓存/发现了服务
          // 否则会引发后续通知写入时的 Device xx:xx not found
          await ensureBleManagerAlive();
          const pDevices = await bleInstance
            .devices([deviceIdentifier])
            .catch(() => []);
          if (pDevices && pDevices.length > 0) {
            const isBlePlxConnected = await pDevices[0]
              .isConnected()
              .catch(() => false);
            if (isBlePlxConnected) {
              // 【解决 Characteristic not found 的必杀技】即使系统和对象都表示已连，鸿蒙端下也必须补一刀 discover，不然缓存服务为空
              await pDevices[0]
                .discoverAllServicesAndCharacteristics()
                .catch(() => {});
              await sleep(200); // 鸿蒙系统下，discover后稍微等一下让服务树映射完毕
              clearTimeout(timeout);
              resolve({ success: true });
              return;
            }
          }

          // 系统连了但 ble-plx 不处于连接有效状态，返回 false 逼迫业务去走 connectBluetoothDevice 发现服务
          clearTimeout(timeout);
          resolve({ success: false });
          return;
        } catch (error) {
          console.log('[isDeviceConnected] 鸿蒙系统设备检查异常:', error);
        }
      }

      try {
        await ensureBleManagerAlive();
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

// 鸿蒙蓝牙 UUID 大小写兼容探针：从设备真实缓存特征树里找到和我们需要 UUID 字母顺序一致的那条原型 UUID 串
export const getRealUUIDsForHarmony = async (
  deviceId: string,
  serviceUuidTarget: string,
  characteristicUuidTarget: string,
) => {
  if (!isHarmony)
    return { sUuid: serviceUuidTarget, cUuid: characteristicUuidTarget };
  try {
    const services = await bleInstance.servicesForDevice(deviceId);
    const srv = services.find(
      s => s.uuid.toLowerCase() === serviceUuidTarget.toLowerCase(),
    );
    if (srv) {
      const chars = await bleInstance.characteristicsForDevice(
        deviceId,
        srv.uuid,
      );
      const ch = chars.find(
        c => c.uuid.toLowerCase() === characteristicUuidTarget.toLowerCase(),
      );
      if (ch) {
        return { sUuid: srv.uuid, cUuid: ch.uuid };
      }
      return { sUuid: srv.uuid, cUuid: characteristicUuidTarget };
    }
  } catch (e) {
    console.log('[Harmony BLE] getRealUUIDsForHarmony Query Fail:', e);
  }
  return { sUuid: serviceUuidTarget, cUuid: characteristicUuidTarget };
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
      // 确保 BleManager 在弹出导航等场景下仍然有效
      void ensureBleManagerAlive();
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
          console.log(
            '[Harmony BLE] Raw Characteristic in Monitor:',
            characteristic?.uuid,
            'Value:',
            characteristic?.value,
          );

          if (isHarmony && !base64) {
            return;
          }

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
      return BufferRef.from(base64, 'base64').toString('utf8');
    }
    const atobRef = (globalThis as any).atob;
    if (typeof atobRef === 'function') {
      const binary = atobRef(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      if (typeof TextDecoder !== 'undefined') {
        return new TextDecoder('utf-8').decode(bytes);
      }
      return binary;
    }
    return '';
  } catch {
    return '';
  }
};

const uint8ArrayToBase64 = (arr: Uint8Array): string => {
  try {
    let binary = '';
    const len = arr.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    const btoaRef = (globalThis as any).btoa;
    if (typeof btoaRef === 'function') {
      return btoaRef(binary);
    }

    // 如果没有 btoa，我们手写一个 base64 算法以防万一
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64 = '';
    for (let i = 0; i < len; i += 3) {
      const c1 = arr[i];
      const c2 = i + 1 < len ? arr[i + 1] : 0;
      const c3 = i + 2 < len ? arr[i + 2] : 0;

      base64 += chars[c1 >> 2];
      base64 += chars[((c1 & 3) << 4) | (c2 >> 4)];
      base64 += i + 1 < len ? chars[((c2 & 15) << 2) | (c3 >> 6)] : '=';
      base64 += i + 2 < len ? chars[c3 & 63] : '=';
    }

    return base64;
  } catch (e) {
    console.log('[Harmony BLE] base64 encode error:', e);
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
  if (byteLength > 0) {
    const rawData = uint8ArrayToBase64(
      options.once
        ? options.value
        : options.value.slice(0, byteLength > speed ? speed : byteLength),
    );

    // 恢复双端重试机制：将写命令的发送首选恢复为带响应的写入
    // 这点对于部分严格的地锁硬件固件非常重要，如果无脑WithoutResponse可能直接死等
    const writeMethod =
      bleInstance.writeCharacteristicWithResponseForDevice.bind(bleInstance);

    writeMethod(
      options.deviceId,
      options.writeServiceUuid,
      options.writeCharacteristicUuid,
      rawData,
    )
      .then(res => {
        if (byteLength > speed && !options.once) {
          sendDataToDevice({
            ...options,
            value: options.value.slice(speed, byteLength),
          });
        } else {
          options.lasterSuccess && options.lasterSuccess();
        }
      })
      .catch(err => {
        console.log(
          '[Harmony BLE] Write Failed!',
          err,
          typeof err === 'object' ? err.reason : '',
        );
        // 对所有系统（包括鸿蒙）开启 Fallback 支持：如果不被支持抛错，再自动进入 catch 包退回 WithoutResponse
        bleInstance
          .writeCharacteristicWithoutResponseForDevice(
            options.deviceId,
            options.writeServiceUuid,
            options.writeCharacteristicUuid,
            rawData,
          )
          .then(() => {
            if (byteLength > speed && !options.once) {
              sendDataToDevice({
                ...options,
                value: options.value.slice(speed, byteLength),
              });
            } else {
              options.lasterSuccess && options.lasterSuccess();
            }
          })
          .catch(err2 => {
            console.log('[Harmony BLE] Write Fallback Failed', err2);
            options.onError && options.onError(err2);
          });
      });
  }
};

// ---------- 模式指令（sendBleCommandWithAck + sendModeCommandByBluetooth）----------

type BleCommandType = 'mode' | 'pin' | 'operation' | 'near';

const calcChecksum = (bytes: number[]): number => {
  const sum = bytes.reduce((acc, cur) => acc + (cur & 0xff), 0);
  return sum & 0xff;
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
    timeoutMs = 6000,
    successMsg,
    failMsg,
  } = options;
  if (!deviceId) return { success: false, msg: '缺少设备ID' };

  const alreadyConnected = await isDeviceConnected(deviceId);
  if (!alreadyConnected.success) {
    const res = await connectBluetoothDevice(deviceId);
    if (!res.success) {
      return { success: false, msg: res.error?.message || '连接设备失败' };
    }
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

  let targetNotifySUrl = '0000fff0-0000-1000-8000-00805f9b34fb';
  let targetNotifyCUrl = '0783b03e-8535-b5a0-7140-a304d2495cb8';
  let targetWriteSUrl = '0000fff0-0000-1000-8000-00805f9b34fb';
  let targetWriteCUrl = '0783b03e-8535-b5a0-7140-a304d2495cba';

  if (isHarmony) {
    const notifyUUIDs = await getRealUUIDsForHarmony(
      deviceId,
      targetNotifySUrl,
      targetNotifyCUrl,
    );
    targetNotifySUrl = notifyUUIDs.sUuid;
    targetNotifyCUrl = notifyUUIDs.cUuid;
    const writeUUIDs = await getRealUUIDsForHarmony(
      deviceId,
      targetWriteSUrl,
      targetWriteCUrl,
    );
    targetWriteSUrl = writeUUIDs.sUuid;
    targetWriteCUrl = writeUUIDs.cUuid;
  }

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
      notifyCharacteristicUuid: targetNotifyCUrl,
      notifyServiceUuid: targetNotifySUrl,
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
    }).then(async res => {
      if (!res?.success) {
        clearTimeout(timer);
        finish({ success: false, msg: res?.msg || '发送失败' });
        return;
      }

      if (isHarmony) {
        const sleep = (ms: number) =>
          new Promise(resolve => setTimeout(resolve, ms));
        await sleep(1500); // Wait for the OS to finalize notification listener before writing
      }

      sendDataToDevice({
        deviceId,
        writeCharacteristicUuid: targetWriteCUrl,
        writeServiceUuid: targetWriteSUrl,
        value: packet,
        once: true,
        lasterSuccess: () => {
          if (isHarmony && type === 'pin') {
            // 鸿蒙专属：修改 PIN 的指令一旦下发成功，锁端会立即更新 MAC 地址并单方面断开连接
            // 底层往往来不及吐出带 200 的 ACK 且没有触发断开异常，导致上层产生“超时未收到设备响应”
            // 直接认定为成功
            clearTimeout(timer);
            finish({ success: true, code: 200, msg: successMsg });
          }
        },
        onError: err => {
          clearTimeout(timer);
          finish({ success: false, msg: err?.message || '发送失败' });
        },
      });
    });
  });
};

export const OperationCommandByBluetooth = async (options: {
  deviceId: string;
  deviceNo?: string;
  operation: number; // 1: 升起 2: 降下
  timeoutMs?: number;
}): Promise<{
  success: boolean;
  code?: number;
  deviceNo?: string;
  msg?: string;
}> => {
  const { deviceId, operation, deviceNo, timeoutMs = 6000 } = options;
  const result = await sendBleCommandWithAck({
    deviceId,
    type: 'operation',
    operation,
    deviceNo,
    timeoutMs,
    successMsg: '操作成功',
    failMsg: '操作失败',
  });

  // 上报前端日志
  try {
    const res = await saveFrontLog({
      code: 'manualLift',
      content: JSON.stringify({
        success: result.success,
        code: result.code,
        msg: result.msg,
        deviceId,
        operation,
        deviceNo,
        timestamp: Date.now(),
        mark: '手动升降',
      }),
    });
    if (res.code !== 200 || !res.success) {
      showToast(res.msg || res.message);
    }
  } catch (error) {
    console.error('上报前端日志失败:', error);
  }

  return result;
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
  const { deviceId, mode, deviceNo, timeoutMs = 6000 } = options;
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
  const { deviceId, pin, deviceNo, timeoutMs = 6000 } = options;

  // 先获取旧的MAC地址，计算新的MAC地址
  let oldBleNo: string | null = null;
  let newBleNo: string | null = null;
  let deviceInfo: any = null;

  try {
    // 获取设备信息列表
    const deviceInfoList = await storageUtil
      .getItem<any>('bluetoothDeviceInfoList')
      .catch(() => null);
    const deviceMap =
      deviceInfoList && typeof deviceInfoList === 'object'
        ? 'data' in deviceInfoList
          ? (deviceInfoList as any).data || {}
          : (deviceInfoList as any)
        : {};

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
      // 规范化旧 MAC：去掉冒号、转大写，只保留后 12 个十六进制字符
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
    // 获取最后一个字节（最后 2 个十六进制字符）
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
  const { deviceId, status, deviceNo, timeoutMs = 6000 } = options;
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
  return new Promise(async (resolve, reject) => {
    try {
      if (Platform.OS === 'ios') {
        const candidates = [
          'App-Prefs:root=Bluetooth',
          'App-Prefs:root=General',
          'app-settings:',
        ];
        let opened = false;
        for (const url of candidates) {
          try {
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) continue;
            await Linking.openURL(url);
            opened = true;
            break;
          } catch {}
        }
        if (!opened) {
          await Linking.openSettings();
        }
        resolve(true);
      } else if (isHarmony) {
        try {
          let hModule;
          try {
            hModule =
              NativeModules?.HarmonyAppInfo ||
              (global as any).TurboModuleRegistry?.get('HarmonyAppInfo');
          } catch (e) {}
          if (hModule && typeof hModule?.openBluetoothSettings === 'function') {
            await hModule.openBluetoothSettings();
          } else {
            await Linking.openSettings();
          }
          resolve(true);
        } catch (e) {
          reject(e);
        }
      } else {
        if (
          IntentLauncher &&
          typeof IntentLauncher.startActivity === 'function'
        ) {
          IntentLauncher.startActivity({
            action: 'android.settings.BLUETOOTH_SETTINGS',
          })
            .then(() => resolve(true))
            .catch(reject);
        } else {
          Linking.openSettings()
            .then(() => resolve(true))
            .catch(reject);
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};
