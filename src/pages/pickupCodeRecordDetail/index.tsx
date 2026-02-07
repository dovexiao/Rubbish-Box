import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Input, PickerView, Toast } from '@ant-design/react-native';
import { Flex, PageContainer, Popup } from '@/components';
import IconFont from '@/iconfont';
import {
  getPickupCodeRecordDetail,
  savePickupCodeAddress,
} from '@/services/mall';
import { regionData, getPickerResultByValues } from '@/utils/regionData';
import styles from './styles';
import GradientButton from '@/components/GradientButton';

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
  let fromList = route.params?.fromList === 1 || route.params?.fromList === '1';

  const idStr = id != null ? String(id) : '';

  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [recvName, setRecvName] = useState('');
  const [recvPhone, setRecvPhone] = useState('');
  const [regionPopupVisible, setRegionPopupVisible] = useState(false);
  const [addressText, setAddressText] = useState('');
  const [pickerValue, setPickerValue] = useState<(string | number)[]>([]);
  const [detailAddress, setDetailAddress] = useState('');

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

  const confirmRegion = useCallback(() => {
    if (!pickerValue || pickerValue.length < 3) {
      Toast.fail('请选择省市区');
      return;
    }
    const data = getPickerResultByValues(regionData, pickerValue);
    if (data.length < 3) {
      Toast.fail('请选择省市区');
      return;
    }
    const province = data[0]?.label || '';
    const cityLabel =
      data[1]?.label === '市辖区' ? province : data[1]?.label || '';
    const county = data[2]?.label || '';
    setAddressText(`${province}${cityLabel}${county}`);
    setRegionPopupVisible(false);
  }, [pickerValue]);

  const canSubmitAddress = useMemo(() => {
    return (
      recvName.trim().length > 0 &&
      recvPhone.trim().length > 0 &&
      addressText.trim().length > 0 &&
      detailAddress.trim().length > 0
    );
  }, [recvName, recvPhone, addressText, detailAddress]);

  const submitAddress = async () => {
    if (!recvName) {
      Toast.show('请输入姓名');
      return;
    }
    if (!recvPhone || !/(1[3-9]\d{9})/.test(recvPhone)) {
      Toast.show('请输入正确的手机号');
      return;
    }
    if (!addressText) {
      Toast.show('请选择地址');
      return;
    }
    if (!detailAddress) {
      Toast.show('请输入详细地址');
      return;
    }
    const code = (detail?.pickupCode || '').trim();
    if (!code) {
      Toast.show('提货码为空，请稍后重试');
      return;
    }
    Toast.loading('提交中...');
    const address = `${addressText} ${detailAddress}`.trim();

    try {
      const res: any = await savePickupCodeAddress({
        pickupCode: code,
        userName: recvName,
        userPhone: recvPhone,
        address,
      });
      Toast.removeAll();
      if (res?.code === '200' || res?.code === 200) {
        Toast.success('提交成功');
        fromList = true;
        await loadDetail();
        return;
      } else {
        const errorMsg = (res && (res.message || res.msg)) || '提交失败';
        Toast.fail(errorMsg);
      }
    } catch (e: any) {
      Toast.removeAll();
      Toast.fail('提交失败');
    }
  };

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
      backgroundImageHeight={310}
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
              <Flex direction="column" justify="center">
                <Flex align="center">
                  <IconFont name="star" color="#283E77" size={10} />
                  <Text style={styles.cardInfoText}>领取一台地锁</Text>
                  <IconFont name="star" color="#283E77" size={10} />
                </Flex>
                <Text style={styles.cardTimeText}>{pickupTime}</Text>
              </Flex>
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

              <View
                style={styles[status == 1 ? 'qrCodeContent' : 'qrCodeContent2']}
              >
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
              {/* <View style={styles.qrCodeContent}>
                <Image
                  source={{ uri: QR_IMG }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
                <Text style={styles.qrCodeContentText}>
                  发货及预约安装请添加客服企业微信
                </Text>
              </View> */}
              <Flex
                align="center"
                style={{
                  marginVertical: 12,
                }}
              >
                <View style={styles.dividingLine}></View>
                <Flex
                  justify="center"
                  style={{
                    marginHorizontal: 32,
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#333333' }}>
                    请填写收货地址
                  </Text>
                </Flex>
                <View style={styles.dividingLine}></View>
              </Flex>
              <Flex style={styles.fillItem} align="center" justify="between">
                <Text style={styles.fillLabel}>姓名</Text>
                <Input
                  style={styles.fillInputContainer}
                  inputStyle={styles.fillInputText}
                  placeholder="请输入"
                  placeholderTextColor="#CCCCCC"
                  value={recvName}
                  onChangeText={setRecvName}
                />
              </Flex>
              <Flex style={styles.fillItem} align="center" justify="between">
                <Text style={styles.fillLabel}>手机号码</Text>
                <Input
                  style={styles.fillInputContainer}
                  inputStyle={styles.fillInputText}
                  type="number"
                  maxLength={11}
                  placeholder="请输入"
                  placeholderTextColor="#CCCCCC"
                  value={recvPhone}
                  onChangeText={setRecvPhone}
                />
              </Flex>
              <Flex
                style={styles.fillItem}
                align="center"
                justify="between"
                isTouchView
                onPress={() => setRegionPopupVisible(true)}
              >
                <Text style={styles.fillLabel}>地址</Text>
                <Flex
                  align="center"
                  style={{ flex: 1, justifyContent: 'flex-end' }}
                >
                  <Text style={styles.fillAddressText}>
                    {addressText || '请选择'}
                  </Text>
                  {!addressText && (
                    <IconFont name="a-headfor-20" size={16} color="#333333" />
                  )}
                </Flex>
              </Flex>
              <Flex style={styles.fillItem} align="center" justify="between">
                <Text style={styles.fillLabel}>详细地址</Text>
                <Input
                  style={styles.fillInputContainer}
                  inputStyle={styles.fillInputText}
                  type="text"
                  placeholder="请输入"
                  placeholderTextColor="#CCCCCC"
                  value={detailAddress}
                  onChangeText={setDetailAddress}
                />
              </Flex>
              <Flex direction="column" style={styles.tipsBox}>
                <Flex>
                  <Text style={styles.tipsTitle}>注意事项：</Text>
                </Flex>
                <Text style={styles.tipsItem}>
                  1、请准确填写收货地址，信息确认后，我们将尽快安排发货,实际以收货为准。
                </Text>
                <Text style={styles.tipsItem}>
                  2、收到地锁后请联系您的专属客服人员，预约上门安装。
                </Text>
              </Flex>
              <Flex justify="between" style={{ marginTop: 17 }}>
                <GradientButton
                  colors={
                    canSubmitAddress
                      ? ['#333333', '#333333']
                      : ['#cccccc', '#cccccc']
                  }
                  width={196}
                  height={48}
                  onPress={() => {
                    if (!canSubmitAddress) return;
                    submitAddress();
                  }}
                >
                  <Text style={styles.submitBtnText}>提交</Text>
                </GradientButton>
              </Flex>
            </View>
          )}
        </View>
      </View>

      {/* 地址选择 */}
      <Popup
        visible={regionPopupVisible}
        onClose={() => setRegionPopupVisible(false)}
        title="请选择省市区"
        minHeight={320}
        footer={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={confirmRegion}
            style={{
              height: 48,
              borderRadius: 24,
              backgroundColor: '#333333',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 24,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 16, color: '#fff' }}>确定</Text>
          </TouchableOpacity>
        }
      >
        <PickerView
          data={regionData}
          cascade
          value={pickerValue}
          onChange={v => setPickerValue(v || [])}
          style={{ height: 280 }}
          itemHeight={50}
          itemStyle={{ padding: 0 }}
        />
      </Popup>
    </PageContainer>
  );
}
