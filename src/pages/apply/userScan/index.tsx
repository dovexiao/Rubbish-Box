import { showToast, showLoading, hideLoading } from '@/utils';
import { Image, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import {
  PageContainer,
  TextInput,
  Flex,
  GradientButton,
  PopConfirm,
} from '@/components/index';
import AppIcon from '@/components/AppIcon';
import { cacheGet } from '@/utils/cache';
import { updateName } from '@/services/deviceInfo';
import { getLockDeviceList } from '@/services/device';
import styles from './styles';
import { useFocusEffect } from '@react-navigation/core';
import { useRoute, useNavigation } from '@react-navigation/native';
import { lockApplyDetail, lockApplyAudit } from '@/services/device';
import dayjs from 'dayjs';

interface ApplyRecordDetail {
  id: number;
  applyMobile: string;
  applyUserName: string;
  status: number;
  lockName: string;
  lockCount: number;
  validDatetime: string;
  applyReason: string;
  remark: string;
  createTime: string;
  code: string;
  useTime: number;
  applyTime: number;
  imageMap?: {
    upLockPng?: string;
  };
}

export default function ApplyRecordDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const passPopRef = useRef<any>(null);
  const refusePopRef = useRef<any>(null);
  const id = route.params?.id ? String(route.params.id) : '';
  const [rejectRemark, setRejectRemark] = useState<string>('');
  const isAdmin = route.params?.isAdmin
    ? String(route.params.isAdmin) === '1'
    : false;
  const [detail, setDetail] = useState<ApplyRecordDetail | undefined>(
    undefined,
  );

  useFocusEffect(() => {
    getDetail();
  });

  const getDetail = async () => {
    const res: any = await lockApplyDetail({
      id,
    });
    if (res?.code != '200') {
      showToast({ title: res?.message || '获取详情失败', icon: 'none' });
      return;
    }
    setDetail(res.data);
  };

  const onRejectRemarkChange = (t: string) => {
    setRejectRemark(t);
  };

  const onAudit = async (status: 2 | 3) => {
    if (!detail?.id) return;
    if (status === 3 && !rejectRemark?.trim()) {
      showToast({ title: '请输入拒绝原因', icon: 'none' });
      return;
    }
    showLoading({ title: '提交中...' });
    try {
      const res = await lockApplyAudit({
        id: detail.id,
        status,
        remark: status === 3 ? rejectRemark : '',
      });
      if (res?.success) {
        showToast({ title: '审核成功', icon: 'success' });
        setRejectRemark('');
        await getDetail();
      } else {
        showToast({ title: res?.message || '审核失败', icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  };

  return (
    <PageContainer
      safeAreaEdges={['top', 'bottom']}
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#ffffff"
      pageNavProps={{
        text: '申请使用地锁',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      backgroundColor="#ffffff"
    >
      {detail && <ScrollView></ScrollView>}
    </PageContainer>
  );
}
