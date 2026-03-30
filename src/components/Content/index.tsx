import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ImageStyle,
} from 'react-native';
import AppIcon from '@/components/AppIcon';
import {
  getGroupOperateResult,
  getOperateResult,
  operateLock,
  operateLockCover,
} from '@/services/device';
import { OPT_TYPE, OT_STATUS } from '@/constants';
import { DeviceSwitch } from '../Device/switch';
import type { LockInfoDTO } from '@/pages/index/typing';
import { styles } from './style';
import { groupSubList } from '@/services';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { COVER_STATUS, TEST_OT_STATUS } from '@/constants';
import { Flex, PopConfirm } from '@/components';
import {
  showToast,
  makePhoneCall,
  showLoading,
  hideLoading,
  setStorage,
  getLocation,
  eventCenter,
  loopFunc,
  getBluetoothDeviceInfo,
} from '@/utils';
import { deviceDelete } from '@/services/combine';
import MapComponent from '../Map';
import AutoOperatePop, { AutoOperatePopRef } from '../autoOperatePop';
import AnimationPop, { AnimationPopRef } from '../AnimationPop';
import { LockVisualStatus } from '../LockVisual';
import BluetoothStatus, { BluetoothStatusRef } from '../bluetoothStatus';
import { OperationCommandByBluetooth } from '@/utils/api';
import { useAtom, useSetAtom } from 'jotai';
import { bluetoothOperationLockFallStatusStore } from '@/store/store';
import { PopConfirmRef } from '../popConfirm';
import PopCenter from '../PopCenter';

interface ContentProps {
  detail?: LockInfoDTO;
  reload?: (id?: number) => Promise<any> | void;
  optioning?: boolean;
  onFresh?: (id?: number) => Promise<any> | void;
  children?: React.ReactNode;
  isMultiple?: boolean;
  isAutoOpenBluetooth?: boolean;
  currentDeviceStatus: LockVisualStatus;
}

