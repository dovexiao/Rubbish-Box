import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  ImageStyle,
} from 'react-native';
import Flex from '../Flex';
import IconFont from '@/iconfont';
import { Toast } from '@ant-design/react-native';
import { operateLock } from '@/services/device';
import { OPT_TYPE } from '@/constants';
import { DeviceSwitch } from '../Device/switch';
import { LockInfoDTO } from '@/pages/index/typing';
import { styles } from './style';
import { groupSubList } from '@/services';
import { useAppNavigation } from '@/hooks/useAppNavigation';

interface ContentProps {
  detail?: LockInfoDTO;
  reload?: (id?: number) => Promise<any> | void;
  optioning?: boolean;
  onFresh?: (id?: number) => Promise<any> | void;
  onAnimation?: (params: any) => void;
  children?: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({
  detail,
  reload,
  optioning,
  onFresh,
  onAnimation,
  children,
}) => {
  const navigation = useAppNavigation();

  const [operating, setOperating] = useState(false);
  const [groupList, setGroupList] = useState<any[]>([]);

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

  const handleDeviceInfo = () => {
    if (detail?.isGroup) {
      console.log('跳转设备列表');
    } else {
      if (!detail?.id) return;
      navigation.navigate('DeviceInfo', {
        lockId: detail.id,
        isAdmin: detail?.role === 1,
      });
    }
  };

  const address = detail?.locationList?.[0]?.address || detail?.address || '';

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
              style={styles.mapImage as ImageStyle}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            当前位置{detail?.isGroup ? '（组锁）' : '（单锁）'}
          </Text>
          {!!address && (
            <Text style={styles.cardSubTitle} numberOfLines={2}>
              {address}
            </Text>
          )}
        </View>

        <Pressable style={[styles.card]} onPress={handleDeviceInfo}>
          <Flex justify="between" align="center" style={styles.cardHeader}>
            <IconFont
              name={
                detail?.isGroup ? 'a-Equipmentlist' : 'a-equipmentinformation'
              }
              size={20}
              color={'#333'}
            />
            <Text style={styles.cardTitle}>
              {detail?.isGroup ? '设备列表' : '设备信息'}
            </Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
          {detail?.isGroup ? (
            <Flex
              style={styles.groupListBox}
              direction="column"
              justify="between"
              align="center"
            >
              {(groupList || [])?.slice(0, 2)?.map(item => (
                <Flex
                  key={item?.id}
                  style={styles.groupItem}
                  direction="row"
                  justify={'between'}
                  align={'center'}
                >
                  <Image
                    source={
                      item?.imageUrl
                        ? { uri: String(item.imageUrl) }
                        : undefined
                    }
                    style={styles.groupItemImage as ImageStyle}
                  />
                  <Text numberOfLines={1} style={styles.groupItemLockName}>
                    {item?.lockName || ''}
                  </Text>
                </Flex>
              ))}
            </Flex>
          ) : (
            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <IconFont name={'a-Upgradelock'} size={16} color="#ccc" />
                <Text style={styles.infoLabel}>离车升锁</Text>
                <Text style={styles.infoValue}>
                  {detail?.battery ? `${detail?.leaveUpTime}s` : '暂无信息'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <IconFont name={'bell'} size={16} color="#ccc" />
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

      {/* 成员共享 / 下载 App 等入口 */}
      <View style={styles.entryList}>
        <TouchableOpacity style={styles.entryItem}>
          <Flex justify="between" align="center">
            <IconFont name="member" size={16} color="#333333" />
            <Text style={styles.entryText}>成员共享</Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
        </TouchableOpacity>

        <TouchableOpacity style={styles.entryItem}>
          <Flex justify="between" align="center">
            <IconFont name="download" size={16} color="#333333" />
            <Text style={styles.entryText}>下载APP</Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </Flex>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Content;
