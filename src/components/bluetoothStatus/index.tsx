import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { LOCK_ROLE } from '@/constants';
import {
  getBluetoothDeviceInfo,
  hideLoading,
  showLoading,
  showToast,
} from '@/utils';
import {
  openBluetoothSettings,
  sendModeCommandByBluetooth,
  getSystemConnectedDevices,
} from '@/utils/api';
import {
  bluetoothModeManager,
  BluetoothCheckResult,
} from '@/utils/bluetoothModeManager';
import { groupSubList, switchBluetoothMode } from '@/services';
import Flex from '../Flex';
import PopConfirm, { type PopConfirmRef } from '../popConfirm';
import Popup from '../Popup';
import { styles } from './style';

// 弹窗类型定义
type ModalType = 'bluetooth_off' | 'not_connected' | 'not_paired' | 'unknown';

interface Props {
  onSuccess?: () => void;
  details: any;
  type: 'operation' | 'mode' | 'os' | 'pass'; // 操作/模式切换/远程开启/pin码
  closePopup?: () => void;
}

// 提示文案配置
const titleMap: Record<
  string,
  { title: string; subtitle?: string; buttonText: string }
> = {
  bluetooth_off: {
    title: '切换必须连上蓝牙才能切换至【性能优先】模式',
    subtitle: '开启蓝牙，以便查找附近的设备',
    buttonText: '开启蓝牙',
  },
  not_connected: {
    title: '温馨提示',
    subtitle: '必须连上蓝牙才能操作',
    buttonText: '前往连接',
  },
  unknown: {
    title: '温馨提示',
    subtitle: '检测设备状态失败，请稍后重试',
    buttonText: '关闭',
  },
};

const pasTitleMap: Record<
  string,
  { title: string; subtitle?: string; buttonText: string }
> = {
  bluetooth_off: {
    title: '必须开启蓝牙才能操作',
    subtitle: '开启蓝牙，以便查找附近的设备',
    buttonText: '开启蓝牙',
  },
  not_connected: {
    title: '温馨提示',
    subtitle: '必须连上蓝牙才能操作',
    buttonText: '前往连接',
  },
  unknown: {
    title: '温馨提示',
    subtitle: '检测设备状态失败，请稍后重试',
    buttonText: '关闭',
  },
};

const BLE_STATUS = {
  UNPAIRED: 0,
  PAIRED_FAR: 1,
  CONNECTED: 2,
};

export type BluetoothStatusRef = {
  open: () => Promise<void> | void;
  close: () => void;
};

