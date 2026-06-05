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
      {detail && (
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.imgBox}>
              <Image
                source={{
                  uri:
                    detail?.imageMap?.upLockPng ||
                    'https://g.18qjz.cn/img/boklock/order_empty.png',
                }}
                style={styles.imgBox_img}
              />
            </View>
            <Text style={styles.lockName}>{detail.lockName}</Text>
            <View style={{ width: '100%', marginTop: 40 }}>
              <Flex align="start" justify="between" style={styles.row}>
                <Text style={styles.label}>申请人信息</Text>
                <Flex direction="column" align="end">
                  <Text style={[styles.text, { marginBottom: 14 }]}>
                    {detail.applyUserName}
                  </Text>
                  <Text style={styles.text}>{detail.applyMobile}</Text>
                </Flex>
              </Flex>
              <Flex align="center" justify="between" style={styles.row}>
                <Text style={styles.label}>降锁次数</Text>
                <Text style={styles.text}>{detail.applyTime}</Text>
              </Flex>
              <Flex align="center" justify="between" style={styles.row}>
                <Text style={styles.label}>降锁截止时间</Text>
                <Text style={styles.text}>
                  {dayjs(detail.validDatetime).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Flex>
              <Flex align="center" justify="between" style={styles.row}>
                <Text style={styles.label}>申请理由</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...styles.text, textAlign: 'right' }}>
                    {detail.applyReason}
                    {/* ? detail.applyReason.split('').join('\u200B')
                      : '-'} */}
                  </Text>
                </View>
              </Flex>
              <Flex align="center" justify="between" style={styles.row}>
                <Text style={styles.label}>申请时间</Text>
                <Text style={styles.text}>
                  {detail.createTime
                    ? dayjs(detail.createTime).format('YYYY-MM-DD HH:mm')
                    : '--'}
                </Text>
              </Flex>
            </View>
            {isAdmin ? (
              <View style={styles.botContent}>
                {detail.status === 3 && (
                  <Text style={styles.reason}>
                    您已拒绝本次申请，原因：{detail?.remark || '--'}
                  </Text>
                )}
                {detail.status === 2 && (
                  <Text style={styles.pass}>您已通过本次申请</Text>
                )}
                {detail.status === 1 && (
                  <Flex
                    style={{ width: '100%' }}
                    direction="column"
                    align="center"
                  >
                    <GradientButton
                      style={{
                        ...styles.button,
                        backgroundColor: '#333333',
                        marginTop: 8,
                      }}
                      onPress={() => {
                        passPopRef.current?.open();
                      }}
                    >
                      <Text style={styles.btnText}>通过</Text>
                    </GradientButton>
                    <GradientButton
                      style={{ ...styles.button }}
                      colors={['#ff2b24', '#ff2b24']}
                      onPress={() => {
                        refusePopRef.current?.open();
                      }}
                    >
                      <Text style={styles.btnText}>拒绝</Text>
                    </GradientButton>
                  </Flex>
                )}
              </View>
            ) : (
              <View style={styles.botContent}>
                {detail.status === 1 && (
                  <Text style={styles.infoText}>待管理员审核</Text>
                )}
                {detail.status === 2 && (
                  <>
                    <Text style={{ ...styles.infoText, color: '#37c22a' }}>
                      已通过本次申请
                    </Text>
                    <GradientButton
                      onPress={() => {
                        if (dayjs().isAfter(dayjs(detail.validDatetime))) {
                          showToast({
                            title: '降锁截止时间已过，无法使用',
                            icon: 'none',
                          });
                          return;
                        }
                        if (detail.useTime >= detail.applyTime) {
                          showToast({
                            title: '降锁次数已用完，请扫码重新申请',
                            icon: 'none',
                          });
                          return;
                        }
                        navigation.navigate('UserScan', { code: detail.code });
                      }}
                      style={{
                        ...styles.button,
                        backgroundColor: '#333333',
                        marginTop: 16,
                      }}
                    >
                      <Text style={styles.btnText}>立即使用</Text>
                    </GradientButton>
                  </>
                )}
                {detail.status === 3 && (
                  <Text style={{ ...styles.reason, marginTop: 32 }}>
                    已拒绝本次申请，原因：{detail?.remark || '--'}
                  </Text>
                )}
              </View>
            )}
            <PopConfirm
              ref={passPopRef}
              title="确定通过本次申请？"
              onCancel={() => {
                passPopRef.current?.close();
              }}
              onConfirm={async () => {
                passPopRef.current?.close();
                await onAudit(2);
              }}
            />
            <PopConfirm
              ref={refusePopRef}
              title="确定拒绝本次申请吗？"
              onCancel={() => {
                refusePopRef.current?.close();
              }}
              onConfirm={async () => {
                refusePopRef.current?.close();
                await onAudit(3);
              }}
            >
              <Flex direction="column">
                <Text style={{ fontSize: 14, color: '#333333', marginTop: 12 }}>
                  拒绝原因
                </Text>
                <TextInput
                  style={styles.textArea}
                  multiline={true}
                  placeholder="请输入"
                  defaultValue={rejectRemark}
                  onChangeText={onRejectRemarkChange}
                  maxLength={100}
                />
              </Flex>
            </PopConfirm>
          </View>
        </ScrollView>
      )}
    </PageContainer>
  );
}
