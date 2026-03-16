import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  InteractionManager,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageContainer, Popup, TextInput } from '@/components';
import AppIcon from '@/components/AppIcon';
import {
  ImagePickerResponse,
  launchImageLibrary,
  MediaType,
} from 'react-native-image-picker';
import { baseInfo, updateInfo } from '@/services/user';
import { checkAndRequestPhotoPermission } from '@/utils/permissions';
import styles from './styles';
import { openSettings } from 'react-native-permissions';
import { hideLoading, showLoading, showToast, tencentUpload } from '@/utils';

type BaseInfoData = {
  id?: number;
  userId?: number;
  nickName?: string;
  avatar?: string;
  isTest?: boolean;
  bgUrl?: string;
  [k: string]: any;
};

export default function UserInfo() {
  const [detail, setDetail] = useState<BaseInfoData | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const [nickName, setNickName] = useState('');
  const [inputName, setInputName] = useState('');

  const [avatar, setAvatar] = useState('');
  const [nickNameVisible, setNickNameVisible] = useState(false);
  const pickerBusyRef = useRef(false);

  const canSaveNickName = useMemo(
    () => inputName.trim().length > 0,
    [inputName],
  );
  const load = useCallback(async () => {
    setLoading(true);
    showLoading({ title: '加载中...' });
    try {
      const res = await baseInfo({});
      if (res.code !== 200 || !res.success) {
        hideLoading();
        showToast(res.msg || res.message || '获取用户信息失败');
        return;
      }

      const data = (res.data || {}) as BaseInfoData;
      setDetail(data);
      setNickName(data.nickName || '');
      setInputName(data.nickName || '');
      setAvatar(data.avatar || '');
      hideLoading();
    } catch (e) {
      hideLoading();
      showToast('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return;
  }, [load]);

  const saveNickName = useCallback(async () => {
    const newName = inputName.trim();
    if (!newName) {
      showToast('昵称不能为空');
      return false;
    }
    if (!detail) return false;

    showLoading({ title: '保存中...' });
    try {
      const payload = {
        ...detail,
        nickName: newName,
        userId: detail.userId ?? detail.id,
      };
      const res = await updateInfo(payload);
      hideLoading();
      if (res.code === 200 && res.success) {
        showToast('修改成功');
        await load();
        return true;
      }
      showToast(res.msg || res.message || '修改失败');
      return false;
    } catch {
      hideLoading();
      showToast('修改失败');
      return false;
    }
  }, [detail, inputName, load]);

  const handleChangeAvatar = useCallback(async () => {
    if (pickerBusyRef.current) return;
    pickerBusyRef.current = true;

    try {
      // 检查相册权限（Android 需要，iOS 也需要）
      const hasPermission = await checkAndRequestPhotoPermission();
      if (!hasPermission) {
        pickerBusyRef.current = false;
        return;
      }

      const baseOptions = {
        mediaType: 'photo',
        quality: 0.8 as any,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: true,
      } as const;

      const libraryOptions: any = {
        ...baseOptions,
        presentationStyle: 'fullScreen',
        selectionLimit: 1,
      };

      const launchFunction = launchImageLibrary;
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      await new Promise<void>(resolve =>
        InteractionManager.runAfterInteractions(() => resolve()),
      );
      launchFunction(libraryOptions, async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          return;
        }

        if ((response as any).errorCode === 'permission') {
          Alert.alert(
            '需要权限',
            '请在“设置-隐私与安全-照片”中允许访问相册。',
            [
              { text: '取消', style: 'cancel' },
              {
                text: '去设置',
                onPress: () => {
                  openSettings().catch(() => {
                    Alert.alert('无法打开设置', '请手动前往系统设置开启权限');
                  });
                },
              },
            ],
          );
          return;
        }

        if (response.errorMessage) {
          // 处理其他类型的错误（非权限错误）
          if (response.errorMessage.includes('Activity')) {
            Alert.alert(
              '功能不可用',
              '图片选择功能暂时不可用，请检查设备权限设置',
              [{ text: '确定', style: 'default' }],
            );
          } else {
            Alert.alert('错误', `选择图片时发生错误: ${response.errorMessage}`);
          }
          return;
        }

        if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (!asset.uri) return;
          tencentUpload({
            file: asset.uri,
            filename: asset.fileName || '',
            index: asset.fileSize || 0,
          }).then(async res => {
            if (res.code === 200 && res.success) {
              const { Location } = res.data;
              const r = await updateInfo({
                ...detail,
                avatar: `https://${Location}`,
                userId: detail?.userId ?? detail?.id,
              });
              if (r.code === 200 && r.success) {
                showToast('修改成功');
                await load();
              } else {
                showToast(r.msg || r.message || '修改失败');
              }
            }
          });

          if (asset.uri) {
          }
        }
      });
    } catch (error) {
      console.error('选择头像失败:', error);
      showToast('选择头像失败');
    } finally {
      pickerBusyRef.current = false;
    }
  }, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '个人信息',
        showBack: true,
      }}
      scrollable
      loading={loading && !detail}
      padding={0}
    >
      <View style={styles.container}>
        {/* 头像 */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.row}
          onPress={handleChangeAvatar}
        >
          <Text style={styles.label}>头像</Text>
          <View style={styles.middle}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
          </View>
          <AppIcon name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>

        {/* 昵称 */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.row}
          onPress={() => {
            setInputName(nickName);
            setNickNameVisible(true);
          }}
        >
          <Text style={styles.label}>昵称</Text>
          <View style={styles.middle}>
            <Text style={styles.valueText} numberOfLines={1}>
              {nickName || ''}
            </Text>
          </View>
          <AppIcon name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>
      </View>

      {/* 修改昵称 */}
      <Popup
        visible={nickNameVisible}
        title="修改昵称"
        onClose={() => {
          setNickNameVisible(false);
          setInputName(nickName);
        }}
        footer={
          <View style={styles.popupFooterRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.popupBtnGhost}
              onPress={() => {
                setNickNameVisible(false);
                setInputName(nickName);
              }}
            >
              <Text style={styles.popupBtnGhostText}>取消</Text>
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.popupBtnPrimary]}
              onPress={async () => {
                const ok = await saveNickName();
                if (ok) setNickNameVisible(false);
              }}
              disabled={!canSaveNickName}
            >
              <Text style={styles.popupBtnPrimaryText}>保存</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.popupBody}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>昵称</Text>
            <TextInput
              defaultValue={inputName}
              placeholder="请输入昵称"
              style={styles.input}
              maxLength={20}
              onChangeText={v => setInputName(v)}
              returnKeyType="done"
            />
            <AppIcon name="redact" size={20} color="#999999" />
          </View>
        </View>
      </Popup>
    </PageContainer>
  );
}
