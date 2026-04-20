import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PageContainer from '@/components/PageContainer';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import {
  getBluetoothDeviceInfo,
  hideLoading,
  loopFunc,
  showLoading,
  showToast,
} from '@/utils';
import { COVER_STATUS, LOCK_STATUS, OPT_TYPE, OT_STATUS } from '@/constants';
import {
  getLockInfo,
  getOperateResult,
  groupSubList,
  operateLock,
  operateLockCover,
} from '@/services';
import type { ListItem } from './typing';
import Status from './status';
import { styles } from './style';
import { getBatteryStatus, getSignalStatus } from '@/utils/biz';
import { fontSize, px } from '@/utils/ui';

const PAGE_SIZE = 20;

const statusDesc: Record<number, string> = {
  [LOCK_STATUS.RISE]: '降下地锁',
  [LOCK_STATUS.FALL_SUCCESS]: '升起地锁',
  [LOCK_STATUS.OFF_LINE]: '设备离线',
  [LOCK_STATUS.FAULT]: '设备故障',
};

export default function DeviceList() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();

  const groupId = route.params?.id as number | undefined;

  const [list, setList] = useState<ListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoOpenMap, setAutoOpenMap] = useState<Record<string, boolean>>({});
  const [currentLock, setCurrentLock] = useState<ListItem | null>(null);

  const coverConfirmRef = useRef<PopConfirmRef>(null);
  const closeConfirmRef = useRef<PopConfirmRef>(null);
  const openConfirmRef = useRef<PopConfirmRef>(null);
  const shouldOpenConfirmRef = useRef(false);

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (!groupId) return;
      if (refresh) setRefreshing(true);
      else setLoadingMore(true);
      try {
        const offset = refresh ? 0 : list.length;
        const res: any = await groupSubList({
          id: groupId,
          pageSize: PAGE_SIZE,
          offset,
        });
        if (res?.code === 200 && res?.success) {
          const data = res?.data || {};
          const nextList: ListItem[] = Array.isArray(data.list)
            ? data.list
            : data?.list || [];
          setList(prev => (refresh ? nextList : [...prev, ...nextList]));
          setComplete(nextList.length < PAGE_SIZE);
        } else {
          showToast({
            title: res?.message || res?.msg || '加载设备列表失败',
            icon: 'info',
          });
        }
      } catch {
        showToast({ title: '加载设备列表失败', icon: 'info' });
      } finally {
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [groupId, list.length],
  );

  useEffect(() => {
    void loadList(true);
    const unsubscribe = navigation.addListener('focus', () => {
      void loadList(true);
    });
    return unsubscribe;
  }, [loadList, navigation]);

  useEffect(() => {
    (async () => {
      const map: Record<string, boolean> = {};
      const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) as any;
      for (const it of list || []) {
        const bleNo = String(it?.bleNo ?? '');
        const entry = saved?.[bleNo];
        map[bleNo] = !!entry?.deviceId && !!entry?.isPaired;
      }
      setAutoOpenMap(map);
    })();
  }, [list]);

  const operate = useCallback(
    async (item: ListItem) => {
      try {
        showLoading({
          title:
            item?.fallStatus === LOCK_STATUS.FALL_SUCCESS
              ? '升起中...'
              : '降下中...',
        });
        const res: any = await operateLock({
          id: item?.id,
          optType:
            item?.fallStatus === LOCK_STATUS.FALL_SUCCESS
              ? OPT_TYPE.RISE
              : OPT_TYPE.FALL,
        });

        if (!(res?.code === 200 && res?.success)) {
          hideLoading();
          showToast({
            title: res?.message || res?.msg || '操作失败',
            icon: 'info',
          });
          return;
        }

        const ot =
          item?.fallStatus === LOCK_STATUS.FALL_SUCCESS
            ? (OT_STATUS as any).RISE
            : (OT_STATUS as any).DOWN;

        const poller = loopFunc(
          async () => {
            const result: any = await getOperateResult({
              deviceNo: item?.deviceNo,
              ot,
            });
            if (!(result?.code === 200 && result?.success)) {
              hideLoading();
              showToast({
                title: result?.message || result?.msg || '操作失败',
                icon: 'info',
              });
              poller.stop();
              return false;
            }

            if (result?.data) {
              hideLoading();
              const nextInfo: any = await getLockInfo({ id: item?.id });
              if (nextInfo?.code === 200 && nextInfo?.success) {
                setList(prev =>
                  prev.map(it => (it.id === item.id ? nextInfo.data : it)),
                );
              } else {
                void loadList(true);
              }
              poller.stop();
              return false;
            }
            return true;
          },
          1000,
          12,
        );
        poller.start();
      } catch {
        hideLoading();
        showToast({ title: '操作失败', icon: 'info' });
      }
    },
    [loadList],
  );

  const confirmOperateCover = useCallback((item: ListItem) => {
    setCurrentLock(item);
    coverConfirmRef.current?.open();
  }, []);

  const operateCover = useCallback(
    async (val?: boolean) => {
      if (!currentLock) return;
      shouldOpenConfirmRef.current = !!val;
      try {
        showLoading({
          title: `${
            currentLock.coverStatus === COVER_STATUS.OPEN ? '关闭' : '打开'
          }锁盖中...`,
        });
        const res: any = await operateLockCover({ id: currentLock.id });
        if (!(res?.code === 200 && res?.success)) {
          hideLoading();
          showToast({
            title: res?.message || res?.msg || '操作失败',
            icon: 'info',
          });
          return;
        }

        const poller = loopFunc(
          async () => {
            const result: any = await getOperateResult({
              deviceNo: currentLock.deviceNo,
              ot: 13,
            });
            if (!(result?.code === 200 && result?.success)) {
              hideLoading();
              showToast({
                title: result?.message || result?.msg || '操作失败',
                icon: 'info',
              });
              poller.stop();
              return false;
            }

            if (result?.data) {
              hideLoading();
              if (shouldOpenConfirmRef.current) {
                coverConfirmRef.current?.close();
                openConfirmRef.current?.open();
                shouldOpenConfirmRef.current = false;
              }
              void loadList(true);
              poller.stop();
              return false;
            }
            return true;
          },
          1000,
          12,
        );
        poller.start();
      } catch {
        hideLoading();
        showToast({ title: '操作失败', icon: 'info' });
      }
    },
    [currentLock, loadList],
  );

  const footer = (
    <View style={styles.bottomBtnContent}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.bottomBtn}
        onPress={() => {
          if (!groupId) return;
          navigation.navigate('DeviceLog', { lockId: groupId });
        }}
      >
        <Flex align="center">
          <Text style={styles.bottomBtnText}>设备日志</Text>
          <AppIcon name="a-headfor-20" size={px(18)} color="#333333" />
        </Flex>
      </TouchableOpacity>
    </View>
  );

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      const isNormal =
        item.deviceStatus === LOCK_STATUS.RISE ||
        item.deviceStatus === LOCK_STATUS.FALL_SUCCESS;
      const statusName = isNormal
        ? statusDesc[item.deviceStatus]
        : [0, 2].includes(item.fallStatus)
        ? statusDesc[item.fallStatus]
        : '降下地锁';

      const bleNo = String(item.bleNo ?? '');
      const hasAutoOpen = autoOpenMap[bleNo];

      return (
        <View style={styles.card}>
          <Flex direction="column">
            <View style={styles.optContent}>
              <Text style={styles.name}>{item.lockName}</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!isNormal}
                style={[styles.btn, !isNormal ? styles.btnDisabled : null]}
                onPress={() => void operate(item)}
              >
                <Text style={styles.btnText}>{statusName}</Text>
              </TouchableOpacity>
            </View>
            <Flex style={styles.metaRow} align="center">
              {item.showBattery ? (
                <>
                  <Image
                    source={{
                      uri:
                        item?.powerType !== 1
                          ? getBatteryStatus(item.battery, 'light')
                          : 'https://g.18qjz.cn/img/boklock/batteryIcon/deep_charging.png',
                    }}
                    style={{ width: px(20), height: px(20) }}
                  />
                  <Text style={styles.metaText}>{item.battery}%</Text>
                </>
              ) : null}

              <Image
                style={{ width: px(20), height: px(20) }}
                source={{
                  uri: getSignalStatus(item.atCsq, item.deviceStatus, 'light'),
                }}
              />

              <View style={styles.verticalLine}></View>

              <Status deviceStatus={item.deviceStatus} overlay={item.overlay} />
            </Flex>
          </Flex>

          <Flex align="center" justify="between" style={styles.actionsRow}>
            {item.canOpenCover ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.operationWrap}
                onPress={() => confirmOperateCover(item)}
              >
                <View style={[styles.iconBox]}>
                  <AppIcon
                    name={
                      item.coverStatus === COVER_STATUS.OPEN ? 'unlock' : 'lock'
                    }
                    size={px(28)}
                    color="#333333"
                  />
                </View>
                <Text style={styles.operationText}>
                  {item.coverStatus === COVER_STATUS.OPEN ? '关闭' : '打开'}锁盖
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.operationWrap}
              onPress={() => {
                if (item.role === 2 && !item.bluetoothStatus) {
                  showToast({
                    title: '管理员已关闭此功能，请联系管理员打开',
                    icon: 'info',
                  });
                  return;
                }
                navigation.navigate('BluetoothControl', {
                  lockId: item?.id,
                  bluetoothStatus: !!item?.bluetoothStatus,
                  lockName: item?.lockName,
                  bleNo: item?.bleNo,
                  imageMap: item?.imageMap,
                  bluetoothHasOpen: item?.bluetoothStatus,
                  deviceNo: item?.deviceNo,
                  mode: item?.mode,
                  role: item?.role,
                  blePin: item?.blePin,
                  bleName: item?.bleName,
                  needPin: item?.needPin,
                  version: item?.compVer,
                  isFromGroup: true,
                } as any);
              }}
            >
              <View style={styles.iconBox}>
                <AppIcon name="bluetooth-1" size={px(28)} color="#333333" />
                {!hasAutoOpen ? (
                  <Image
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/icon/bluetooth_close.png',
                    }}
                    style={styles.warningIcon}
                  ></Image>
                ) : // <View style={styles.warningDot} />
                null}
              </View>
              <Text style={styles.operationText}>自动升降</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.operationWrap}
              onPress={() => {
                navigation.navigate('DeviceInfo', {
                  lockId: item.id,
                  isAdmin: item.role === 1,
                });
              }}
            >
              <View style={styles.iconBox}>
                <AppIcon
                  name="a-equipmentinformation"
                  size={px(28)}
                  color="#333333"
                />
              </View>
              <Text style={styles.operationText}>设备信息</Text>
            </TouchableOpacity>
          </Flex>
        </View>
      );
    },
    [autoOpenMap, confirmOperateCover, navigation, operate],
  );

  const empty = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>暂无设备</Text>
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#f6f7fa"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '设备列表',
        showBack: true,
        background: '#ffffff',
      }}
      scrollable={false}
      padding={0}
      footer={footer}
    >
      <View style={styles.container}>
        {list.length === 0 && !refreshing ? (
          empty
        ) : (
          <FlatList
            data={list}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            onRefresh={() => void loadList(true)}
            refreshing={refreshing}
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (!complete && !loadingMore && !refreshing) {
                void loadList(false);
              }
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <PopConfirm
        ref={coverConfirmRef}
        title={`确定要${
          currentLock?.coverStatus === COVER_STATUS.OPEN ? '关闭' : '打开'
        }锁盖吗？`}
        onConfirm={async () => {
          if (currentLock?.coverStatus === COVER_STATUS.OPEN) {
            closeConfirmRef.current?.open();
          } else {
            return await operateCover(true);
          }
          // coverConfirmRef.current?.close();
          // await operateCover();
        }}
      />

      <PopConfirm
        title={
          <Flex
            align="center"
            justify="center"
            direction="column"
            style={{ width: '100%' }}
          >
            <Text
              style={{
                fontSize: fontSize(16),
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              温馨提示
            </Text>
            <View
              style={{
                marginVertical: px(8),
              }}
            >
              <Text
                style={{
                  fontSize: fontSize(14),
                  color: '#333',
                  fontWeight: 'normal',
                }}
              >
                请先合上锁盖,再关闭锁盖
              </Text>
            </View>
            <Image
              source={{ uri: currentLock?.imageMap?.closeCoverGif || '' }}
              style={{
                width: '100%',
                height: px(210),
              }}
            />
          </Flex>
        }
        ref={closeConfirmRef}
        cancelText="取消"
        confirmText="关闭锁盖"
        onConfirm={async () => {
          return await operateCover();
        }}
      />

      <PopConfirm
        title={
          <Flex
            align="center"
            justify="center"
            direction="column"
            style={{ width: '100%' }}
          >
            <Text
              style={{
                fontSize: fontSize(16),
                fontWeight: 'bold',
                color: '#000',
              }}
            >
              温馨提示
            </Text>
            <View
              style={{
                marginVertical: px(8),
              }}
            >
              <Text
                style={{
                  fontSize: fontSize(14),
                  color: '#333',
                  fontWeight: 'normal',
                }}
              >
                锁盖已打开,请手动搬起锁盖
              </Text>
            </View>
            <Image
              source={{ uri: currentLock?.imageMap?.openCoverGif || '' }}
              style={{
                width: '100%',
                height: px(210),
              }}
            />
          </Flex>
        }
        ref={openConfirmRef}
        confirmText="确定"
        showClose={false}
        onConfirm={async () => {
          openConfirmRef.current?.close();
        }}
      />
    </PageContainer>
  );
}
