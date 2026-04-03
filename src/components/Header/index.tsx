import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Flex from '../Flex';
import AppIcon from '@/components/AppIcon';
import {
  BATTERY_STATUS,
  BATTERY_STATUS_DEEP,
  SIGNAL_STATUS,
  SIGNAL_STATUS_DEEP,
  LOCK_STATUS,
} from '@/constants';
import PopConfirm from '@/components/popConfirm';
import { useTheme } from '@/context/ThemeContext';
import { getSignalStatus } from '@/utils/biz';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { fontSize, px } from '@/utils/ui';

interface HeaderProps {
  /** 未读消息数 */
  unreadCount?: number;
  /** 当前锁信息 */
  lockInfo?: any;
  /** 设备类型：单个/组合等，默认为 1，与原项目对齐占位 */
  type?: number;
  /** 标题（占位，保持与调用方兼容） */
  title?: string;
  /** 鸿蒙端 noDevices header高度单独处理*/
  noDevices?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  unreadCount = 0,
  lockInfo,
  type = 1,
  noDevices = false,
}) => {
  const { theme, themeType } = useTheme();
  const navigation = useAppNavigation();
  const textColor = useMemo(() => {
    // 深色模式下 primary 为白色
    return themeType !== 'dark' || !lockInfo?.id
      ? theme.colors.text.color333
      : theme.colors.text.primary;
  }, [themeType, theme, lockInfo]);

  const batteryIcon = useMemo(() => {
    if (!lockInfo?.showBattery) return undefined;

    // 市电充电中
    if (lockInfo?.powerType === 1) {
      return themeType === 'dark'
        ? 'https://g.18qjz.cn/img/boklock/batteryIcon/charging.png'
        : 'https://g.18qjz.cn/img/boklock/batteryIcon/deep_charging.png';
    }

    // 离线或故障使用无信号图标
    if ([6, 7].includes(lockInfo?.deviceStatus)) {
      return themeType === 'dark'
        ? 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_no_signal_deep.png'
        : 'https://g.18qjz.cn/img/boklock/batteryIcon/battery_no_signal.png';
    }

    const percent = Number(lockInfo?.battery ?? 0);
    const level =
      percent >= 75 ? 100 : percent >= 50 ? 75 : percent >= 25 ? 50 : 25;
    const map = themeType === 'dark' ? BATTERY_STATUS_DEEP : BATTERY_STATUS;
    return (map as any)[level];
  }, [themeType, lockInfo]);

  const signalIcon = useMemo(() => {
    // 离线单独处理
    if (lockInfo?.deviceStatus === 6) {
      return themeType === 'dark'
        ? 'https://g.18qjz.cn/img/boklock/signalIcon/signal_no_signal_deep.png'
        : 'https://g.18qjz.cn/img/boklock/signalIcon/signal_no_signal.png';
    }

    const csq = Number(lockInfo?.atCsq ?? 0);
    let level: 1 | 2 | 3 | 4 | 5 = 1;
    if (csq >= 20) level = 5;
    else if (csq >= 16) level = 4;
    else if (csq >= 12) level = 3;
    else if (csq >= 8) level = 2;
    const map = themeType === 'dark' ? SIGNAL_STATUS_DEEP : SIGNAL_STATUS;
    return (map as any)[level];
  }, [themeType, lockInfo]);
  const renderMessage = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate('Message', { lockId: lockInfo?.id });
      }}
    >
      <View
        style={[
          unreadCount > 99 ? styles.messgeWrapperMax : styles.messageWrapper,
        ]}
      >
        <AppIcon name="message" size={px(24)} color={textColor} />
        {unreadCount > 0 && (
          <View
            style={[
              styles.messageBadge,
              unreadCount > 99
                ? styles.messageBadgeTextLengthMore
                : styles.messageBadgeTextLength,
            ]}
          >
            <Text style={styles.messageBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const isGroupOrNonMains = lockInfo?.isGroup || noDevices;
  const isHarmony = !['ios', 'android'].includes(Platform.OS);
  const deviceStatus = lockInfo?.deviceStatus;

  const statusDotStyle = useMemo(() => {
    const isOffline = deviceStatus === 6;
    const isFailure = deviceStatus === 7;
    const offlineBackgroundStyle = isOffline
      ? {
          backgroundColor:
            themeType === 'dark'
              ? 'rgba(249, 249, 249, 0.41)'
              : 'rgba(51, 51, 51, 0.3)',
        }
      : undefined;

    return [
      styles.greenDot,
      styles.colSpace16,
      !isOffline && !isFailure && styles.signalDot,
      isFailure && styles.failureDot,
      offlineBackgroundStyle,
    ];
  }, [deviceStatus, themeType]);

  return (
    <>
      <Flex
        align="center"
        style={styles[isHarmony && noDevices ? 'headerHarmony' : 'header']}
      >
        {isGroupOrNonMains ? (
          // 组合设备或非市电：只展示消息入口
          <Flex style={styles.headerLeft} align="center" justify="end">
            {renderMessage()}
          </Flex>
        ) : (
          <TouchableOpacity activeOpacity={0.8} style={styles.headerTouch}>
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
              <View style={styles.colSpace16}>
                <Image
                  style={styles.signalIcon}
                  source={{
                    uri: getSignalStatus(
                      lockInfo?.atCsq ?? 0,
                      lockInfo?.deviceStatus,
                      themeType,
                    ),
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* 分割线 */}
              {lockInfo && (
                <View
                  style={[
                    styles.line,
                    styles.colSpace16,
                    themeType === 'dark'
                      ? styles.deepLineColor
                      : styles.defaultLineColor,
                  ]}
                />
              )}

              {/* 小车图标 */}
              {lockInfo?.aboveStatus === 1 && (
                <View style={styles.colSpace16}>
                  <AppIcon name="park1" size={px(20)} color={textColor} />
                </View>
              )}

              {/* 小绿点 / 状态点 */}
              {!noDevices && <View style={statusDotStyle} />}

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

      {/* 预留蓝牙提示弹窗：Android / iOS 使用，Harmony 暂时关闭以避免兼容性崩溃 */}
      {!isHarmony && (
        <>
          <PopConfirm
            title={<Text style={styles.popTitle}>需用蓝牙连接设备开启</Text>}
            cancelText="取消"
            confirmText="前往连接"
            onConfirm={async () => {}}
          />
          <PopConfirm
            title={
              <Flex direction="column" align="center">
                <Text style={styles.popTitle}>温馨提示</Text>
                <Text style={styles.popText}>
                  未连接上蓝牙，请靠近地锁才能使用
                </Text>
              </Flex>
            }
            showClose={false}
            confirmText="关闭"
            onConfirm={async () => {}}
          />
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: px(54),
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerHarmony: {
    height: px(70),
    paddingHorizontal: px(16),
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
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
    marginLeft: px(8),
  },
  batteryIcon: {
    width: px(20),
    height: px(20),
    marginRight: px(4),
  },
  batteryText: {
    fontSize: fontSize(12),
  },
  signalIcon: {
    width: px(20),
    height: px(20),
  },
  line: {
    width: px(1),
    height: px(12),
  },
  deepLineColor: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  defaultLineColor: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  greenDot: {
    width: px(8),
    height: px(8),
    borderRadius: px(4),
  },
  signalDot: {
    backgroundColor: '#0ED46A',
  },
  failureDot: {
    backgroundColor: '#FF2B24',
  },
  faultText: {
    fontSize: fontSize(12),
    color: '#FF2B24',
  },
  messageWrapper: {
    position: 'relative',
    paddingRight: px(14),
  },
  messgeWrapperMax: {
    position: 'relative',
    paddingRight: px(22),
  },
  messageBadge: {
    position: 'absolute',
    top: px(-8),
    left: px(14),
    height: px(18),
    paddingHorizontal: px(4),
    borderRadius: px(9),
    backgroundColor: '#FF2B24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadgeTextLength: {
    minWidth: px(24),
  },
  messageBadgeTextLengthMore: {
    minWidth: px(32),
  },
  messageBadgeText: {
    fontSize: fontSize(12),
    color: '#FFFFFF',
  },
  flexSpacer: {
    flex: 1,
  },
  deviceList: {
    maxHeight: px(320),
  },
  deviceListContent: {
    paddingHorizontal: px(16),
    paddingBottom: px(8),
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  deviceItemActive: {
    backgroundColor: '#F5F7FA',
  },
  deviceInfoLeft: {
    flex: 1,
    paddingRight: px(12),
  },
  deviceInfoRight: {
    alignItems: 'center',
  },
  deviceName: {
    fontSize: fontSize(16),
    color: '#333',
    marginBottom: px(4),
  },
  deviceRole: {
    fontSize: fontSize(12),
    color: '#999',
  },
  deviceEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(4),
  },
  deviceEditText: {
    fontSize: fontSize(12),
    color: '#2878FF',
    marginRight: px(4),
  },
  deviceImage: {
    width: px(48),
    height: px(28),
  },
  deviceGroupWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(4),
  },
  deviceGroupCount: {
    fontSize: fontSize(12),
    color: '#333',
    marginLeft: px(2),
  },
  deviceFooter: {
    paddingHorizontal: px(16),
    paddingVertical: px(12),
  },
  footerButton: {
    height: px(44),
    borderRadius: px(22),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(16),
    marginTop: px(16),
  },
  editLabel: {
    fontSize: fontSize(14),
    color: '#333333',
    marginRight: px(12),
  },
  editInput: {
    flex: 1,
    height: px(40),
    borderRadius: px(8),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    paddingHorizontal: px(12),
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'right',
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: px(16),
    marginTop: px(24),
  },
  editButton: {
    flex: 1,
    height: px(40),
    borderRadius: px(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E5',
    marginRight: px(12),
  },
  editConfirm: {
    backgroundColor: '#2878FF',
  },
  editCancelText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  editConfirmText: {
    fontSize: fontSize(14),
    color: '#FFFFFF',
  },
  popTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    textAlign: 'center',
  },
  popText: {
    marginTop: px(8),
    fontSize: fontSize(14),
    color: '#666666',
  },
});

export default Header;
