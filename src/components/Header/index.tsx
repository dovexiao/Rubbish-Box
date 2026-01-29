import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import Flex from '../Flex';
import IconFont from '@/iconfont';
import {
  BATTERY_STATUS,
  BATTERY_STATUS_DEEP,
  SIGNAL_STATUS,
  SIGNAL_STATUS_DEEP,
  LOCK_STATUS,
} from '@/constants';
import Popup from '@/components/Popup';
import PopConfirm from '@/components/popConfirm';
import { getLockDeviceList } from '@/services/device';
import { updateName } from '@/services/deviceInfo';
import { cacheGetSync } from '@/utils/cache';
import { Toast } from '@ant-design/react-native';

interface HeaderProps {
  /** 未读消息数 */
  unreadCount?: number;
  /** 背景类型：深色 / 浅色 */
  backgroundType?: 'deep' | 'normal' | 'shallow';
  /** 当前锁信息 */
  lockInfo?: any;
  /** 刷新当前设备详情；切换设备或改名成功后调用 */
  reload?: (id?: number) => Promise<any> | void;
  /** 设备类型：单个/组合等，默认为 1，与原项目对齐占位 */
  type?: number;
  /** 标题（占位，保持与调用方兼容） */
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  unreadCount = 0,
  backgroundType,
  lockInfo,
  reload,
  type = 1,
}) => {
  const [deviceListVisible, setDeviceListVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [lockNameEditing, setLockNameEditing] = useState('');

  const isDeep = backgroundType === 'deep';

  const textColor = isDeep ? '#FFFFFF' : '#333333';

  const batteryIcon = useMemo(() => {
    if (!lockInfo?.showBattery) return undefined;

    // 市电充电中
    if (lockInfo?.powerType === 1) {
      return 'https://g.18qjz.cn/img/boklock/charging.png';
    }

    // 离线或故障使用无信号图标
    if ([6, 7].includes(lockInfo?.deviceStatus)) {
      return isDeep
        ? 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_no_signal_deep.png'
        : 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_no_signal.png';
    }

    const percent = Number(lockInfo?.battery ?? 0);
    const level =
      percent >= 75 ? 100 : percent >= 50 ? 75 : percent >= 25 ? 50 : 25;
    const map = isDeep ? BATTERY_STATUS_DEEP : BATTERY_STATUS;
    return (map as any)[level];
  }, [isDeep, lockInfo]);

  const signalIcon = useMemo(() => {
    // 离线单独处理
    if (lockInfo?.deviceStatus === 6) {
      return isDeep
        ? 'https://g.18qjz.cn/img/boklock/signalIcon/signal_no_signal_deep.png'
        : 'https://g.18qjz.cn/img/boklock/signalIcon/signal_no_signal.png';
    }

    const csq = Number(lockInfo?.atCsq ?? 0);
    let level: 1 | 2 | 3 | 4 | 5 = 1;
    if (csq >= 20) level = 5;
    else if (csq >= 16) level = 4;
    else if (csq >= 12) level = 3;
    else if (csq >= 8) level = 2;
    const map = isDeep ? SIGNAL_STATUS_DEEP : SIGNAL_STATUS;
    return (map as any)[level];
  }, [isDeep, lockInfo]);

  const renderMessage = () => (
    <View style={styles.messageWrapper}>
      <IconFont name="message" size={24} color={textColor} />
      {unreadCount > 0 && (
        <View
          style={[
            styles.messageBadge,
            unreadCount > 99 ? styles.messageBadgeLarge : null,
          ]}
        >
          <Text style={styles.messageBadgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </View>
  );

  const isGroupOrNonMains = lockInfo?.isGroup || lockInfo?.powerType !== 1;

  const loadDeviceList = useCallback(
    async (reloadList: boolean) => {
      if (!lockInfo?.id) return;
      const offset = reloadList ? 0 : deviceList.length;
      const res = await getLockDeviceList({
        offset,
        pageSize: 999,
        id: lockInfo.id,
        type,
      } as any);

      if (!res?.success) {
        Toast.fail(res?.message || '获取设备列表失败');
        return;
      }

      const list = (res.data as any)?.list || [];
      setDeviceList(reloadList ? list : [...deviceList, ...list]);
    },
    [deviceList, lockInfo?.id, type],
  );

  useEffect(() => {
    if (lockInfo?.id) {
      loadDeviceList(true).catch(() => {
        // ignore
      });
    }
  }, [lockInfo?.id, loadDeviceList]);

  const openDeviceList = useCallback(() => {
    if (!lockInfo?.id) return;
    setDeviceListVisible(true);
    if (!deviceList.length) {
      loadDeviceList(true).catch(() => {
        // ignore
      });
    }
  }, [deviceList.length, loadDeviceList, lockInfo?.id]);

  const handleSelectDevice = useCallback(
    async (item: any) => {
      setDeviceListVisible(false);
      if (!reload || !lockInfo?.id) return;

      const loadingToast = Toast.loading('切换设备中...', 0);
      try {
        const result = await getLockDeviceList({
          id: lockInfo.id,
          type,
          offset: 0,
          pageSize: 999,
        } as any);

        if (!result?.success) {
          Toast.remove(loadingToast);
          Toast.fail(result?.message || '获取设备列表失败');
          return;
        }

        const latestList = (result.data as any)?.list || [];
        if (!latestList.some((v: any) => v?.id === item?.id)) {
          setDeviceList(latestList);
          Toast.remove(loadingToast);
          Toast.info('该设备已不存在');
          const r = reload(undefined);
          if (r && typeof (r as any).then === 'function') {
            await (r as Promise<any>);
          }
          return;
        }

        const r = reload(item.id);
        if (r && typeof (r as any).then === 'function') {
          await (r as Promise<any>);
        }

        Toast.remove(loadingToast);
      } catch (e) {
        Toast.remove(loadingToast);
        Toast.fail('切换设备失败');
      }
    },
    [lockInfo?.id, reload, type],
  );

  const openEditName = useCallback((item: any) => {
    setEditingDevice(item);
    setLockNameEditing(item?.lockName || '');
    setDeviceListVisible(false);
    setEditVisible(true);
  }, []);

  const handleConfirmEdit = useCallback(async () => {
    if (!editingDevice) {
      setEditVisible(false);
      return;
    }

    const name = lockNameEditing.trim();
    if (!name) {
      Toast.info('请输入名称');
      return;
    }

    const userId = await cacheGetSync('userId');
    const loadingToast = Toast.loading('修改中...', 0);
    try {
      const res = await updateName({
        id: editingDevice.id,
        lockName: name,
        userId,
      } as any);

      if (!res?.success) {
        Toast.remove(loadingToast);
        Toast.fail(res?.message || '修改地锁名称失败');
        return;
      }

      Toast.remove(loadingToast);
      Toast.success('修改成功');
      setEditVisible(false);

      if (reload) {
        const r = reload();
        if (r && typeof (r as any).then === 'function') {
          await (r as Promise<any>);
        }
      }
    } catch (e) {
      Toast.remove(loadingToast);
      Toast.fail('修改地锁名称失败');
    }
  }, [editingDevice, lockNameEditing, reload]);

  return (
    <>
      <Flex align="center" style={styles.header}>
        {isGroupOrNonMains ? (
          // 组合设备或非市电：只展示消息入口
          <Flex style={styles.headerLeft} align="center" justify="end">
            {renderMessage()}
          </Flex>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerTouch}
            onPress={openDeviceList}
          >
            <Flex style={styles.headerLeft} align="center">
              {/* 电量 */}
              {lockInfo?.showBattery && batteryIcon && (
                <Flex align="center">
                  <Image
                    source={{ uri: batteryIcon }}
                    style={styles.batteryIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.batteryText, { color: textColor }]}>
                    {lockInfo?.powerType === 1
                      ? '充电中'
                      : `${Number(lockInfo?.battery ?? 0)}%`}
                  </Text>
                </Flex>
              )}

              {/* 信号 */}
              {signalIcon && (
                <View style={styles.colSpace16}>
                  <Image
                    source={{ uri: signalIcon }}
                    style={styles.signalIcon}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* 分割线 */}
              {lockInfo && (
                <View
                  style={[
                    styles.line,
                    styles.colSpace16,
                    isDeep ? styles.deepLineColor : styles.defaultLineColor,
                  ]}
                />
              )}

              {/* 小车图标 */}
              {lockInfo?.aboveStatus === 1 && (
                <View style={styles.colSpace16}>
                  <IconFont name="park1" size={20} color={textColor} />
                </View>
              )}

              {/* 小绿点 / 状态点 */}
              <View
                style={[
                  styles.greenDot,
                  styles.colSpace16,
                  lockInfo?.deviceStatus !== 6 &&
                    lockInfo?.deviceStatus !== 7 &&
                    styles.signalDot,
                  lockInfo?.deviceStatus === 7 && styles.failureDot,
                  lockInfo?.deviceStatus === 6
                    ? {
                        backgroundColor: isDeep
                          ? 'rgba(249, 249, 249, 0.41)'
                          : 'rgba(51, 51, 51, 0.3)',
                      }
                    : null,
                ]}
              />

              {/* 故障文案 */}
              {lockInfo?.fallStatus === LOCK_STATUS.FAULT && (
                <View style={styles.colSpace16}>
                  <Text style={styles.faultText}>设备故障</Text>
                </View>
              )}

              {/* 消息入口 */}
              <View style={styles.flexSpacer} />
              {renderMessage()}
            </Flex>
          </TouchableOpacity>
        )}
      </Flex>

      {/* 设备列表弹层 */}
      <Popup
        visible={deviceListVisible}
        onClose={() => setDeviceListVisible(false)}
        title="选择设备"
        minHeight={260}
        footer={
          <View style={styles.deviceFooter}>
            <TouchableOpacity
              style={[styles.footerButton]}
              activeOpacity={0.8}
              onPress={() => {
                setDeviceListVisible(false);
                Toast.info(
                  lockInfo?.isGroup
                    ? '创建组合设备功能待接入'
                    : '添加设备功能待接入',
                );
              }}
            >
              <Text style={styles.footerButtonText}>
                {lockInfo?.isGroup ? '创建组合设备' : '添加设备'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <ScrollView
          style={styles.deviceList}
          contentContainerStyle={styles.deviceListContent}
        >
          {deviceList.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => handleSelectDevice(item)}
              style={[
                styles.deviceItem,
                item.id === lockInfo?.id && styles.deviceItemActive,
              ]}
            >
              <View style={styles.deviceInfoLeft}>
                <Text style={styles.deviceName} numberOfLines={1}>
                  {item.lockName}
                </Text>
                <Text style={styles.deviceRole}>{item.roleName}</Text>
                {item.role === 1 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openEditName(item)}
                    style={styles.deviceEdit}
                  >
                    <Text style={styles.deviceEditText}>编辑</Text>
                    <IconFont name="pen16" size={14} color="#999999" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.deviceInfoRight}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.deviceImage}
                    resizeMode="contain"
                  />
                ) : null}
                {item.groupCount !== 1 && (
                  <View style={styles.deviceGroupWrap}>
                    <IconFont name="multiplication" size={12} color="#333333" />
                    <Text style={styles.deviceGroupCount}>
                      {item.groupCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Popup>

      {/* 重命名弹窗 */}
      <Popup
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        title={`编辑${
          editingDevice?.groupCount === 1 ? '地锁' : '组合设备'
        }名称`}
        minHeight={200}
      >
        <View style={styles.editRow}>
          <Text style={styles.editLabel}>
            {editingDevice?.groupCount === 1 ? '地锁名称' : '组合设备名称'}
          </Text>
          <TextInput
            style={styles.editInput}
            value={lockNameEditing}
            onChangeText={setLockNameEditing}
            placeholder="请输入"
            placeholderTextColor="#999999"
          />
        </View>
        <View style={styles.editFooter}>
          <TouchableOpacity
            style={[styles.editButton, styles.editCancel]}
            activeOpacity={0.8}
            onPress={() => setEditVisible(false)}
          >
            <Text style={styles.editCancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, styles.editConfirm]}
            activeOpacity={0.8}
            onPress={handleConfirmEdit}
          >
            <Text style={styles.editConfirmText}>确定</Text>
          </TouchableOpacity>
        </View>
      </Popup>

      {/* 预留蓝牙提示弹窗 */}
      <PopConfirm
        title={<Text style={styles.popTitle}>需用蓝牙连接设备开启</Text>}
        ref={{ current: null } as any}
        cancelText="取消"
        confirmText="前往连接"
        onConfirm={async () => {}}
      />
      <PopConfirm
        title={
          <Flex direction="column" align="center">
            <Text style={styles.popTitle}>温馨提示</Text>
            <Text style={styles.popText}>未连接上蓝牙，请靠近地锁才能使用</Text>
          </Flex>
        }
        ref={{ current: null } as any}
        showClose={false}
        confirmText="关闭"
        onConfirm={async () => {}}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTouch: {
    flex: 1,
  },
  colSpace16: {
    marginLeft: 8,
  },
  batteryIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  batteryText: {
    fontSize: 12,
  },
  signalIcon: {
    width: 20,
    height: 20,
  },
  line: {
    width: 1,
    height: 20,
  },
  deepLineColor: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  defaultLineColor: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  signalDot: {
    backgroundColor: '#0ED46A',
  },
  failureDot: {
    backgroundColor: '#FF2B24',
  },
  faultText: {
    fontSize: 12,
    color: '#FF2B24',
  },
  messageWrapper: {
    position: 'relative',
    paddingRight: 8,
  },
  messageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FF2B24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadgeLarge: {
    right: -4,
  },
  messageBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 16,
  },
  flexSpacer: {
    flex: 1,
  },
  deviceList: {
    maxHeight: 320,
  },
  deviceListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  deviceItemActive: {
    backgroundColor: '#F5F7FA',
  },
  deviceInfoLeft: {
    flex: 1,
    paddingRight: 12,
  },
  deviceInfoRight: {
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  deviceRole: {
    fontSize: 12,
    color: '#999',
  },
  deviceEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deviceEditText: {
    fontSize: 12,
    color: '#2878FF',
    marginRight: 4,
  },
  deviceImage: {
    width: 48,
    height: 28,
  },
  deviceGroupWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deviceGroupCount: {
    fontSize: 12,
    color: '#333',
    marginLeft: 2,
  },
  deviceFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  editLabel: {
    fontSize: 14,
    color: '#333333',
    marginRight: 12,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333333',
    textAlign: 'right',
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    marginRight: 12,
  },
  editConfirm: {
    backgroundColor: '#2878FF',
  },
  editCancelText: {
    fontSize: 14,
    color: '#333333',
  },
  editConfirmText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  popTitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  popText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
});

export default Header;
