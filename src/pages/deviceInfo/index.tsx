import {
  Camera,
  type CameraRef,
  Flex,
  GradientButton,
  PageContainer,
  PopConfirm,
  Popup,
} from '@/components';
import {
  Image,
  Platform,
  StatusBarStyle,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './style';
import AppIcon from '@/components/AppIcon';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  changeQrCodeScan,
  getInfo,
  getLockInfo,
  getOperateResult,
  modifyLockCrashBuzzer,
  modifyLockLeaveTime,
  operateBuzzing,
  updateName,
  changeQrCode,
  resetRiseLock,
  resetRiseLockResult,
  getDeviceKeyList,
  allDeleteKey,
  allDeleteKeyResult,
} from '@/services';
import { lockInfoProps } from './typing';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import { PageContainerRef } from '@/components/PageContainer';
import PopCenter, { PopCenterRef } from '@/components/PopCenter';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { BatteryReminderPop } from './components/batteryReminderPop';
import { PopConfirmRef } from '@/components/popConfirm';
import { LockInfoDTO } from '../index/typing';
import BeeBuzzingCollisionPop from './components/beeBuzzingCollisionPop';
import {
  cacheSetSync,
  eventCenter,
  loopFunc,
  navigateBack,
  showLoading,
  hideLoading,
  showToast,
} from '@/utils';
import LeaveRiseLockPop from './components/leaveRiseLockPop';
import BluetoothStatus, {
  BluetoothStatusRef,
} from '@/components/bluetoothStatus';
import {
  runInPermissionQueue,
  showPermissionPromptIfNeeded,
} from '@/utils/permissions';
import { fontSize, px } from '@/utils/ui';
import { PickerView } from '@ant-design/react-native';

