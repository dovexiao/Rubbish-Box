import {
  Camera,
  type CameraRef,
  Flex,
  PageContainer,
  PopConfirm,
} from '@/components';
import {
  Image,
  StatusBarStyle,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './style';
import IconFont from '@/iconfont';
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

const DeviceInfo = () => {
  const { params } = useRoute() as {
    params: { lockId: number; isAdmin: boolean };
  };
  const navigation = useAppNavigation();

  const [lockInfo, setLockInfo] = useState<lockInfoProps>();
  const [deviceInfo, setDeviceInfo] = useState<LockInfoDTO>();
  const [lockName, setLockName] = useState<string>();
  const [showPowerModeTips, setShowPowerModeTips] = useState(false);
  const [safeAreaColor, setSafeAreaColor] =
    useState<StatusBarStyle>('dark-content');
  const [optionType, setOptionType] = useState<string>('1');

  const editNamePopRef = useRef<AnimationPopRef>(null);
  const pageContainerRef = useRef<PageContainerRef>(null);
  const qrCodePopRef = useRef<PopCenterRef>(null);
  const batteryReminderRef = useRef<AnimationPopRef>(null);
  const beeBuzzingCollisionRef = useRef<AnimationPopRef>(null);
  const leaveRiseLockRef = useRef<AnimationPopRef>(null);
  const changeQrCodePopRef = useRef<PopConfirmRef>(null);
  const scanBindQrCameraRef = useRef<CameraRef>(null);
  const adminRef = useRef<AnimationPopRef>(null);
  const bluetoothStatusUnbindRef = useRef<BluetoothStatusRef>(null);

  const footerBtn = () => {
    return (
      <View style={styles.footerBtnContainer}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.cancelBtn]}
          onPress={async () => {
            console.log('移交管理员');
            await setOptionType('1');
            // bluetoothStatusUnbindRef.current?.open();
            navigation.navigate('HandOver', {
              id: deviceInfo?.id,
              bleNo: deviceInfo?.bleNo,
            });
          }}
        >
          <Text style={[styles.footerBtnText, styles.cancelBtnText]}>
            移交管理员
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerBtn, styles.confirmBtn]}
          onPress={async () => {
            await setOptionType('2');
            // bluetoothStatusUnbindRef.current?.open();
            navigation.navigate('Unbind', { id: deviceInfo?.id });
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
  }, [params]);

  const handleNameConfirm = async () => {
    if (!lockName?.trim()) {
      showToast('请输入名称');
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
        showToast('修改成功');
        editNamePopRef.current?.close();
        // 刷新数据
        pageContainerRef.current?.refresh();
      } else {
        hideLoading();
        showToast(res?.message || '修改失败');
      }
    } catch (error) {
      hideLoading();
      showToast('修改异常');
    }
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
          qrCode: value,
        });
        hideLoading();
        if (res?.success) {
          showToast('绑定成功');
          // scanBindQrPopRef.current?.close();
          pageContainerRef.current?.refresh();
          return { ok: true, data: res };
        }
        return { ok: false, message: res?.message || '绑定失败', data: res };
      } catch (error: any) {
        hideLoading();
        return { ok: false, message: '绑定异常', error };
      }
    },
    [params?.lockId],
  );

  const testBuzzer = async () => {
    const res = await operateBuzzing({
      id: params?.lockId,
    });
    if (res?.code === 200 && res?.success) {
      showToast('蜂鸣测试成功');
    } else {
      showToast(res?.message || '蜂鸣测试失败');
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
      loopOperateStatus(11);
    } else {
      hideLoading();
      showToast(res.message || '修改失败');
    }
    return res.success;
  };

  const deviceModifyLockLeaveTime = async (leaveUpTime: number) => {
    showLoading({ title: '修改中...' });
    const res = await modifyLockLeaveTime({ leaveUpTime, id: deviceInfo?.id });
    if (res.success) {
      fetchLockInfo();
    } else {
      showToast(res.message || '修改失败');
    }
    return res.success;
  };

  const loopOperateStatus = async (ot: number) => {
    let timer: any = null;
    let result: any = null;
    const { start, stop } = loopFunc(async () => {
      const res = await getOperateResult({
        deviceNo: deviceInfo?.deviceNo,
        ot,
      });
      result = res;
      if (res) {
        fetchLockInfo();
        stop();
        eventCenter.trigger('onAnimation', {
          type:
            deviceInfo?.coverStatus === 1 ? 'closeCovering' : 'openCovering',
          value: true,
        });
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        hideLoading();
        return false;
      }
      return true;
    }, 1000);
    timer = setTimeout(() => {
      eventCenter.trigger('onOptioned', false);
      stop();
      hideLoading();
      showToast('操作失败');
    }, 10000);
    start();
  };
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
      footer={footerBtn()}
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
            editNamePopRef.current?.open();
          }}
        >
          <Text style={styles.cardLable}>设备名称</Text>
          <Text style={styles.cardValue}>{lockInfo?.lockName ?? ''}</Text>
          {params.isAdmin && (
            <IconFont name={'a-headfor-20'} color="#333" size={20} />
          )}
        </Flex>
        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>地锁SN码</Text>
          <Text style={styles.cardValue}>{lockInfo?.deviceNo ?? ''}</Text>
        </Flex>
        <Flex style={[styles.cardRows, { position: 'relative' }]}>
          <Text style={styles.cardLable}>供电模式</Text>
          <Text style={[styles.cardValue, { marginRight: 4 }]}>
            {lockInfo?.powerType === 1 ? '市电版' : '电池版'}
          </Text>
          <IconFont
            onPressIn={() => {
              setShowPowerModeTips(true);
            }}
            onPressOut={() => {
              setShowPowerModeTips(false);
            }}
            name={'a-styledescription'}
            color="#333"
            size={20}
          />
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
              <IconFont name={'a-headfor-20'} color="#333" size={20} />
            </TouchableOpacity>
            {deviceInfo?.role === 1 && (
              <TouchableOpacity
                style={[styles.qrCodeBtn, { marginLeft: 12 }]}
                onPress={() => changeQrCodePopRef.current?.open()}
              >
                <Text style={styles.qrCodeBtnText}>更换二维码</Text>
                <IconFont name={'a-headfor-20'} color="#333" size={20} />
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
          <IconFont name={'a-headfor-20'} color="#333" size={20} />
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
          <IconFont name={'a-headfor-20'} color="#333" size={20} />
        </Flex>

        {!params.isAdmin && (
          <Flex style={styles.cardRows}>
            <Text style={styles.cardLable}>管理员信息</Text>
            <TouchableOpacity
              style={styles.cardRowsTouch}
              onPress={() => adminRef?.current?.open()}
            >
              <Text style={styles.cardValue}>{'查看'}</Text>
              <IconFont name={'a-headfor-20'} color="#333" size={20} />
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
            <IconFont name={'a-headfor-20'} color="#333" size={20} />
          </Flex>
        )}

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
                <IconFont name={'a-headfor-20'} color="#333" size={20} />
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
                  <TouchableOpacity style={styles.testBtn} onPress={testBuzzer}>
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

        <Flex style={styles.cardRows}>
          <Text style={styles.cardLable}>离车升锁</Text>
          <TouchableOpacity
            style={styles.cardRowsTouch}
            onPress={() => leaveRiseLockRef.current?.open()}
          >
            <Text
              style={styles.cardValue}
            >{`车辆离开${lockInfo?.leaveUpTime}秒后升起`}</Text>
            {lockInfo?.powerType === 1 && (
              <IconFont name={'a-headfor-20'} color="#333" size={20} />
            )}
          </TouchableOpacity>
        </Flex>
      </Flex>

      {/* 编辑地锁名称弹窗 */}
      <AnimationPop ref={editNamePopRef} direction="bottom" coverSafeArea>
        <View style={[styles.editContainer, { paddingBottom: 8 }]}>
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
              <IconFont name={'redact'} color="#999" size={20} />
            </View>
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelPopBtn]}
              onPress={() => editNamePopRef.current?.close()}
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
            <TouchableOpacity onPress={() => editNamePopRef.current?.close()}>
              <IconFont name={'close'} color="#333" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </AnimationPop>

      {/* 查看二维码弹框 */}
      <PopCenter
        height={226}
        ref={qrCodePopRef}
        showHeader={false}
        showCancel={false}
        confirmText="关闭"
      >
        <View style={styles.qrCodeContainer}>
          {lockInfo?.qrCode ? (
            <Image
              source={{ uri: lockInfo.qrCode }}
              style={{ width: 160, height: 160 }}
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
        onConfirm={() => {
          changeQrCodePopRef.current?.close();
          setSafeAreaColor('light-content');
          setTimeout(() => {
            scanBindQrCameraRef.current?.open();
          }, 350);
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
        time={deviceInfo?.leaveUpTime ?? 0}
        onConfirm={async leaveUpTime => {
          return await deviceModifyLockLeaveTime(leaveUpTime);
        }}
      />

      <AnimationPop
        ref={adminRef}
        maxHeight={148}
        direction="bottom"
        maskClosable={false}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
          }}
        >
          <View style={{ width: 24, height: 24 }}></View>
          <Text style={styles.adminInfoTitle}>管理员信息</Text>
          <TouchableOpacity onPress={() => adminRef.current?.close()}>
            <IconFont name={'close'} color="#333" size={24} />
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
      </AnimationPop>

      <BluetoothStatus
        ref={bluetoothStatusUnbindRef}
        details={{
          ...lockInfo,
          pin: lockInfo?.blePin,
        }}
        type="pass"
        onSuccess={async () => {
          if (optionType === '1') {
            navigation.navigate('HandOver', {
              id: deviceInfo?.id,
              bleNo: deviceInfo?.bleNo,
            });
          } else {
            await cacheSetSync('deviceInfo', lockInfo);
            navigation.navigate('HandOver');
          }
        }}
      />
    </PageContainer>
  );
};

export default DeviceInfo;
