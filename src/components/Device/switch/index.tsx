import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Toast from '@ant-design/react-native/lib/toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LockInfoDTO } from '@/pages/index/typing';
import { getLockDeviceList } from '@/services/device';
import { updateName } from '@/services/deviceInfo';
import { cacheGet } from '@/utils/cache';
import Icon from '@/iconfont';
import Flex from '@/components/Flex';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import { DeviceItem } from '../Item/index';
import { DeviceItemDTO } from '../Item/typing';
import IconFont from '@/iconfont';

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
  const [deviceList, setDeviceList] = useState<DeviceItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [lockName, setLockName] = useState('');
  const [currentDevice, setCurrentDevice] = useState<DeviceItemDTO | null>(
    null,
  );

  const devicePopRef = useRef<AnimationPopRef>(null);
  const editNamePopRef = useRef<AnimationPopRef>(null);
  const insets = useSafeAreaInsets();

  const isDeep = backgroundType === 'deep';
  const themeColor = isDeep ? '#fff' : '#333';

  const handleOpenDeviceList = () => {
    devicePopRef.current?.open();
    if (deviceList.length === 0) {
      loadDeviceList();
    }
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
        Toast.fail(res?.message || '获取设备列表失败');
        return;
      }

      console.log(res.data);
      const list = (res.data as any)?.list || [];
      setDeviceList(reloadList ? list : [...deviceList, ...list]);
    },
    [deviceList, lockInfo?.id, type],
  );

  const handleSelectDevice = async (item: DeviceItemDTO) => {
    devicePopRef.current?.close();
    if (lockInfo?.id === item.id) return;

    const loadingToast = Toast.loading('切换设备中...', 0);
    try {
      if (reload) {
        await reload(item.id);
      }
      Toast.remove(loadingToast);
    } catch (error) {
      Toast.remove(loadingToast);
      Toast.fail('切换失败');
    }
  };

  const handleOpenEditName = (item: DeviceItemDTO) => {
    setCurrentDevice(item);
    setLockName(item.lockName || '');
    devicePopRef.current?.close();
    // Wait for the first popup to close before opening the second one
    setTimeout(() => {
      editNamePopRef.current?.open();
    }, 300);
  };

  const handleNameConfirm = async () => {
    if (!lockName.trim()) {
      Toast.info('请输入名称');
      return;
    }
    const userId = await cacheGet({ key: 'userId' });
    const loadingToast = Toast.loading('修改中...', 0);

    try {
      const res = await updateName({
        id: currentDevice?.id,
        lockName: lockName,
        userId,
      });

      if (res?.success) {
        Toast.remove(loadingToast);
        Toast.success('修改成功');
        editNamePopRef.current?.close();
        if (reload) await reload();
        loadDeviceList(); // Refresh list
      } else {
        Toast.remove(loadingToast);
        Toast.fail(res?.message || '修改失败');
      }
    } catch (error) {
      Toast.remove(loadingToast);
      Toast.fail('修改异常');
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
            numberOfLines={1}
          >
            {lockInfo?.lockName}
          </Text>
          <Text style={styles.switchLine} />
          <Text style={styles.roleNameText}>{lockInfo?.roleName}</Text>
          <Icon name="pull-down" size={24} color={themeColor} />
        </Flex>
      </TouchableOpacity>

      <AnimationPop ref={devicePopRef} direction={'top'} coverSafeArea={false}>
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
                Toast.info('功能待接入');
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
      <AnimationPop ref={editNamePopRef} direction="bottom" coverSafeArea>
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
              <IconFont name={'redact'} color="#999" size={20} />
            </View>
          </View>
          <View style={styles.editFooter}>
            <TouchableOpacity
              style={[styles.editBtn, styles.cancelBtn]}
              onPress={() => editNamePopRef.current?.close()}
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
            <TouchableOpacity onPress={() => editNamePopRef.current?.close()}>
              <IconFont name={'close'} color="#333" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </AnimationPop>
    </>
  );
};

const styles = StyleSheet.create({
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    opacity: 0.5,
    marginTop: 16,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
  },
  switchLine: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
    backgroundColor: '#999',
  },
  roleNameText: {
    fontWeight: 400,
    fontSize: 12,
    color: '#333333',
    marginRight: 8,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '400',
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectListBtn: {
    paddingHorizontal: 46,
    paddingVertical: 13,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  selectListBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  editContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  editContent: {
    marginTop: 24,
    marginBottom: 36,
  },
  editItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#333',
    padding: 0,
    marginRight: 4,
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 15,
  },
  confirmBtn: {
    backgroundColor: '#333', // Dark theme primary
    marginLeft: 10,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
  },
});
