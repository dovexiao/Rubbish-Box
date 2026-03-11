import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer, Flex } from '@/components';
import { getRepairDetail } from '@/services/user';
import styles from './styles';
import { showToast } from '@/utils';
import dayjs from 'dayjs';

type ProgressItem = {
  progress: number;
  progressName: string;
  operateTime: string;
  personnelInfo?: string;
};

type DetailData = {
  id: number;
  repairNo: string;
  reportTime: string;
  completionTime?: string;
  lockName: string;
  lockId: string;
  deviceNo?: string;
  problemDescription: string;
  progressList: ProgressItem[];
  repairProgress: number;
  repairProgressName: string;
};

export default function MaintainServiceDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id;

  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (id == null) {
      showToast('参数错误');
      return;
    }
    setLoading(true);
    try {
      const res = await getRepairDetail(Number(id));
      if (Number(res?.code) === 200) {
        const data = (res as any).data || res;
        const progressList = Array.isArray(data?.progressList)
          ? [...data.progressList].reverse()
          : [];
        setDetail({ ...data, progressList });
      } else {
        showToast(res.message);
      }
    } catch (e) {
      showToast((e as any).message);
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <PageContainer
        statusBarStyle="dark-content"
        statusBarBackgroundColor="#FFFFFF"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '服务单详情',
          showBack: true,
          background: '#FFFFFF',
        }}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#333333" />
        </View>
      </PageContainer>
    );
  }

  // if (!detail) return null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={true}
      pageNavProps={{
        text: '服务单详情',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.toastText}>基本信息</Text>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>服务单状态</Text>
          <Text style={styles.infoItemTextRight}>
            {detail?.repairProgressName ?? ''}
          </Text>
        </Flex>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>服务号</Text>
          <Text style={styles.infoItemTextRight}>{detail?.repairNo ?? ''}</Text>
        </Flex>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>提交时间</Text>
          <Text style={styles.infoItemTextRight}>
            {detail?.reportTime
              ? dayjs(detail?.reportTime).format('YYYY-MM-DD HH:mm')
              : '-'}
          </Text>
        </Flex>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>完工时间</Text>
          <Text style={styles.infoItemTextRight}>
            {detail?.completionTime
              ? dayjs(detail?.completionTime).format('YYYY-MM-DD HH:mm')
              : '未完工'}
          </Text>
        </Flex>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>设备名称</Text>
          <Text style={styles.infoItemTextRight}>{detail?.lockName ?? ''}</Text>
        </Flex>
        <Flex style={styles.infoItem} justify="between" align="center">
          <Text style={styles.infoItemText}>地锁SN码</Text>
          <Text style={styles.infoItemTextRight}>{detail?.lockId ?? ''}</Text>
        </Flex>
        <Flex
          style={styles.descriptInfo}
          justify="between"
          align="center"
          direction="row"
        >
          <Text style={styles.infoItemText}>描述</Text>
          <Text style={styles.descriptionText}>
            {detail?.problemDescription ?? ''}
          </Text>
        </Flex>

        <Text style={[styles.toastText, styles.marginSetting]}>服务进度</Text>
        {detail?.progressList?.map((item: ProgressItem, index: number) => (
          <Flex
            key={index}
            direction="row"
            justify="between"
            style={{ marginBottom: 32, minHeight: 40 }}
          >
            <View style={{ alignItems: 'center' }}>
              <View
                style={[
                  styles.circle,
                  item.progress == detail.progressList.length &&
                    styles.blackColor,
                ]}
              />
              {item.progress !== 1 && <View style={styles.line} />}
            </View>
            <Flex direction="column" style={styles.pedding}>
              <Text style={styles.infoItemText}>{item.progressName}</Text>
              {item.progress === 2 && item.personnelInfo ? (
                <Text style={styles.time}>{item.personnelInfo}</Text>
              ) : null}
            </Flex>
            <Text style={styles.time}>
              {item.operateTime
                ? dayjs(item.operateTime).format('YYYY-MM-DD HH:mm')
                : '-'}
            </Text>
          </Flex>
        ))}
      </ScrollView>
    </PageContainer>
  );
}
