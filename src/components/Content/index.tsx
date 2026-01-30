import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import Flex from '../Flex';
import IconFont from '@/iconfont';
import { Toast } from '@ant-design/react-native';
import { operateLock } from '@/services/device';
import { OPT_TYPE } from '@/constants';
import { DeviceSwitch } from '../Device/switch';
import { LockInfoDTO } from '@/pages/index/typing';

interface ContentProps {
  detail?: LockInfoDTO;
  backgroundType?: 'deep' | 'shallow';
  reload?: (id?: number) => Promise<any> | void;
  isMultiple?: boolean;
  optioning?: boolean;
  onFresh?: (id?: number) => Promise<any> | void;
  onAnimation?: (params: any) => void;
  children?: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({
  detail,
  backgroundType,
  reload,
  isMultiple,
  optioning,
  onFresh,
  onAnimation,
  children,
}) => {
  const [operating, setOperating] = useState(false);

  const handleOperate = useCallback(
    async (direction: 'rise' | 'fall') => {
      if (!detail?.id || operating) return;

      setOperating(true);
      const loadingToast = Toast.loading(
        direction === 'fall' ? '降下中...' : '升起中...',
        0,
      );

      try {
        const res = await operateLock({
          id: detail.id,
          optType: direction === 'fall' ? OPT_TYPE.FALL : OPT_TYPE.RISE,
        } as any);

        if (res?.code === 200 || res?.success) {
          Toast.success(
            direction === 'fall' ? '已发送降锁指令' : '已发送升锁指令',
          );
          if (onFresh) {
            await onFresh(detail.id);
          } else if (reload) {
            await reload(detail.id);
          }
        } else {
          Toast.fail(res?.message || res?.msg || '操作失败');
        }
      } catch (e) {
        Toast.fail('操作失败，请稍后重试');
      } finally {
        Toast.remove(loadingToast);
        setOperating(false);
      }
    },
    [detail, onFresh, reload, operating],
  );

  const address = detail?.locationList?.[0]?.address || detail?.address || '';

  return (
    // <ImageBackground source={{ uri: detail?.imageMap?.bgPng }}>
    <View style={styles.contentBox}>
      {/* 上方设备模型/状态图 */}
      <Flex direction="column" align="center">
        {children}
        <DeviceSwitch
          lockInfo={detail}
          reload={reload}
          type={detail?.isGroup ? 2 : 1}
          backgroundType={backgroundType}
        />
      </Flex>

      {/* 手动升降按钮 */}
      <Flex justify="between" style={styles.manualRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.manualBtn}
          disabled={operating}
          onPress={() => handleOperate('rise')}
        >
          <View style={styles.manualIconCircle}>
            <IconFont name="rise" size={24} color="#333333" />
          </View>
          <Text style={styles.manualText}>手动升锁</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.manualBtn}
          disabled={operating}
          onPress={() => handleOperate('fall')}
        >
          <View style={styles.manualIconCircle}>
            <IconFont name="down" size={24} color="#333333" />
          </View>
          <Text style={styles.manualText}>手动降锁</Text>
        </TouchableOpacity>
      </Flex>

      {/* 地图 + 设备信息卡片 */}
      <Flex justify="between" style={styles.cardsRow}>
        <View style={[styles.card, styles.mapCard]}>
          <View style={styles.mapPreview}>
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/map_placeholder.png',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            当前位置
          </Text>
          {!!address && (
            <Text style={styles.cardSubTitle} numberOfLines={2}>
              {address}
            </Text>
          )}
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <Flex justify="between" align="center">
            <Text style={styles.cardTitle}>设备信息</Text>
            <IconFont name="a-headfor-20" size={16} color="#333333" />
          </Flex>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>电量</Text>
            <Text style={styles.infoValue}>{detail?.battery ?? '--'}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>信号</Text>
            <Text style={styles.infoValue}>{'--'}</Text>
          </View>
        </View>
      </Flex>

      {/* 成员共享 / 下载 App 等入口 */}
      <View style={styles.entryList}>
        <TouchableOpacity activeOpacity={0.8} style={styles.entryItem}>
          <Flex justify="between" align="center">
            <Flex align="center">
              <IconFont name="member" size={18} color="#333333" />
              <Text style={styles.entryText}>成员共享</Text>
            </Flex>
            <IconFont name="a-headfor-20" size={16} color="#B3B3B3" />
          </Flex>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} style={styles.entryItem}>
          <Flex justify="between" align="center">
            <Flex align="center">
              <IconFont name="download" size={18} color="#333333" />
              <Text style={styles.entryText}>下载APP</Text>
            </Flex>
            <IconFont name="a-headfor-20" size={16} color="#B3B3B3" />
          </Flex>
        </TouchableOpacity>
      </View>
    </View>
    // </ImageBackground>
  );
};

const styles = StyleSheet.create({
  contentBox: {
    flex: 1,
  },

  lockNameText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333',
  },
  manualRow: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  manualBtn: {
    alignItems: 'center',
  },
  manualIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  },
  manualText: {
    fontSize: 12,
    color: '#333333',
  },
  cardsRow: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapCard: {
    marginRight: 4,
  },
  infoCard: {
    marginLeft: 4,
  },
  mapPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#666666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 12,
    color: '#333333',
  },
  entryList: {
    marginTop: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  entryItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  entryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
});

export default Content;
