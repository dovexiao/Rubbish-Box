import React, { useCallback, useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { PageContainer, Popup, TextInput } from '@/components';
import IconFont from '@/iconfont';
import { baseInfo, updateInfo } from '@/services/user';
import styles from './styles';

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
  const [inputAvatar, setInputAvatar] = useState('');
  const [nickNameVisible, setNickNameVisible] = useState(false);

  const canSaveNickName = useMemo(() => inputName.trim().length > 0, [inputName]);
  ;

  const load = useCallback(async () => {
    setLoading(true);
    const t = Toast.loading('加载中...', 0);
    try {
      const res = await baseInfo({});
      if (res.code !== 200 || !res.success) {
        Toast.remove(t);
        Toast.fail(res.msg || res.message || '获取用户信息失败');
        return;
      }

      const data = (res.data || {}) as BaseInfoData;
      setDetail(data);
      setNickName(data.nickName || '');
      setInputName(data.nickName || '');
      setAvatar(data.avatar || '');
      setInputAvatar(data.avatar || '');
      Toast.remove(t);
    } catch (e) {
      Toast.remove(t);
      Toast.fail('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return;
    }, [load]),
  );

  const saveNickName = useCallback(async () => {
    const newName = inputName.trim();
    if (!newName) {
      Toast.info('昵称不能为空');
      return false;
    }
    if (!detail) return false;

    const t = Toast.loading('保存中...', 0);
    try {
      const payload = {
        ...detail,
        nickName: newName,
        userId: detail.userId ?? detail.id,
      };
      const res = await updateInfo(payload);
      Toast.remove(t);
      if (res.code === 200 && res.success) {
        Toast.success('修改成功');
        await load();
        return true;
      }
      Toast.fail(res.msg || res.message || '修改失败');
      return false;
    } catch {
      Toast.remove(t);
      Toast.fail('修改失败');
      return false;
    }
  }, [detail, inputName, load]);


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
          onPress={() => {
            // RN 版没有接入相册选择/上传能力，这里用“输入链接”方式完成头像修改

          }}
        >
          <Text style={styles.label}>头像</Text>
          <View style={styles.middle}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
          </View>
          <IconFont name="a-headfor-20" size={20} color="#333333" />
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
          <IconFont name="a-headfor-20" size={20} color="#333333" />
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
              value={inputName}
              placeholder="请输入昵称"
              style={styles.input}
              maxLength={20}
              onChangeText={(v) => setInputName(v)}
              autoFocus
              returnKeyType="done"
            />
            <IconFont name="redact" size={20} color="#999999" />
          </View>
        </View>
      </Popup>
    </PageContainer>
  );
}