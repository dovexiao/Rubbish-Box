import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import IconFont from '@/iconfont';
import { getPickupCodeRecordDetail } from '@/services/mall';
import styles from './styles';

// 状态：1 未填写地址，2 待发货，3 已发货
const formatPickupTime = (time?: string) => {
  if (!time) return '';
  if (time.length >= 16) return time.slice(0, 16);
  return time;
};

type RecordDetail = {
  id?: number | string;
  status?: number;
  productType?: string;
  imageUrl?: string;
  pickupTime?: string;
  orderStatusDesc?: string;
  receiverName?: string;
  receiverMobile?: string;
  receiverAddress?: string;
  expressNo?: string;
  [key: string]: any;
};

const RCV_BG = 'https://g.18qjz.cn/img/boklock/pickupCode/rcvBg.png';
const CARD_IMG = 'https://g.18qjz.cn/img/boklock/pickupCode/card.png';
const STEP_IMG_2 = 'https://g.18qjz.cn/img/boklock/pickupCode/newStep2.png';
const STEP_IMG_3 = 'https://g.18qjz.cn/img/boklock/pickupCode/newStep3.png';
const QR_IMG =
  'https://g.18qjz.cn/img/boklock/pickupCode/custServiceQRCode.png';
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function PickupCodeRecordDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id ?? route.params?.recordId;
  const fromList =
    route.params?.fromList === 1 || route.params?.fromList === '1';
  const idStr = id != null ? String(id) : '';

  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!idStr) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getPickupCodeRecordDetail({
        id: /^\d+$/.test(idStr) ? Number(idStr) : idStr,
      } as any);
      if (Number(res?.code) === 200) {
        const data = (
          res.data || res.data === null ? res.data : {}
        ) as RecordDetail;
        setDetail(data || null);
      } else {
        Toast.fail(res?.message || res?.msg || '获取详情失败');
        navigation.goBack();
      }
    } catch (e) {
      Toast.fail('获取详情失败');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [idStr, navigation]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleCopyExpressNo = useCallback(async () => {
    const expressNo = detail?.expressNo || '';
    if (!expressNo) return;
    try {
      await Share.share({
        message: expressNo,
        title: '快递单号',
      });
      Toast.success('已分享快递单号');
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Toast.fail('复制失败，请手动复制');
      }
    }
  }, [detail?.expressNo]);

  if (loading) {
    return (
      <PageContainer
        statusBarStyle="light-content"
        statusBarBackgroundColor="transparent"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '领取详情',
          showBack: true,
          background: 'transparent',
          titleColor: '#fff',
        }}
      >
        <View style={[styles.container, styles.emptyContainer]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </PageContainer>
    );
  }

  // 无 id 或接口未返回数据：展示空状态
  if (!idStr || !detail?.id) {
    return (
      <PageContainer
        backgroundColor="#F8F7FC"
        statusBarStyle="dark-content"
        statusBarBackgroundColor="#FFFFFF"
        safeAreaEdges={['top', 'bottom']}
        scrollable={true}
        pageNavProps={{
          text: '领取详情',
          showBack: true,
          background: '#FFFFFF',
        }}
      >
        <View style={[styles.content, styles.emptyContainer]}>
          <Image
            source={{ uri: EMPTY_IMG }}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>暂无收货地址需要填写</Text>
        </View>
      </PageContainer>
    );
  }

  const status = detail.status ?? 1;
  const pickupTime = formatPickupTime(detail.pickupTime);
  const stepImg = status === 1 ? STEP_IMG_2 : STEP_IMG_3;

  return (
    <PageContainer
      backgroundColor="transparent"
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent"
      safeAreaEdges={['top', 'bottom']}
      scrollable={true}
      pageNavProps={{
        text: '领取详情',
        showBack: true,
        background: 'transparent',
        titleColor: '#fff',
      }}
      backgroundImage={{ uri: RCV_BG }}
      backgroundImageHeight={400}
    >
      <View style={styles.content}>
        <View style={styles.stepImageContent}>
          <Image
            source={{ uri: stepImg }}
            style={styles.stepImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.innerContent}>
          <View style={styles.cardImgWrapper}>
            <Image
              source={{ uri: CARD_IMG }}
              style={styles.cardImg}
              resizeMode="stretch"
            />
            <View style={styles.cardInfo}>
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <IconFont name="star" color="#283E77" size={20} />
                  <Text style={styles.cardInfoText}>领取一台地锁</Text>
                  <IconFont name="star" color="#283E77" size={20} />
                </View>
                <Text style={styles.cardTimeText}>{pickupTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {fromList ? (
          <View style={styles.infoContent}>
            {status !== 1 && (
              <View style={styles.infoBox}>
                <View style={styles.row}>
                  <Text style={styles.label}>收货地址</Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.value}>
                      {[detail.receiverName, detail.receiverMobile]
                        .filter(Boolean)
                        .join(' ')}
                    </Text>
                    <Text
                      style={[styles.value, styles.addressValue]}
                      numberOfLines={4}
                    >
                      {detail.receiverAddress || ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>发货状态</Text>
                  <Text style={[styles.value, { flex: 1 }]}>
                    {status === 2
                      ? '我们会尽快安排发货，\n感谢您的耐心等候！'
                      : status === 3
                      ? '已发货'
                      : ''}
                  </Text>
                </View>
                {status === 3 && detail.expressNo ? (
                  <View style={[styles.row, styles.expressRow]}>
                    <Text style={styles.label}>快递单号</Text>
                    <Text style={styles.expressNoText} numberOfLines={1}>
                      {detail.expressNo}
                    </Text>
                    <TouchableOpacity
                      style={styles.copyIconWrap}
                      onPress={handleCopyExpressNo}
                      activeOpacity={0.8}
                    >
                      <IconFont name="copy1" color="#999999" size={18} />
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            <View style={styles.qrCodeContent}>
              <Image
                source={{ uri: QR_IMG }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
              <Text style={styles.qrCodeContentText}>
                发货及预约安装请添加客服企业微信
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.infoContent}>
            <View style={styles.qrCodeContent}>
              <Image
                source={{ uri: QR_IMG }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
              <Text style={styles.qrCodeContentText}>
                发货及预约安装请添加客服企业微信
              </Text>
            </View>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
