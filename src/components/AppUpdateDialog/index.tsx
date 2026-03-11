import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Toast } from '@ant-design/react-native';
import { eventCenter, setStorage } from '@/utils';
import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
import IconFont from '@/iconfont';
import styles from './styles';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';
export interface AppUpdateInfo {
  id: number;
  version: string;
  content: string;
  packageUrl?: string;
  forceUpdate?: number | boolean;
  isLast?: boolean;
  /** 确认更新时回调，由外部决定具体更新逻辑 */
  onConfirm?: () => Promise<void> | void;
  /** 暂不更新时回调（可选） */
  onSkip?: () => Promise<void> | void;
}

const APP_UPDATE_SKIP_KEY = 'APP_UPDATE_SKIP_INFO';

// 记录当前已展示过的版本，避免同一版本重复弹窗
let currentDialogVersion: string | undefined;

export function showAppUpdateDialog(info: AppUpdateInfo) {
  if (!info || !info.version) return;
  eventCenter.trigger('global:appUpdateDialog:show', info);
}

export function AppUpdateDialogHost() {
  const [visible, setVisible] = useState(false);
  const [info, setInfo] = useState<AppUpdateInfo | null>(null);

  useEffect(() => {
    const handler = (payload: AppUpdateInfo) => {
      if (payload?.version && payload.version === currentDialogVersion) {
        return;
      }
      currentDialogVersion = payload?.version;
      setInfo(payload);
      setVisible(true);
    };
    eventCenter.on('global:appUpdateDialog:show', handler);
    return () => {
      eventCenter.off('global:appUpdateDialog:show', handler);
    };
  }, []);

  const forceUpdate = Number(info?.forceUpdate ?? 0);
  const serverVersion = info?.version || '';
  const content = info?.content || '';

  const contentLines = useMemo(() => {
    const lines = (content || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    return lines.length ? lines : ['优化已知问题'];
  }, [content]);

  const handleClose = () => {
    if (forceUpdate) {
      // 强制更新时不允许直接关闭
      return;
    }
    currentDialogVersion = undefined;
    setVisible(false);
    setInfo(null);
  };

  const handleConfirm = async () => {
    try {
      setVisible(false);
      await info?.onConfirm?.();
    } catch (err: any) {
      const msg = err?.message || '更新失败，请检查网络后再次更新';
      Toast.fail(msg);
    } finally {
      currentDialogVersion = undefined;
      setInfo(null);
    }
  };

  const handleSkip = async () => {
    if (!info?.version) return;
    try {
      await setStorage({
        key: APP_UPDATE_SKIP_KEY,
        data: {
          id: info.id,
          timestamp: Date.now(),
          version: info.version,
        },
      });
      await info?.onSkip?.();
    } catch {
      // ignore
    }
    currentDialogVersion = undefined;
    setVisible(false);
    setInfo(null);
  };

  if (!info) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}
      >
        <View style={[styles.wrap]}>
          <View style={styles.header}>
            <View style={styles.headerBgContent}>
              <Image
                style={{ width: '100%', height: '100%' }}
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/setting/updatePopBg.png',
                }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerContent}>
              <View style={styles.versionBadge}>
                <LinearGradient
                  colors={['#5374B2', '#202F4F']}
                  style={{ height: 38 }}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                >
                  <Flex
                    direction="row"
                    align="center"
                    justify="center"
                    style={{ height: 34 }}
                  >
                    <Text style={styles.badgeText}>发现新版本</Text>
                    <Text style={styles.badgeVer}>V{serverVersion}</Text>
                  </Flex>
                </LinearGradient>
              </View>
            </View>
          </View>

          <ScrollView style={styles.body}>
            {contentLines.map((line, idx) => (
              <Flex
                key={idx}
                direction="row"
                align="center"
                style={styles.line}
              >
                <Text style={styles.lineText}>{line}</Text>
              </Flex>
            ))}
          </ScrollView>

          <View style={styles.updateBtnWrap}>
            <GradientButton
              colors={['#333333', '#333333']}
              width="100%"
              height={48}
              round={false}
              btnBorderRadius={24}
              onPress={handleConfirm}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}
              >
                立即更新
              </Text>
            </GradientButton>
          </View>

          {!forceUpdate && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.skipRow}
              onPress={handleSkip}
            >
              <Flex align="center" justify="center">
                <IconFont
                  name="a-pop-upwindowsclose"
                  size={24}
                  color="#999999"
                />
                <Text style={styles.skipText}>暂不更新，明天提醒我</Text>
              </Flex>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
