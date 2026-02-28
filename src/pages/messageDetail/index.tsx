import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
import GradientButton from '@/components/GradientButton';
import { hideLoading, showLoading, showToast } from '@/utils';
import { getInstallTaskDetail, installConfirm } from '@/services/user';
import { styles } from './style';

const OPERATION_ITEM = [
  {
    id: 1,
    title:
      '1、现场验收：请您现在检查地锁的安装牢固度，水平度及使用功能（升降是否顺畅）。',
  },
  {
    id: 2,
    title:
      '2、APP确认：验收无误后，烦请您打开【泊刻地锁】APP，在消息页面点击“确认完成”。',
  },
  {
    id: 3,
    title:
      '3、温馨提示：您的确认是平台给我结算服务费用的唯一凭证，非常感谢您的支持！',
  },
];

type InstallDetail = {
  taskNo?: string;
  productName?: string;
  num?: number | string;
  address?: string;
  createTime?: string;
  installUsername?: string;
  installUserMobile?: string;
  checkStatus?: number | boolean;
};

export default function MessageDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const msgId: string | number | undefined =
    route.params?.msgId ?? route.params?.id;

  const [detail, setDetail] = useState<InstallDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const canConfirm = useMemo(() => {
    if (!detail) return false;
    return !detail.checkStatus;
  }, [detail]);

  const loadDetail = useCallback(async () => {
    if (msgId === undefined || msgId === null || msgId === '') return;
    setLoading(true);
    try {
      const res: any = await getInstallTaskDetail({ id: msgId } as any);
      if (res?.code === 200 && res?.success !== false) {
        setDetail(res?.data ?? res);
        return;
      }
      showToast(res?.message || res?.msg || '获取详情失败');
      setDetail(null);
    } catch {
      showToast('获取详情失败');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [msgId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleInstallConfirm = useCallback(async () => {
    if (msgId === undefined || msgId === null || msgId === '') return;
    showLoading({ title: '提交中...' });
    try {
      const res: any = await installConfirm({ id: msgId } as any);
      if (res?.code === 200 && res?.success !== false) {
        showToast({ title: '安装确认成功', icon: 'success' });
        navigation.goBack();
        return;
      }
      showToast({
        title: res?.message || res?.msg || '安装确认失败',
        icon: 'error',
      });
    } catch {
      showToast({ title: '安装确认失败', icon: 'error' });
    } finally {
      hideLoading();
    }
  }, [msgId, navigation]);

  return (
    <PageContainer
      backgroundColor="#F6F7F9"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '消息详情',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading && !detail}
      footer={
        canConfirm ? (
          <View style={styles.footerContainer}>
            <GradientButton
              colors={['#4A4A4A', '#282828']}
              height={48}
              btnBorderRadius={16}
              onPress={handleInstallConfirm}
            >
              <Text style={styles.footerBtnText}>确认完成</Text>
            </GradientButton>
          </View>
        ) : undefined
      }
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>安装信息</Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装任务ID</Text>
              <Text style={styles.value}>{detail?.taskNo || '-'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装设备</Text>
              <Text style={styles.value}>{detail?.productName || '-'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装数量</Text>
              <Text style={styles.value}>
                {detail?.num !== undefined && detail?.num !== null
                  ? String(detail.num)
                  : '-'}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装地址</Text>
              <Text style={styles.value}>{detail?.address || '-'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装时间</Text>
              <Text style={styles.value}>{detail?.createTime || '-'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>售后服务</Text>
          <Text style={styles.serviceText}>
            本次安装享受180天质保，如有任何非人为损坏的质量问题，请随时联系我。
          </Text>
          <View style={styles.card}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>安装人</Text>
              <Text style={styles.value}>{detail?.installUsername || '-'}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>联系电话</Text>
              <Text style={styles.value}>
                {detail?.installUserMobile || '-'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>后续操作请您配合</Text>
          <View style={styles.operationContainer}>
            {OPERATION_ITEM.map(item => (
              <Text key={item.id} style={styles.operationItemText}>
                {item.title}
              </Text>
            ))}
          </View>
        </ScrollView>
      </View>
    </PageContainer>
  );
}