const Content: React.FC<ContentProps> = ({
  detail,
  reload,
  optioning,
  onFresh,
  isMultiple = false,
  children,
  isAutoOpenBluetooth,
  currentDeviceStatus,
}) => {
  const navigation = useAppNavigation();

  const [groupList, setGroupList] = useState<any[]>([]);
  const [deleteMultipleRef, setDeleteMultipleRef] = useState(false);
  const [eleInstallRef, setEleInstallRef] = useState(false);
  const [lockFallStatus, setLockStatus] = useAtom(
    bluetoothOperationLockFallStatusStore,
  );

  const popRef = useRef<AutoOperatePopRef>(null);
  const coverOpenRef = useRef<PopConfirmRef>(null);
  const manageMultipleRef = useRef<AnimationPopRef>(null);
  const bluetoothConnectStatusRef = useRef<BluetoothStatusRef>(null);
  const bluetoothControlRef = useRef<'RISE' | 'DOWN'>('RISE');
  const groupToastPop = useRef<AutoOperatePopRef>(null);
  const deviceNum = useRef<number>(0);
  const optionRef = useRef<string>('');

  useEffect(() => {
    if (detail?.isGroup) {
      const funs = async function getGroupSubList() {
        const res = await groupSubList({
          id: detail?.id,
          pageSize: 30,
          offset: 0,
        });
        setGroupList(res.data?.list || []);
      };
      funs();
    }
  }, [detail]);

  const sleep = (time: number) =>
    new Promise(resolve => setTimeout(resolve, time));

  const getBluetoothAnimationType = (
    direction: 'RISE' | 'DOWN',
    currentStatus: LockVisualStatus,
  ) => {
    if (direction === 'DOWN') {
      return currentStatus === 'rise30'
        ? 'falling30'
        : currentStatus === 'rise120'
        ? 'falling120'
        : 'falling';
    }
    return currentStatus === 'rise30'
      ? 'rising30'
      : currentStatus === 'rise120'
      ? 'rising120'
      : 'rising';
  };

  // 地锁操作
  const handleOperate = useCallback(
    async (direction: 'RISE' | 'DOWN') => {
      if (!detail?.id || optioning) return;

      eventCenter.trigger('onOptioned', true);
      showLoading({ title: direction === 'DOWN' ? '降下中...' : '升起中...' });

      type SimpleLocation = { longitude: number; latitude: number };
      let location: SimpleLocation | undefined;
      try {
        location = await Promise.race<SimpleLocation | undefined>([
          getLocation({ type: 'gcj02', highAccuracyExpireTime: 1000 }).then(
            res => ({
              longitude: res.longitude,
              latitude: res.latitude,
            }),
          ),
          new Promise<undefined>(resolve =>
            setTimeout(() => resolve(undefined), 1200),
          ),
        ]);
      } catch (error) {
        console.error('获取定位失败，请稍后再试', error);
      }

      try {
        const res = await operateLock({
          id: detail.id,
          optType: direction === 'DOWN' ? OPT_TYPE.FALL : OPT_TYPE.RISE,
          longitude: location?.longitude,
          latitude: location?.latitude,
        } as any);

        if (res?.code !== 200) {
          hideLoading();
          eventCenter.trigger('onOptioned', false);
          setTimeout(() => {
            showToast({ title: res?.msg || res.message, icon: 'error' });
          }, 600);

          if (onFresh) {
            await onFresh(detail.id);
          } else if (reload) {
            await reload(detail.id);
          }
          return;
        }

        deviceNum.current = res.data;
        optionRef.current = direction;

        loopLockStatus(
          currentDeviceStatus,
          OT_STATUS[direction],
          isMultiple ? 'group' : 'single',
        );
      } catch (e) {
        showToast('操作失败，请稍后重试');
        eventCenter.trigger('onOptioned', false);
        hideLoading();
      }
    },
    [detail, onFresh, reload],
  );

  // 地锁操作结果轮询
  const loopLockStatus = async (
    currentStatus: LockVisualStatus,
    ot: (typeof OT_STATUS)[keyof typeof OT_STATUS],
    deviceType: 'single' | 'group',
    count = 10,
  ) => {
    let flag = 0;
    const { start, stop } = loopFunc(
      async () => {
        try {
          flag++;
          const result = detail?.isGroup
            ? await getGroupOperateResult({ id: detail?.id, ot })
            : await getOperateResult({ deviceNo: detail?.deviceNo, ot });
          // console.log(result, 'result地锁开关轮询')
          if (result.code !== 200) {
            showToast({ title: result.message, icon: 'none' });
            eventCenter.trigger('onOptioned', false);
            hideLoading();
            eventCenter.trigger('onOptioned', false);
            stop();
            return false;
          }

          if (result.data && result.code === 200) {
            hideLoading();
            stop();

            // 手动重置
            if (ot === OT_STATUS.DOWN) {
              eventCenter.trigger('onAnimation', {
                type:
                  currentStatus === 'rise30'
                    ? 'falling30'
                    : currentStatus === 'rise120'
                    ? 'falling120'
                    : 'falling',
                value: true,
              });
            }
            if (ot === OT_STATUS.RISE) {
              eventCenter.trigger('onAnimation', {
                type:
                  currentStatus === 'rise30'
                    ? 'rising30'
                    : currentStatus === 'rise120'
                    ? 'rising120'
                    : 'rising',
                value: true,
              });
            }

            if (
              deviceType === 'group' &&
              deviceNum.current !== detail?.groupCount
            ) {
              setTimeout(() => {
                groupToastPop.current?.open();
              }, 600);
            }
            return false;
          }

          if (flag >= count) {
            showToast({ title: '轮询超时' });
            hideLoading();
            eventCenter.trigger('onOptioned', false);
            stop();
            return false;
          }
          return true;
        } catch (error) {
          showToast({ title: '操作失败' });
          hideLoading();
          eventCenter.trigger('onOptioned', false);
          stop();
          return false;
        }
      },
      1000,
      count,
    );
    start();
  };

  // 锁盖轮询
  const loopOperateStatus = async (ot: EumOt[keyof EumOt]) => {
    let timer: any = null;
    const { start, stop } = loopFunc(async () => {
      const res = await getOperateResult({
        deviceNo: detail?.deviceNo,
        ot,
      });
      if (res.data) {
        if (onFresh) {
          await onFresh(detail?.id);
        } else if (reload) {
          await reload(detail?.id);
        }
        stop();
        eventCenter.trigger('onAnimation', {
          type: detail?.coverStatus === 1 ? 'closeCovering' : 'openCovering',
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
      showToast({
        title: '操作失败',
        icon: 'none',
      });
    }, 10000);
    start();
  };

  // 蓝牙操作地锁
  const handleOperateByBluetooth = async (direction: 'RISE' | 'DOWN') => {
    try {
      eventCenter.trigger('onOptioned', true);
      const bleNo = detail?.bleNo;
      const deviceMap =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      const deviceId = bleNo
        ? deviceMap?.[bleNo as string]?.deviceId
        : undefined;

      if (!deviceId || !bluetoothControlRef.current) {
        bluetoothConnectStatusRef.current?.open();
        return;
      }

      // 前端不再拦截蓝牙发送，允许同一状态重复发送以处理被卡住或状态不同步的情况
      // if (lockFallStatus === direction) {
      //   showToast({
      //     title: `地锁已经处于${direction === 'RISE' ? '升起' : '降下'}状态`,
      //   });
      //   return;
      // }

      showLoading({
        title: `${direction === 'RISE' ? '升起中...' : '降下中...'}`,
      });

      const operation = direction === 'RISE' ? 1 : 2;
      const r = await OperationCommandByBluetooth({
        deviceId: deviceId as string,
        operation,
        deviceNo: detail?.deviceNo,
      });

      console.log(r, '===r');
      if (r.success) {
        eventCenter.trigger('onAnimation', {
          type: getBluetoothAnimationType(direction, currentDeviceStatus),
          value: true,
        });
        await sleep(1200);
        hideLoading();
        setLockStatus(preV => direction);
      } else {
        await sleep(4000);
        eventCenter.trigger('onOptioned', false);
        showToast({ title: r.msg || '操作失败', icon: 'none' });
      }
    } catch (error) {
      await sleep(4000);
      hideLoading();
      eventCenter.trigger('onOptioned', false);
      bluetoothConnectStatusRef.current?.open();
    }
  };

  const handleDeviceInfo = () => {
    if (!detail?.id) return;
    if (detail?.isGroup) {
      navigation.navigate('DeviceList', {
        id: detail.id,
        role: detail?.role,
      });
    } else {
      navigation.navigate('DeviceInfo', {
        lockId: detail.id,
        isAdmin: detail?.role === 1,
      });
    }
  };

  const operateCover = async () => {
    eventCenter.trigger('onOptioned', true);
    showLoading({
      title: `${
        detail?.coverStatus === COVER_STATUS.OPEN ? '上锁' : '解锁'
      }中...`,
    });

    const res = await operateLockCover({
      id: detail?.id,
    });

    if (res.success) {
      await loopOperateStatus(13);
    } else {
      eventCenter.trigger('onOptioned', false);
      hideLoading();
      showToast({
        title: res.message,
        icon: 'none',
      });
    }
    return res.data;
  };

  const address = detail?.locationList?.[0]?.address || detail?.address || '';
  const markers = useMemo(() => {
    return detail?.locationList?.map(item => {
      return {
        iconPath: 'https://g.18qjz.cn/img/boklock/device_icon.png',
        id: item.lockId,
        latitude: item.latitude,
        longitude: item.longitude,
        width: 36,
        height: 36,
      };
    });
  }, [detail?.locationList]);

  const onDelete = async () => {
    showLoading({ title: '删除中...' });
    await setStorage({ key: 'pageType', data: 'reload' });
    setDeleteMultipleRef(false);
    manageMultipleRef.current?.close();
    await deviceDelete({ id: detail?.id });
    hideLoading();
    showToast({ title: '删除成功' });
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Index' } }],
    });
  };

  const handleSetAutoOperate = (detail: any) => {
    if (detail?.role === 2 && !detail?.bluetoothStatus) {
      showToast({
        title: '管理员已关闭此功能，请联系管理员打开',
        icon: 'none',
      });
      return;
    }
    navigation.navigate('BluetoothControl', {
      lockId: detail.id,
      bluetoothStatus: detail?.bluetoothStatus,
      lockName: detail.lockName,
      bleNo: detail?.bleNo,
      imageMap: detail?.imageMap,
      buletoothHasOpen: !!detail?.bluetoothStatus,
      deviceNo: detail?.deviceNo,
      role: detail?.role,
      mode: detail?.mode,
      fromHomePage: true,
      bleName: detail?.bleName,
      needPin: detail?.needPin,
      version: detail?.compVer,
    });
  };

  return (
    <View style={styles.contentBox}>
      {/* 上方设备模型/状态图 */}
      <Flex direction="column" align="center">
        {children}
        <DeviceSwitch
          lockInfo={detail}
          reload={reload}
          type={detail?.isGroup ? 2 : 1}
        />
      </Flex>

      <Flex justify="between" style={styles.manualRow}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.manualBtn}
          disabled={optioning}
          onPress={() => {
            if (detail?.isGroup) {
              popRef.current?.open();
            } else {
              handleSetAutoOperate(detail);
            }
          }}
        >
          {!isAutoOpenBluetooth && (
            <View style={styles.warningIcon}>
              <Image
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/icon/bluetooth_close.png',
                }}
                style={{ width: 20, height: 20 }}
              ></Image>
            </View>
          )}
          <View style={styles.manualIconCircle}>
            <AppIcon name="bluetooth-1" size={24} color="#333333" />
          </View>
          <Text style={styles.manualText}>自动升降</Text>
        </TouchableOpacity>
        {detail?.noBleOpt == true ? null : (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.manualBtn}
            disabled={optioning}
            onPress={() => {
              if (detail?.powerType === 1 || detail?.isGroup) {
                handleOperate('RISE');
              } else {
                bluetoothControlRef.current = 'RISE';
                setTimeout(
                  () => bluetoothConnectStatusRef.current?.open?.(),
                  600,
                );
              }
            }}
          >
            <View style={styles.manualIconCircle}>
              <AppIcon name="rise" size={24} color="#333333" />
            </View>
            <Text style={styles.manualText}>手动升锁</Text>
          </TouchableOpacity>
        )}
        {detail?.noBleOpt == true ? null : (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.manualBtn}
            disabled={optioning}
            onPress={() => {
              if (detail?.powerType === 1 || detail?.isGroup) {
                handleOperate('DOWN');
              } else {
                bluetoothControlRef.current = 'DOWN';
                setTimeout(
                  () => bluetoothConnectStatusRef.current?.open?.(),
                  600,
                );
              }
            }}
          >
            <View style={styles.manualIconCircle}>
              <AppIcon name="down" size={24} color="#333333" />
            </View>
            <Text style={styles.manualText}>手动降锁</Text>
          </TouchableOpacity>
        )}
        {isMultiple ? (
          detail?.role === 1 && (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.manualBtn}
              disabled={optioning}
              onPress={() => manageMultipleRef.current?.open()}
            >
              <View style={styles.manualIconCircle}>
                <AppIcon
                  name="a-combinationmanagement"
                  size={24}
                  color="#333333"
                />
              </View>
              <Text style={styles.manualText}>组合管理</Text>
            </TouchableOpacity>
          )
        ) : detail?.powerType === 1 && detail.canOpenCover ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.manualBtn}
            disabled={optioning}
            onPress={() => coverOpenRef.current?.open()}
          >
            <View style={styles.manualIconCircle}>
              <AppIcon
                name={
                  detail?.coverStatus === COVER_STATUS.OPEN ? 'unlock' : 'lock'
                }
                size={24}
                color="#333333"
              />
            </View>
            <Text style={styles.manualText}>
              {detail?.coverStatus === COVER_STATUS.OPEN
                ? '关闭锁盖'
                : '打开锁盖'}
            </Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </Flex>

      {/* 地图 + 设备信息卡片 */}
      <Flex justify="between" style={styles.cardsRow}>
        <Flex
          direction="column"
          justify="between"
          align="center"
          style={[
            styles.contentLeftBox,
            // detail?.isGroup ? styles.multipleHeight : styles.singleHeight,
          ]}
        >
          <MapComponent
            style={{ flex: 1 }}
            key={detail?.locationList?.[0]?.lockId}
            address={detail?.locationList?.[0]?.formattedAddress}
            longitude={detail?.locationList?.[0]?.longitude as number}
            latitude={detail?.locationList?.[0]?.latitude as number}
            markers={markers}
            onClick={() => {
              (navigation as any).navigate('DeviceAddress', {
                addressInfo: detail?.locationList,
              });
            }}
          />
        </Flex>

        <Pressable style={[styles.card]} onPress={handleDeviceInfo}>
          <Flex justify="between" align="center" style={styles.cardHeader}>
            <AppIcon
              name={
                detail?.isGroup ? 'a-Equipmentlist' : 'a-equipmentinformation'
              }
              size={20}
              color={'#333'}
            />
            <Text style={styles.cardTitle}>
              {detail?.isGroup ? '设备列表' : '设备信息'}
            </Text>
            <AppIcon name="a-headfor-20" size={20} color="#333333" />
          </Flex>
          {detail?.isGroup ? (
            <Flex
              style={styles.groupListBox}
              direction="column"
              justify="center"
              align="center"
            >
              {(groupList || [])?.slice(0, 2)?.map(item => (
                <Flex
                  key={item?.id}
                  style={styles.groupItem}
                  direction="row"
                  align={'center'}
                >
                  {item?.imageUrl && (
                    <Image
                      source={{ uri: String(item.imageUrl) }}
                      style={styles.groupItemImage as ImageStyle}
                    />
                  )}
                  <Text numberOfLines={1} style={styles.groupItemLockName}>
                    {item?.lockName || ''}
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <AppIcon name={'a-Upgradelock'} size={16} color="#ccc" />
                <Text style={styles.infoLabel}>离车升锁</Text>
                <Text style={styles.infoValue}>
                  {detail?.leaveUpTime ? `${detail?.leaveUpTime}s` : '20s'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <AppIcon name={'bell'} size={16} color="#ccc" />
                <Text style={styles.infoLabel}>蜂鸣碰撞</Text>
                <Image
                  style={{ width: 16, height: 16 }}
                  source={{
                    uri: `https://g.18qjz.cn/img/boklock/icon/${
                      detail?.buzzerStatus === 1
                        ? 'buzzing_icon'
                        : 'buzzing_icon_close'
                    }.png`,
                  }}
                />
              </View>
            </View>
          )}
        </Pressable>
      </Flex>

      <View style={styles.entryList}>
        {detail?.role === 1 && (
          <TouchableOpacity
            style={styles.entryItem}
            onPress={() => {
              if (!detail?.id) return;
              navigation.navigate('DevicesMember', {
                lockId: detail.id,
                type: detail?.isGroup ? 'group' : 'single',
              });
            }}
          >
            <Flex justify="between" align="center">
              <AppIcon name="member" size={16} color="#333333" />
              <Text style={styles.entryText}>成员共享</Text>
              <AppIcon name="a-headfor-20" size={20} color="#333333" />
            </Flex>
          </TouchableOpacity>
        )}
        {detail?.mode === 1 && (
          <TouchableOpacity
            style={styles.entryItem}
            onPress={() => {
              if (!detail?.id) return;
              navigation.navigate('Vip', {
                id: detail?.id,
                role: detail?.role,
                detail: detail,
              });
            }}
          >
            <Flex justify="between" align="center">
              <AppIcon name="a-VIPInvitation" size={16} color="#333333" />
              <Text style={styles.entryText}>贵宾邀请</Text>
              <AppIcon name="a-headfor-20" size={20} color="#333333" />
            </Flex>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => {
            if (detail?.customerServicePhone) setEleInstallRef(true);
            else showToast({ title: '敬请期待', icon: 'none' });
          }}
        >
          <Flex justify="between" align="center">
            <AppIcon name="a-powersupply" size={16} color="#333333" />
            <Text style={styles.entryText}>市电安装</Text>
            <AppIcon name="a-headfor-20" size={20} color="#333333" />
          </Flex>
        </TouchableOpacity>
      </View>

      {/* 组合管理弹窗 */}
      <AnimationPop
        ref={manageMultipleRef}
        direction="bottom"
        title={'管理组合设备'}
      >
        <Flex
          style={{ marginTop: 24, marginBottom: 36 }}
          direction="column"
          justify="center"
          align="center"
        >
          <Flex
            isTouchView
            justify="center"
            align="center"
            style={{
              backgroundColor: '#333333',
              ...styles.manageBtn,
            }}
            onPress={() => {
              if (!detail?.id) return;
              manageMultipleRef.current?.close();
              navigation.navigate('CompositeManage', {
                lockId: detail.id,
              });
            }}
          >
            <Text style={styles.manageBtnText}>编辑</Text>
          </Flex>
          {/* iOS：先关闭组合管理弹窗，再延迟打开确认框，避免 Modal 层级未完成导致 PopConfirm 不显示 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              manageMultipleRef.current?.close();
              setTimeout(() => setDeleteMultipleRef(true), 600);
            }}
            style={{ ...styles.manageBtn, ...styles.manageDeteleBtn }}
          >
            <Text style={styles.manageDeteleBtnText}>删除</Text>
          </TouchableOpacity>
        </Flex>
      </AnimationPop>

      <PopConfirm
        visible={deleteMultipleRef}
        title={`确定要删除此组合设备吗？`}
        onConfirm={onDelete}
        onCancel={() => setDeleteMultipleRef(false)}
      />

      <PopConfirm
        visible={eleInstallRef}
        title={`市电联系${detail?.customerServicePhone}进行安装`}
        confirmText="前往拨打"
        cancelText="取消"
        onCancel={() => setEleInstallRef(false)}
        onConfirm={async () => {
          setEleInstallRef(false);
          await makePhoneCall({
            phoneNumber: detail?.customerServicePhone || '',
          });
        }}
      />

      <AutoOperatePop
        ref={popRef}
        lockList={groupList}
        onChoose={handleSetAutoOperate}
      />

      <BluetoothStatus
        ref={bluetoothConnectStatusRef}
        type="pass"
        details={detail}
        onSuccess={() => {
          if (detail?.bluetoothStatus !== 0) {
            setLockStatus('DOWN');
          }
          handleOperateByBluetooth(bluetoothControlRef.current);
        }}
      />
      <PopConfirm
        ref={coverOpenRef}
        title={`确定要${
          detail?.coverStatus === COVER_STATUS.OPEN ? '关闭' : '打开'
        }锁盖吗？`}
        onConfirm={async () => {
          coverOpenRef.current?.close();
          if (detail?.powerType === 1) {
            await operateCover();
          } else {
            setTimeout(() => bluetoothConnectStatusRef.current?.open?.(), 600);
          }
        }}
      />

      <PopCenter height={240} ref={groupToastPop}>
        <Flex
          style={{
            width: '100%',
            height: '100%',
          }}
          direction="column"
          justify={'between'}
          align="center"
        >
          <Text style={styles.toastTitle}>温馨提示</Text>
          <Flex style={{ width: '100%' }} direction="column" align="center">
            <Text style={styles.toastContentText}>
              {deviceNum.current}台地锁
              {optionRef.current === 'RISE' ? '升起' : '降下'}
              成功
            </Text>
            <Text style={styles.toastContentText}>
              （其他地锁可能存在上方有车、锁盖解锁、设备离线的情况）
            </Text>
          </Flex>
          <Text
            style={styles.dumpText}
            onPress={() => {
              groupToastPop.current?.close();
              navigation.navigate('DeviceList', {
                id: detail?.id,
                role: detail?.role,
              });
            }}
          >
            前往设备列表查看
          </Text>
        </Flex>
      </PopCenter>
    </View>
  );
};

export default Content;