const DeviceInfo = () => {
  const { params } = useRoute() as {
    params: { lockId: number; isAdmin: boolean };
  };
  const navigation = useAppNavigation();

  const [lockInfo, setLockInfo] = useState<lockInfoProps>();
  const [deviceInfo, setDeviceInfo] = useState<LockInfoDTO>();
  const [lockName, setLockName] = useState<string>();
  const [showPowerModeTips, setShowPowerModeTips] = useState(false);
  const [lecaveType, setLecaveType] = useState<string>('1');
  const [deviceKeys, setDeviceKeys] = useState<any[]>([]);
  const [selectedDeviceKey, setSelectedDeviceKey] = useState<string>('');
  const [safeAreaColor, setSafeAreaColor] =
    useState<StatusBarStyle>('dark-content');
  const [optionType, setOptionType] = useState<string>('1');
  const [confirmContent, setConfirmContent] = useState<any>({});
  const [remoteKeyPopVisible, setRemoteKeyPopVisible] = useState(false);
  const [editNamePopVisible, setEditNamePopVisible] = useState(false);
  const [adminPopVisible, setAdminPopVisible] = useState(false);
  const pageContainerRef = useRef<PageContainerRef>(null);
  const qrCodePopRef = useRef<PopCenterRef>(null);
  const batteryReminderRef = useRef<AnimationPopRef>(null);
  const beeBuzzingCollisionRef = useRef<AnimationPopRef>(null);
  const leaveRiseLockRef = useRef<AnimationPopRef>(null);
  const changeQrCodePopRef = useRef<PopConfirmRef>(null);
  const scanBindQrCameraRef = useRef<CameraRef>(null);
  const bluetoothStatusUnbindRef = useRef<BluetoothStatusRef>(null);
  const confirmRef = useRef<PopConfirmRef>(null);
  const allDeletePopRef = useRef<PopConfirmRef>(null);
  const footerBtn = () => {
    return (
      <View style={styles.footerBtnContainer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.cancelBtn]}
          onPress={async () => {
            if (deviceInfo?.powerType !== 1) {
              await setOptionType('1');
              bluetoothStatusUnbindRef.current?.open();
            } else {
              navigation.navigate('HandOver', {
                id: deviceInfo?.id,
                bleNo: deviceInfo?.bleNo,
                needPin: deviceInfo?.needPin,
                powerType: deviceInfo?.powerType,
              });
            }
          }}
        >
          <Text style={[styles.footerBtnText, styles.cancelBtnText]}>
            移交管理员
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.confirmBtn]}
          onPress={async () => {
            if (deviceInfo?.powerType !== 1) {
              await setOptionType('2');
              bluetoothStatusUnbindRef.current?.open();
            } else {
              await cacheSetSync('deviceInfo', lockInfo);
              navigation.navigate('Unbind', {
                id: deviceInfo?.id,
                powerType: deviceInfo?.powerType,
              });
            }
          }}
        >
          <Text style={[styles.footerBtnText, styles.confirmBtnText]}>
            解除绑定
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const fetchLockInfo = useCallback(async () => {
    try {
      if (!params.lockId) return;
      const res = await getInfo({
        id: params?.lockId,
      });
      if (res.code === 200 && res.success) {
        setLockInfo(res.data);
        setLockName(res.data.lockName);
      }

      const result = await getLockInfo({
        id: params?.lockId,
      });
      if (result.code === 200 && result.success) {
        setDeviceInfo(result.data);
      }
    } catch (error) {
      console.error('fetchLockInfo Error', error);
    } finally {
      console.log('fetchLockInfo finishes');
    }
  }, [params]);

  const handleNameConfirm = async () => {
    if (!lockName?.trim()) {
      showToast({ title: '请输入名称', icon: 'info' });
      return;
    }
    showLoading({ title: '修改中...' });

    try {
      const res = await updateName({
        id: params?.lockId,
        lockName: lockName,
      });

      if (res?.success) {
        hideLoading();
        showToast({ title: '修改成功', icon: 'success' });
        setEditNamePopVisible(false);
        // 刷新数据
        pageContainerRef.current?.refresh();
      } else {
        hideLoading();
        showToast({ title: res?.message || '修改失败', icon: 'info' });
      }
    } catch (error) {
      hideLoading();
      showToast({ title: '修改异常', icon: 'info' });
    }
  };

  const handleChangeQRcode = async () => {
    const res = await changeQrCode({
      id: params?.lockId,
      code: confirmContent?.code,
      userId: null,
    });
    confirmRef.current?.close();
    showToast({
      title: res.code == 200 ? '更换成功' : res.message || '更换失败',
      icon: res.code == 200 ? 'success' : 'error',
    });
    scanBindQrCameraRef.current?.close();
    setConfirmContent({});
    pageContainerRef.current?.refresh();
  };

  useEffect(() => {
    fetchLockInfo();
  }, [fetchLockInfo]);

  const handleBindQrCodeScan = useCallback(
    async (value: string) => {
      showLoading({ title: '绑定中...' });
      try {
        const res = await changeQrCodeScan({
          id: params?.lockId,
          code: value,
        });

        if (res?.code === 200 && res?.data) {
          setConfirmContent({
            content: {
              title: '识别成功',
              content: undefined,
              img: res.data,
              confirmText: '确定更换二维码',
            },
            code: value,
          });
        } else {
          setConfirmContent({
            content: {
              title: '识别失败',
              content: res.message,
              img: undefined,
              confirmText: '重试',
            },
          });
        }

        if (Platform.OS === 'ios') {
          scanBindQrCameraRef.current?.close();
        }

        confirmRef.current?.open?.();
      } catch (error: any) {
        console.log(error, '===error');
      }
    },
    [params?.lockId],
  );

  const testBuzzer = async () => {
    showLoading({ title: '测试中...' });
    const res = await operateBuzzing({
      id: params?.lockId,
    });
    if (res?.code === 200 && res?.success) {
      hideLoading();
      showToast({ title: '蜂鸣测试成功', icon: 'success' });
    } else {
      hideLoading();
      showToast({ title: res?.message || '蜂鸣测试失败', icon: 'info' });
    }
  };

  const deviceModifyLockCrashBuzzer = async (
    buzzerTime: number,
    buzzerStatus: number,
  ) => {
    showLoading({ title: '修改中...' });
    const res = await modifyLockCrashBuzzer({
      buzzerTime,
      buzzerStatus,
      id: deviceInfo?.id,
    });
    if (res.success && res.code === 200) {
      await loopOperateStatus(11, true);
    } else {
      hideLoading();
      showToast({ title: res.message || '修改失败', icon: 'info' });
    }
    return res.success;
  };

  const deviceModifyLockLeaveTime = async (leaveUpTime: number) => {
    showLoading({ title: '修改中...' });
    const res = await modifyLockLeaveTime({ leaveUpTime, id: deviceInfo?.id });

    if (res.success) {
      hideLoading();
      showToast({ title: '操作成功', icon: 'success' });
      fetchLockInfo();
    } else {
      hideLoading();
      showToast({ title: res.message || '修改失败', icon: 'info' });
    }
    return res.success;
  };

  const deviceResetRiseLock = async (resetTime: number) => {
    showLoading({ title: '修改中...' });
    const res = await resetRiseLock({
      t: resetTime,
      deviceNo: deviceInfo?.deviceNo,
    });
    if (res.success) {
      return await loopResetRiseLock(resetTime);
    }
    hideLoading();
    showToast({ title: res.message || '修改失败', icon: 'info' });
    return false;
  };

  const loopOperateStatus = async (ot: number, hasAnimation?: boolean) => {
    let timer: any = null;
    const { start, stop } = loopFunc(async () => {
      const res = await getOperateResult({
        deviceNo: deviceInfo?.deviceNo,
        ot,
      });
      if (res.data) {
        fetchLockInfo();
        stop();
        if (!hasAnimation) {
          eventCenter.trigger('onAnimation', {
            type:
              deviceInfo?.coverStatus === 1 ? 'closeCovering' : 'openCovering',
            value: true,
          });
        }

        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        hideLoading();
        showToast({ title: '操作成功', icon: 'success' });
        return false;
      }
      return true;
    }, 1000);
    timer = setTimeout(() => {
      if (!hasAnimation) {
        eventCenter.trigger('onOptioned', false);
      }
      stop();
      showToast({ title: '操作失败', icon: 'info' });
    }, 10000);
    start();
  };

  const loopResetRiseLock = (t: number): Promise<boolean> => {
    return new Promise(resolve => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const { start, stop } = loopFunc(async () => {
        const res = await resetRiseLockResult({
          deviceNo: deviceInfo?.deviceNo,
          t,
        });
        if (res.data) {
          fetchLockInfo();
          stop();
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          hideLoading();
          showToast({ title: '操作成功', icon: 'success' });
          resolve(true);
          return false;
        }
        return true;
      }, 1000);
      timer = setTimeout(() => {
        stop();
        hideLoading();
        showToast({ title: '操作失败', icon: 'info' });
        resolve(false);
      }, 10000);
      start();
    });
  };

  const getDeviceKeys = async () => {
    const res = await getDeviceKeyList({ deviceNo: lockInfo?.deviceNo });
    if (res.code === 200 && res.success) {
      const keys = res.data.map((item: any) => {
        return {
          label: item,
          value: item,
        };
      });
      setDeviceKeys([keys]);
    }
  };

  // 解绑所有钥匙
  const handleallDeleteKey = async () => {
    showLoading({ title: '删除中...' });
    const res = await allDeleteKey({ deviceNo: lockInfo?.deviceNo });
    if (res.code === 200 && res.success) {
      return await loopallDeleteKey();
    }
    hideLoading();
    showToast({ title: res.message || '删除失败', icon: 'info' });
    return false;
  };

  // 解绑所有钥匙结果
  const loopallDeleteKey = (): Promise<boolean> => {
    return new Promise(resolve => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const { start, stop } = loopFunc(async () => {
        const res = await allDeleteKeyResult({
          deviceNo: lockInfo?.deviceNo,
        });
        if (res.data) {
          fetchLockInfo();
          stop();
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          hideLoading();
          showToast({ title: '操作成功', icon: 'success' });
          resolve(true);
          return false;
        }
        return true;
      }, 1000);
      timer = setTimeout(() => {
        stop();
        hideLoading();
        showToast({ title: '操作失败', icon: 'info' });
        resolve(false);
      }, 10000);
      start();
    });
  };

  useEffect(() => {
    if (!lockInfo?.deviceNo) return;
    getDeviceKeys();
  }, [lockInfo?.deviceNo]);

  return (
    <PageContainer
      ref={pageContainerRef}
      onRefresh={fetchLockInfo}
      backgroundColor="#FFFFFF"
      statusBarStyle={safeAreaColor}
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '设备信息',
        showBack: true,
      }}
      navBorder={true}
      scrollable
      loading={!lockInfo}
      padding={0}
      footer={deviceInfo?.role === 1 ? footerBtn() : undefined}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (showPowerModeTips) {
            setShowPowerModeTips(false);
          }
        }}
        style={{ flex: 1 }}
      >
        <Flex style={styles.container} direction="column">
          <Flex direction="row" align="center">
            <View style={styles.cardTitleLine} />
            <Text style={styles.cardTitle}>基础信息</Text>
          </Flex>
          <Flex
            isTouchView
            style={styles.cardRows}
            onPress={() => {
              if (!params.isAdmin) return;
              setEditNamePopVisible(true);
            }}
          >
            <Text style={styles.cardLable}>设备名称</Text>
            <Text style={styles.cardValue}>{lockInfo?.lockName ?? ''}</Text>
            {params.isAdmin && (
              <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
            )}
          </Flex>
          <Flex style={styles.cardRows}>
            <Text style={styles.cardLable}>地锁SN码</Text>
            <Text style={styles.cardValue}>{lockInfo?.lockId ?? ''}</Text>
          </Flex>
          <Flex
            style={[
              styles.cardRows,
              styles.powerModeRow,
              { zIndex: showPowerModeTips ? 10 : 1 },
            ]}
          >
            <Text style={styles.cardLable}>供电模式</Text>
            <Text style={[styles.cardValue, { marginRight: 4 }]}>
              {lockInfo?.powerType === 1
                ? '市电版'
                : lockInfo?.powerType === 0
                ? '电池版'
                : '未知'}
            </Text>
            {typeof lockInfo?.powerType == 'number' && (
              <TouchableOpacity
                onPress={e => {
                  e && e.stopPropagation?.();
                  setShowPowerModeTips(!showPowerModeTips);
                }}
              >
                <AppIcon
                  name={'a-styledescription'}
                  color="#333"
                  size={px(20)}
                />
              </TouchableOpacity>
            )}
            {showPowerModeTips && (
              <View style={styles.powerModeTooltip}>
                {lockInfo?.powerType === 1 && (
                  <Text style={styles.powerModeTooltipText}>
                    市电款：需连接家用电源，电力持续稳定
                  </Text>
                )}
                {lockInfo?.powerType === 0 && (
                  <Text style={styles.powerModeTooltipText}>
                    电池款：内置电池，无需布线，安装位置灵活
                  </Text>
                )}
              </View>
            )}
          </Flex>
          <Flex style={styles.cardRows}>
            <Text style={styles.cardLable}>二维码</Text>
            <Flex direction="row" align="center">
              <TouchableOpacity
                style={styles.qrCodeBtn}
                onPress={() => qrCodePopRef.current?.open()}
              >
                <Text style={styles.qrCodeBtnText}>查看</Text>
                <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
              </TouchableOpacity>
              {deviceInfo?.role === 1 && (
                <TouchableOpacity
                  style={[styles.qrCodeBtn, { marginLeft: 12 }]}
                  onPress={() => changeQrCodePopRef.current?.open()}
                >
                  <Text style={styles.qrCodeBtnText}>更换二维码</Text>
                  <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
                </TouchableOpacity>
              )}
            </Flex>
          </Flex>
          <Flex
            isTouchView
            style={styles.cardRows}
            onPress={() => {
              if (!lockInfo?.id) return;
              navigation.navigate('FirmwareVersion', {
                lockId: lockInfo?.id,
                currentVersion: lockInfo?.version || '',
              });
            }}
          >
            <Text style={styles.cardLable}>固件版本</Text>
            <Text style={styles.cardValue}>
              当前版本{lockInfo?.version ?? ''}
            </Text>
            <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
          </Flex>
          <Flex
            isTouchView
            style={styles.cardRows}
            onPress={() => {
              if (!lockInfo?.id) return;
              navigation.navigate('DeviceLog', { lockId: lockInfo?.id });
            }}
          >
            <Text style={styles.cardLable}>设备日志</Text>
            <Text style={styles.cardValue}>{'查看'}</Text>
            <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
          </Flex>

          {!params.isAdmin && (
            <Flex style={styles.cardRows}>
              <Text style={styles.cardLable}>管理员信息</Text>
              <TouchableOpacity
                style={styles.cardRowsTouch}
                onPress={() => setAdminPopVisible(true)}
              >
                <Text style={styles.cardValue}>{'查看'}</Text>
                <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
              </TouchableOpacity>
            </Flex>
          )}

          <Flex style={styles.cardLine} />
          <Flex direction="row" align="center">
            <View style={styles.cardTitleLine} />
            <Text style={styles.cardTitle}>功能设置</Text>
          </Flex>
          {lockInfo?.powerType == 0 && (
            <Flex
              // isTouchView
              style={styles.cardRows}
              // onPress={() => batteryReminderRef.current?.open()}
            >
              <Text style={styles.cardLable}>电量提醒</Text>
              <Text style={styles.cardValue}>{`电量低于${
                deviceInfo?.warnBattery ?? 20
              }%时提醒`}</Text>
            </Flex>
          )}
          {lockInfo?.powerType == 0 && (
            <Flex
              isTouchView
              style={styles.cardRows}
              onPress={() => batteryReminderRef.current?.open()}
            >
              <Text style={styles.cardLable}>充电指导</Text>
              <Text style={styles.cardValue}>{'查看'}</Text>
              <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
            </Flex>
          )}

          {deviceInfo?.powerType === 1 && (
            <Flex
              style={
                (styles.cardRows,
                lockInfo?.powerType === 1 ? {} : { alignItems: 'flex-start' })
              }
            >
              {lockInfo?.powerType === 1 ? (
                <>
                  <Text style={styles.cardLable}>碰撞蜂鸣</Text>
                  <TouchableOpacity
                    style={styles.cardRowsTouch}
                    onPress={() => {
                      if (lockInfo?.powerType !== 1) return;
                      beeBuzzingCollisionRef.current?.open();
                    }}
                  >
                    <Text style={styles.cardValue}>
                      {deviceInfo?.buzzerStatus === 1 ? '已开启' : '未开启'}
                    </Text>
                    <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.cardLable}>碰撞蜂鸣</Text>
                  <View
                    style={[
                      styles.cardValue,
                      {
                        alignSelf: 'flex-end',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                      },
                    ]}
                  >
                    <Flex direction="row" align="center">
                      <Text style={styles.cardValue}>蜂鸣测试</Text>
                      <TouchableOpacity
                        style={styles.testBtn}
                        onPress={async () => {
                          console.log('===testBuzzer');
                          await testBuzzer();
                        }}
                      >
                        <Text style={styles.testBtnText}>测试</Text>
                      </TouchableOpacity>
                    </Flex>
                    <Text style={styles.toastText}>{`触发碰撞蜂鸣${
                      deviceInfo?.buzzerTime ?? '10'
                    }秒后停止蜂鸣`}</Text>
                  </View>
                </>
              )}
            </Flex>
          )}

          <Flex style={styles.cardRows}>
            <Text style={styles.cardLable}>离车升锁</Text>
            <TouchableOpacity
              style={styles.cardRowsTouch}
              onPress={() => {
                if (lockInfo?.powerType !== 1) {
                  return;
                }
                leaveRiseLockRef.current?.open();
                setLecaveType('1');
              }}
            >
              <Text
                style={styles.cardValue}
              >{`车辆离开${lockInfo?.leaveUpTime}秒后升起`}</Text>
              {lockInfo?.powerType === 1 && (
                <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
              )}
            </TouchableOpacity>
          </Flex>
          {lockInfo?.has433Key && (
            <Flex style={styles.cardRows}>
              <Flex direction="row" align="center" style={{ gap: px(4) }}>
                <Text style={styles.cardLable}>遥控钥匙</Text>
              </Flex>

              <TouchableOpacity
                style={styles.cardRowsTouch}
                onPress={() => {
                  if (lockInfo?.keyCount === 0) {
                    if (lockInfo?.buttonKeyFlag) {
                      navigation.navigate('RemoteKeyPairingVideo');
                    } else {
                      navigation.navigate('RemoteKeyPairingVideo', {
                        lockId: lockInfo?.id,
                      });
                    }
                  } else {
                    setRemoteKeyPopVisible(true);
                  }
                }}
              >
                <Text style={styles.cardValue}>
                  {lockInfo?.keyCount === 0 ? '未绑定,新增钥匙' : '已绑定'}
                </Text>
                <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
              </TouchableOpacity>
            </Flex>
          )}

          <Flex style={styles.cardRows}>
            <Text style={styles.cardLable}>复位升锁</Text>
            <TouchableOpacity
              style={styles.cardRowsTouch}
              onPress={() => {
                if (lockInfo?.powerType !== 1) {
                  return;
                }
                leaveRiseLockRef.current?.open();
                setLecaveType('2');
              }}
            >
              <Text style={styles.cardValue}>{`地锁降下${
                lockInfo?.resetTime || 20
              }秒，无车自动复位升起`}</Text>
              {lockInfo?.powerType === 1 && (
                <AppIcon name={'a-headfor-20'} color="#333" size={px(20)} />
              )}
            </TouchableOpacity>
          </Flex>
        </Flex>
      </TouchableOpacity>

      {/* 编辑地锁名称弹窗 */}
      <Popup
        visible={editNamePopVisible}
        showClose={false}
        onClose={() => setEditNamePopVisible(false)}
      >
        <View style={[styles.editContainer, { paddingBottom: px(8) }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>编辑地锁名称</Text>
          </View>

          <View style={styles.editContent}>
            <View style={styles.editItem}>
              <Text style={styles.editLabel}>{'地锁名称'}</Text>
              <TextInput
                style={styles.input}
                value={lockName}
                onChangeText={setLockName}
                placeholder="请输入名称"
                placeholderTextColor="#999"
                maxLength={20}
              />
              <AppIcon name={'redact'} color="#999" size={px(20)} />
            </View>
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelPopBtn]}
              onPress={() => setEditNamePopVisible(false)}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, styles.confirmPopBtn]}
              onPress={handleNameConfirm}
            >
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setEditNamePopVisible(false)}>
              <AppIcon name={'close'} color="#333" size={px(24)} />
            </TouchableOpacity>
          </View>
        </View>
      </Popup>

      {/* 查看二维码弹框 */}
      <PopCenter
        height={px(226)}
        ref={qrCodePopRef}
        showHeader={false}
        showCancel={false}
        confirmText="关闭"
      >
        <View style={styles.qrCodeContainer}>
          {lockInfo?.qrCode ? (
            <Image
              source={{ uri: lockInfo.qrCode }}
              style={{ width: px(160), height: px(160) }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ color: '#999999' }}>暂无二维码</Text>
          )}
        </View>
      </PopCenter>

      {/* 更换二维码确认弹窗 */}
      <PopConfirm
        ref={changeQrCodePopRef}
        title="确认更换二维码吗？"
        confirmText="扫码绑定"
        onConfirm={async () => {
          await changeQrCodePopRef.current?.close();
          await runInPermissionQueue(async () => {
            const hasPrompted = await showPermissionPromptIfNeeded('camera');
            if (!hasPrompted) return;
            setSafeAreaColor('light-content');
            setTimeout(() => {
              scanBindQrCameraRef.current?.open();
            }, 350);
          });
        }}
      />

      <Camera
        ref={scanBindQrCameraRef}
        present="modal"
        mask={false}
        maskClosable={false}
        onClose={() => {
          hideLoading();
          setSafeAreaColor('dark-content');
        }}
        onScan={handleBindQrCodeScan}
        title="扫码绑定"
        content={
          <View style={styles.scanFrameWrapper}>
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/device_scan.png',
              }}
              style={styles.scanFrame}
              resizeMode="contain"
            />
          </View>
        }
      />

      <BatteryReminderPop
        ref={batteryReminderRef}
        defaultDetails={lockInfo}
        refresh={fetchLockInfo}
      />

      <BeeBuzzingCollisionPop
        ref={beeBuzzingCollisionRef}
        deviceId={deviceInfo?.id}
        isOpen={deviceInfo?.buzzerStatus === 1}
        time={deviceInfo?.buzzerTime ?? 10}
        onConfirm={async ({ buzzerTime, buzzerStatus }) => {
          return await deviceModifyLockCrashBuzzer(buzzerTime, buzzerStatus);
        }}
      />

      <LeaveRiseLockPop
        ref={leaveRiseLockRef}
        lecaveType={lecaveType}
        time={
          lecaveType === '1'
            ? Number(deviceInfo?.leaveUpTime)
            : Number(deviceInfo?.resetTime)
        }
        onConfirm={async leaveUpTime => {
          if (lecaveType === '1') {
            return await deviceModifyLockLeaveTime(leaveUpTime);
          } else {
            return await deviceResetRiseLock(leaveUpTime);
          }
        }}
      />

      <Popup
        visible={adminPopVisible}
        showClose={false}
        onClose={() => setAdminPopVisible(false)}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: px(16),
          }}
        >
          <View style={{ width: px(24), height: px(24) }}></View>
          <Text style={styles.adminInfoTitle}>管理员信息</Text>
          <TouchableOpacity onPress={() => setAdminPopVisible(false)}>
            <AppIcon name={'close'} color="#333" size={px(24)} />
          </TouchableOpacity>
        </View>
        <View style={styles.adminInfo}>
          <Text style={styles.adminInfoText}>
            姓名：{lockInfo?.adminUsername}
          </Text>
          <Text style={styles.adminInfoText}>
            联系方式：{lockInfo?.adminMobile}
          </Text>
        </View>
      </Popup>

      <BluetoothStatus
        ref={bluetoothStatusUnbindRef}
        details={{
          ...deviceInfo,
        }}
        type="pass"
        onSuccess={async () => {
          if (optionType === '1') {
            navigation.navigate('HandOver', {
              id: deviceInfo?.id,
              bleNo: deviceInfo?.bleNo,
              needPin: deviceInfo?.needPin,
            });
          } else {
            await cacheSetSync('deviceInfo', lockInfo);
            navigation.navigate('Unbind', {
              id: deviceInfo?.id,
              needPin: deviceInfo?.needPin,
            });
          }
        }}
      />

      <PopConfirm
        ref={confirmRef}
        title={
          <Flex direction="column" justify="center" align="center">
            <Text style={{ fontSize: fontSize(16), fontWeight: 'bold' }}>
              {confirmContent?.content?.title}
            </Text>
            {confirmContent?.content?.img ? (
              <Image
                source={{ uri: confirmContent?.content?.img }}
                style={{ width: px(120), height: px(120) }}
                resizeMode="contain"
              />
            ) : (
              <Text>{confirmContent?.content?.content}</Text>
            )}
          </Flex>
        }
        showClose
        cancelText="取消"
        submitBtn={
          <GradientButton
            colors={['#282828', '#4A4A4A']}
            width={px(124)}
            height={px(40)}
            onPress={async () => {
              confirmContent?.content?.img
                ? handleChangeQRcode()
                : confirmRef.current?.close();
            }}
            style={[styles.btnContainer, styles.btnContainerConfirm]}
          >
            <Text
              style={styles.btnContainerConfirmText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {confirmContent?.content?.confirmText}
            </Text>
          </GradientButton>
        }
        onCancel={() => {
          confirmRef.current?.close();
          scanBindQrCameraRef.current?.close();
          setConfirmContent({});
        }}
      />

      {/* 遥控钥匙 */}
      <Popup
        visible={remoteKeyPopVisible}
        showClose={false}
        onClose={() => setRemoteKeyPopVisible(false)}
      >
        <View style={[styles.editContainer, { paddingBottom: px(8) }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>遥控钥匙</Text>
          </View>

          <View style={styles.pickerContent}>
            <PickerView
              data={deviceKeys}
              cascade={false}
              style={{ height: px(174) }}
              itemHeight={px(44)}
              itemStyle={{
                padding: 0,
              }}
              defaultValue={[deviceKeys[0]?.value]}
              onChange={value => {
                setSelectedDeviceKey((value[0] as string) || '');
              }}
            />
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelPopBtn]}
              onPress={() => {
                setRemoteKeyPopVisible(false);
                if (lockInfo?.buttonKeyFlag) {
                  navigation.navigate('RemoteKeyPairingVideo');
                } else {
                  navigation.navigate('RemoteKeyPairingVideo', {
                    lockId: lockInfo?.id,
                  });
                }
              }}
            >
              <Text style={styles.cancelText}>新增钥匙</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, styles.confirmPopBtn]}
              onPress={() => {
                setRemoteKeyPopVisible(false);
                navigation.navigate('RemoteKeyUnbind', {
                  deviceNo: lockInfo?.deviceNo,
                  key: selectedDeviceKey,
                  id: lockInfo?.id,
                  hasButtonKeyFlag: lockInfo?.buttonKeyFlag,
                });
              }}
            >
              <Text style={styles.confirmText}>解绑</Text>
            </TouchableOpacity>
          </View>

          {lockInfo?.buttonKeyFlag && (
            <View style={styles.closeIcon}>
              <Flex
                isTouchView
                align="center"
                justify="center"
                style={{ gap: px(4) }}
                onPress={e => {
                  e && e.stopPropagation?.();
                  allDeletePopRef.current?.open();
                }}
              >
                <Text style={styles.cardValueLinkText}>全部删除</Text>
              </Flex>
            </View>
          )}
        </View>
      </Popup>

      {/* 全部删除弹窗 */}
      <PopConfirm
        ref={allDeletePopRef}
        title="确认解绑所有钥匙吗？"
        confirmText="确定"
        onConfirm={async () => await handleallDeleteKey()}
      />
    </PageContainer>
  );
};

export default DeviceInfo;