export const BluetoothStatus = forwardRef<BluetoothStatusRef, Props>(
  function BluetoothStatusInner(props, ref) {
    const navigation = useAppNavigation();

    const bluetoothPopupRef = useRef<PopConfirmRef>(null);
    const adminOnlyRef = useRef<PopConfirmRef>(null);
    const switchModeConfirmRef = useRef<PopConfirmRef>(null);
    const operationConfirmRef = useRef<PopConfirmRef>(null);

    const [bluetoothErrorType, setBluetoothErrorType] =
      useState<ModalType>('unknown');
    const [groupList, setGroupList] = useState<any[]>([]);
    const [groupListVisible, setGroupListVisible] = useState(false);
    const [currentConnectDevice, setCurrentConnectDevice] = useState<any>(null);

    const sleep = useCallback(
      (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)),
      [],
    );

    const runSingleBluetoothCheck = useCallback(async () => {
      let deviceId = props.details?.bleNo || '';
      try {
        const cached: Record<string, any> =
          (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
        const cachedDeviceId = cached?.[props.details?.bleNo]?.deviceId;
        if (cachedDeviceId) deviceId = String(cachedDeviceId);
      } catch {}

      const checkResult: BluetoothCheckResult =
        await bluetoothModeManager.checkBeforeOperation(props.details?.bleNo);

      if (!checkResult.success) {
        const type = (checkResult.errorType || 'unknown') as ModalType;
        setBluetoothErrorType(type);
        bluetoothPopupRef.current?.open();
        return;
      }

      hideLoading();

      if (props.type === 'pass') {
        props.onSuccess?.();
        return;
      }

      try {
        showLoading({ title: '检查蓝牙状态' });

        const currentMode = Number(props.details?.mode ?? 1);
        const targetMode = currentMode === 2 ? 1 : 2;
        const cmdRes = await sendModeCommandByBluetooth({
          deviceId,
          mode: targetMode,
        });

        if (!cmdRes?.success) {
          hideLoading();
          showToast({
            title: cmdRes?.msg || '蓝牙模式切换失败，请重试',
            icon: 'error',
          });
          return;
        }

        await sleep(5000);

        const apiRes: any = await switchBluetoothMode({
          lockId: props.details?.id,
          mode: targetMode,
        });

        if (!(apiRes?.code === 200 && apiRes?.success)) {
          hideLoading();
          showToast({
            title: apiRes?.message || apiRes?.msg || '模式切换失败，请稍后重试',
            icon: 'error',
          });
          return;
        }

        hideLoading();
        showToast({
          title: '模式切换成功',
          icon: 'success',
        });

        props.onSuccess?.();
      } catch (error) {
        hideLoading();
        showToast({
          title: '模式切换异常，请稍后重试',
          icon: 'error',
        });
      }
    }, [hideLoading, props.details, props.onSuccess, props.type, sleep]);

    const runGroupBluetoothCheck = useCallback(async () => {
      showLoading({ title: '检查蓝牙状态' });

      try {
        let currentList = groupList;
        if (!currentList || currentList.length === 0) {
          const res: any = await groupSubList({
            id: props.details?.id,
            pageSize: 100,
            offset: 0,
          });
          currentList = res?.data?.list || res?.list || [];
        }

        const bluetoothDeviceInfoList: Record<string, any> =
          (await getBluetoothDeviceInfo().catch(() => ({}))) || {};

        const updatedList = [...currentList];
        const needsBleCheck = updatedList.some((item: any) => item.mode === 2);

        await Promise.all(
          updatedList.map(async (item: any, index: number) => {
            if (needsBleCheck) {
              let status = BLE_STATUS.UNPAIRED;

              let targetDeviceId: string | undefined = undefined;
              try {
                if (item.bleNo && bluetoothDeviceInfoList[item.bleNo]) {
                  targetDeviceId =
                    bluetoothDeviceInfoList[item.bleNo]?.deviceId;
                }
                if (!targetDeviceId) {
                  const values = Object.values(
                    bluetoothDeviceInfoList,
                  ) as any[];
                  const found = values.find(
                    v =>
                      v &&
                      (v.bleNo === item.bleNo ||
                        v.deviceNo === item.deviceNo ||
                        v.deviceId === item.deviceId),
                  );
                  if (found) targetDeviceId = found.deviceId;
                }
              } catch (e) {
                console.error('读取 bluetoothDeviceInfo 映射失败:', e);
              }

              const checkId = (
                targetDeviceId ||
                item.bleNo ||
                item.deviceId ||
                ''
              ).toString();

              const info = await getSystemConnectedDevices();
              const isPaired =
                info.data?.some((it: any) => it.deviceId === checkId) || false;

              if (targetDeviceId && !isPaired) {
                status = BLE_STATUS.PAIRED_FAR;
              }
              if (isPaired) {
                status = BLE_STATUS.CONNECTED;
              }
              updatedList[index].bleStatus = status;
            } else {
              updatedList[index].bleStatus = BLE_STATUS.CONNECTED;
            }
          }),
        );

        const allConnected = updatedList.every(
          (item: any) => item.bleStatus === BLE_STATUS.CONNECTED,
        );

        setGroupList(updatedList);
        hideLoading();

        if (allConnected) {
          try {
            showLoading({ title: '切换模式中...' });
            const currentMode = Number(props.details?.mode ?? 1);
            const targetMode = currentMode === 2 ? 1 : 2;

            const results = await Promise.allSettled(
              updatedList.map(async (item: any) => {
                let deviceId: string | undefined = undefined;
                try {
                  if (item.bleNo && bluetoothDeviceInfoList[item.bleNo]) {
                    deviceId = bluetoothDeviceInfoList[item.bleNo]?.deviceId;
                  }
                  if (!deviceId) {
                    const values = Object.values(
                      bluetoothDeviceInfoList,
                    ) as any[];
                    const found = values.find(
                      v =>
                        v &&
                        (v.bleNo === item.bleNo ||
                          v.deviceNo === item.deviceNo ||
                          v.deviceId === item.deviceId),
                    );
                    if (found) deviceId = found.deviceId;
                  }
                } catch (e) {
                  console.error('组合设备读取 bluetoothDeviceInfo 失败:', e);
                }

                if (!deviceId) {
                  throw new Error('未找到设备的 deviceId，无法切换模式');
                }

                const cmdRes = await sendModeCommandByBluetooth({
                  deviceId,
                  mode: targetMode,
                });
                if (!cmdRes?.success) {
                  throw new Error(cmdRes?.msg || '蓝牙模式切换失败，请重试');
                }

                await sleep(5000);

                const apiRes: any = await switchBluetoothMode({
                  lockId: item.id,
                  mode: targetMode,
                });
                if (!(apiRes?.code === 200 && apiRes?.success)) {
                  throw new Error(
                    apiRes?.message ||
                      apiRes?.msg ||
                      '模式切换失败，请稍后重试',
                  );
                }
              }),
            );

            const failedCount = results.filter(
              r => r.status === 'rejected',
            ).length;
            const successCount = results.filter(
              r => r.status === 'fulfilled',
            ).length;

            if (failedCount === 0) {
              hideLoading();
              showToast({ title: '模式切换成功', icon: 'success' });
              props.onSuccess?.();
            } else if (successCount > 0) {
              hideLoading();
              showToast({
                title: `${successCount}/${results.length} 个设备切换成功`,
                icon: 'error',
              });
            } else {
              hideLoading();
              showToast({ title: '模式切换失败，请稍后重试', icon: 'error' });
            }
          } catch (e) {
            hideLoading();
            showToast({ title: '模式切换异常，请稍后重试', icon: 'error' });
          }
        } else {
          setGroupListVisible(true);
        }
      } catch (error) {
        hideLoading();
        showToast({ title: '获取组合信息失败', icon: 'error' });
        console.error(error);
      }
    }, [
      groupList,
      hideLoading,
      props.details,
      props.onSuccess,
      showLoading,
      sleep,
    ]);

    const runBluetoothCheck = useCallback(async () => {
      if (props.details?.mode === 1) {
        props.onSuccess?.();
        return;
      }
      if (props.details?.isGroup) {
        await runGroupBluetoothCheck();
      } else {
        await runSingleBluetoothCheck();
      }
    }, [
      props.details,
      props.onSuccess,
      runGroupBluetoothCheck,
      runSingleBluetoothCheck,
    ]);

    const validateAndRun = useCallback(async () => {
      if (props.details?.role !== LOCK_ROLE.ADMIN) {
        adminOnlyRef.current?.open();
        return;
      }
      await runBluetoothCheck();
    }, [props.details, runBluetoothCheck]);

    const handleBluetoothAction = useCallback(async () => {
      bluetoothPopupRef.current?.close();
      props.closePopup?.();
      if (bluetoothErrorType === 'unknown') return;

      const targetDevice = currentConnectDevice || props.details;

      if (bluetoothErrorType === 'bluetooth_off') {
        await openBluetoothSettings();
      } else if (bluetoothErrorType === 'not_paired') {
        navigation.navigate('FindDevice' as any, {
          bleNo: targetDevice.bleNo,
          lockName: targetDevice.lockName,
          lockId: targetDevice.id,
          imageMap: targetDevice.imageMap,
          pin: targetDevice.blePin ?? targetDevice.pin ?? '',
          mode: targetDevice.mode ?? 1,
          deviceNo: targetDevice.deviceNo,
          role: targetDevice.role,
          needPin: targetDevice.needPin,
          pageName: 'BluetoothControl',
        });
      } else if (bluetoothErrorType === 'not_connected') {
        navigation.navigate('FindDevice', {
          bleNo: targetDevice.bleNo,
          lockName: targetDevice.lockName,
          lockId: targetDevice.id,
          imageMap: targetDevice.imageMap,
          pin: targetDevice.blePin ?? targetDevice.pin ?? '',
          mode: targetDevice.mode ?? 1,
          bleName: targetDevice.bleName,
          deviceNo: targetDevice.deviceNo,
          role: targetDevice.role,
          needPin: targetDevice.needPin,
          pageName: 'BluetoothControl',
        });
        setCurrentConnectDevice(null);
      }
    }, [
      bluetoothErrorType,
      currentConnectDevice,
      navigation,
      props.closePopup,
      props.details,
    ]);

    const handleGroupItemConnect = useCallback(
      async (item: any) => {
        try {
          showLoading({ title: '切换模式中...' });
          const checkResult: BluetoothCheckResult =
            await bluetoothModeManager.checkBeforeOperation(item.bleNo);
          hideLoading();
          if (!checkResult.success) {
            let errorType = checkResult.errorType || 'unknown';
            if (errorType === 'no_permission') errorType = 'unknown';
            setBluetoothErrorType(errorType as ModalType);
            setCurrentConnectDevice(item);
            setGroupListVisible(false);
            bluetoothPopupRef.current?.open();
            return;
          }
          setGroupListVisible(false);
          navigation.navigate('FindDevice' as any, {
            bleNo: item.bleNo,
            lockName: item.lockName,
            lockId: item.id,
            imageMap: item.imageMap,
            pin: item.blePin ?? '',
            mode: item.mode ?? 1,
            bleName: item.bleName,
            needPin: item.needPin,
          });
        } catch (error) {
          console.error('handleGroupItemConnect error', error);
          hideLoading();
          setBluetoothErrorType('unknown');
          setCurrentConnectDevice(item);
          setGroupListVisible(false);
          bluetoothPopupRef.current?.open();
        }
      },
      [hideLoading, navigation, showLoading],
    );

    const handleModeSwitchConfirm = useCallback(async () => {
      switchModeConfirmRef.current?.close();
      await validateAndRun();
    }, [validateAndRun]);

    const handleOperationConfirm = useCallback(async () => {
      operationConfirmRef.current?.close();
      await validateAndRun();
    }, [validateAndRun]);

    useImperativeHandle(
      ref,
      () => ({
        open: async () => {
          if (props.type === 'mode') {
            switchModeConfirmRef.current?.open();
          } else if (props.type === 'pass') {
            showLoading({ title: '检查蓝牙状态' });
            try {
              await runSingleBluetoothCheck();
            } finally {
              hideLoading();
            }
          } else {
            operationConfirmRef.current?.open();
          }
        },
        close: () => {
          bluetoothPopupRef.current?.close();
          adminOnlyRef.current?.close();
          switchModeConfirmRef.current?.close();
          operationConfirmRef.current?.close();
          setGroupListVisible(false);
        },
      }),
      [hideLoading, props.type, runSingleBluetoothCheck, showLoading],
    );

    const currentTitleMap = props.type === 'pass' ? pasTitleMap : titleMap;
    const currentConfig =
      currentTitleMap[bluetoothErrorType] || currentTitleMap.unknown;
    const targetModeName = props.details?.mode === 1 ? '续航优先' : '性能优先';

    const groupListBody = (
      <ScrollView style={{ maxHeight: 300, width: '100%' }}>
        <View style={styles.groupListContent}>
          {groupList.map((item: any) => (
            <View key={String(item.id)} style={styles.groupListItem}>
              <Text style={styles.groupListItemText} numberOfLines={1}>
                {item.lockName}
              </Text>
              {item.bleStatus === BLE_STATUS.CONNECTED ? (
                <Text style={styles.groupListItemTextConnected}>已连接</Text>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.groupListItemButton}
                  onPress={() => void handleGroupItemConnect(item)}
                >
                  <Text style={styles.groupListItemButtonText}>前往连接</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );

    return (
      <>
        <PopConfirm
          ref={switchModeConfirmRef}
          title={
            <Flex direction="column" align="center" justify="center">
              <Text style={styles.popTitle}>
                确定要切换至【{targetModeName}】模式
              </Text>
            </Flex>
          }
          cancelText="暂不切换"
          confirmText="确定切换"
          onCancel={() => switchModeConfirmRef.current?.close()}
          onConfirm={handleModeSwitchConfirm}
        />

        <PopConfirm
          ref={operationConfirmRef}
          title={
            <Flex direction="column" align="center" justify="center">
              <Text style={styles.popTitle}>
                {`${
                  props.type === 'os'
                    ? '远程开启，'
                    : props.details?.isGroup
                    ? '组合设备'
                    : ''
                }需要切换至【性能优先】模式才可操作确定要切换吗？`}
              </Text>
            </Flex>
          }
          cancelText="暂不切换"
          onCancel={() => operationConfirmRef.current?.close()}
          submitBtn={
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.operationConfirmButton}
              onPress={() => void handleOperationConfirm()}
            >
              <Text style={styles.operationConfirmButtonText}>
                切换至【性能优先】
              </Text>
            </TouchableOpacity>
          }
        />

        <PopConfirm
          ref={bluetoothPopupRef}
          title={
            <Flex direction="column" align="center">
              <Text style={styles.popTitle}>{currentConfig.title}</Text>
              {currentConfig.subtitle ? (
                <Text style={styles.popText}>{currentConfig.subtitle}</Text>
              ) : null}
            </Flex>
          }
          cancelText="取消"
          showClose={bluetoothErrorType !== 'unknown'}
          confirmText={currentConfig.buttonText}
          onConfirm={handleBluetoothAction}
        />

        <Popup
          visible={groupListVisible}
          onClose={() => setGroupListVisible(false)}
          title="组合设备需连接上蓝牙进行切换"
          minHeight={300}
        >
          {groupListBody}
        </Popup>

        <PopConfirm
          ref={adminOnlyRef}
          showClose={false}
          confirmText="我已知晓"
          onConfirm={() => adminOnlyRef.current?.close()}
          title={<Text style={styles.popTitle}>仅管理员可切换模式</Text>}
        />
      </>
    );
  },
);

export default BluetoothStatus;
