import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import type { LockInfoDTO } from '@/pages/index/typing';
import { getLockDeviceList } from '@/services/device';
import { updateName } from '@/services/deviceInfo';
import { cacheGet } from '@/utils/cache';
import Flex from '@/components/Flex';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import { DeviceItem } from '../Item/index';
import { DeviceItemDTO } from '../Item/typing';
import AppIcon from '@/components/AppIcon';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { hideLoading, showLoading, showToast } from '@/utils';
import Popup from '@/components/Popup';

interface Props {
  lockInfo?: LockInfoDTO;
  reload?: (id?: number) => Promise<any> | void;
  type: number;
  backgroundType?: 'deep' | 'shallow';
}

export const DeviceSwitch: React.FC<Props> = ({
  lockInfo,
  reload,
  type,
  backgroundType,
}) => {
  const navigation = useAppNavigation();

  const [deviceList, setDeviceList] = useState<DeviceItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockName, setLockName] = useState('');
  const [currentDevice, setCurrentDevice] = useState<DeviceItemDTO | null>(
    null,
  );

  const devicePopRef = useRef<AnimationPopRef>(null);
  const [editNamePopVisible, setEditNamePopVisible] = useState(false);

  const insets = useSafeAreaInsets();

  const isDeep = backgroundType === 'deep';
  const themeColor = isDeep ? '#fff' : '#333';

  const handleOpenDeviceList = () => {
    setEditNamePopVisible(false);
    devicePopRef.current?.open();
    loadDeviceList();
  };

  const loadDeviceList = useCallback(
    async (reloadList: boolean = true) => {
      if (!lockInfo?.id) return;
      const offset = reloadList ? 0 : deviceList.length;
      const res = await getLockDeviceList({
        offset,
        pageSize: 999,
        id: lockInfo.id,
        type,
      } as any);

      if (!res?.success) {
        showToast({ title: res?.message || '获取设备列表失败', icon: 'info' });
        return;
      }

      const list = (res.data as any)?.list || [];
      setDeviceList(reloadList ? list : [...deviceList, ...list]);
    },
    [deviceList, lockInfo?.id, type],
  );

  const handleSelectDevice = async (item: DeviceItemDTO) => {
    devicePopRef.current?.close();
    if (lockInfo?.id === item.id) return;

    showLoading({ title: '切换设备中...' });
    try {
      if (reload) {
        await reload(item.id);
      }
    } catch (error) {
      showToast({ title: '切换失败', icon: 'error' });
    } finally {
      hideLoading();
    }
  };

  const handleOpenEditName = (item: DeviceItemDTO) => {
    setCurrentDevice(item);
    setLockName(item.lockName || '');
    devicePopRef.current?.close();
    setEditNamePopVisible(true);
  };

  const handleNameConfirm = async () => {
    if (!lockName.trim()) {
      showToast({ title: '请输入名称', icon: 'info' });
      return;
    }
    const userId = await cacheGet({ key: 'userId' });
    showLoading({ title: '修改中...' });

    try {
      const res = await updateName({
        id: currentDevice?.id,
        lockName: lockName,
        userId,
      });
      if (res?.success) {
        showToast({ title: '修改成功', icon: 'success' });
        setEditNamePopVisible(false);
        if (reload) await reload();
        loadDeviceList(); // Refresh list
      } else {
        showToast({ title: res?.message || '修改失败', icon: 'error' });
      }
    } catch (error) {
      showToast({ title: '修改异常', icon: 'info' });
    } finally {
      hideLoading();
    }
  };

  const handleClick = () => {
    if (lockInfo?.isGroup) {
      navigation.navigate('CombineDevice', {
        type: false,
        id: lockInfo?.id,
        lockName: lockInfo?.lockName,
      });
    } else {
      navigation.navigate('BindDevice');
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenDeviceList}
        style={styles.switchBtn}
      >
        <Flex direction="row" align="center" justify="center">
          <Text
            style={[styles.switchText, { color: themeColor }]}
            // numberOfLines={1}
          >
            {lockInfo?.lockName}
          </Text>
          <Text style={styles.switchLine} />
          <Text style={styles.roleNameText}>{lockInfo?.roleName ?? ''}</Text>
          <AppIcon name="pull-down" size={12} color={themeColor} />
        </Flex>
      </TouchableOpacity>

      {/* iOS 顶部留白问题：top 弹层用样式覆盖 marginTop/paddingTop */}
      <AnimationPop ref={devicePopRef} direction={'top'} coverSafeArea>
        <View
          style={{
            paddingTop: 4,
          }}
        >
          <ScrollView
            style={{
              maxHeight: 466,
              paddingHorizontal: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {deviceList.map((item, index) => (
              <DeviceItem
                key={item.id}
                data={item}
                active={lockInfo?.id === item.id}
                onSelect={() => handleSelectDevice(item)}
                onChangeName={() => handleOpenEditName(item)}
              />
            ))}

            {!loading && deviceList.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无设备</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.selectListBtn}
              onPress={() => {
                devicePopRef.current?.close();
                handleClick();
              }}
            >
              <Text style={styles.selectListBtnText}>
                {lockInfo?.isGroup ? '创建组合设备' : '添加设备'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AnimationPop>

      {/* Edit Name Popup */}
      <Popup
        visible={editNamePopVisible}
        showClose={false}
        onClose={() => setEditNamePopVisible(false)}
      >
        <View
          style={[styles.editContainer, { paddingBottom: insets.bottom + 8 }]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>修改名称</Text>
          </View>

          <View style={styles.editContent}>
            <View style={styles.editItem}>
              <Text style={styles.editLabel}>
                {currentDevice?.groupCount === 1 ? '地锁名称' : '组合设备名称'}
              </Text>
              <TextInput
                style={styles.input}
                value={lockName}
                onChangeText={setLockName}
                placeholder="请输入名称"
                placeholderTextColor="#999"
                maxLength={20}
              />
              <AppIcon name={'redact'} color="#999" size={20} />
            </View>
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelBtn]}
              onPress={() => setEditNamePopVisible(false)}
            >
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, styles.confirmBtn]}
              onPress={handleNameConfirm}
            >
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closeIcon}>
            <TouchableOpacity onPress={() => setEditNamePopVisible(false)}>
              <AppIcon name={'close'} color="#333" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </Popup>
    </>
  );
};
