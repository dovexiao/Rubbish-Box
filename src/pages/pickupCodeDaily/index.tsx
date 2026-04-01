import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ActionSheet } from '@ant-design/react-native';
import { PageContainer, Flex, Popup } from '@/components';
import PopConfirm from '@/components/popConfirm';
import GradientButton from '@/components/GradientButton';
import AppIcon from '@/components/AppIcon';
import {
  confirmPickupCode,
  getPickupCodeDetail,
  ocrPickupCode,
} from '@/services/mall';
import {
  getStorage,
  removeStorage,
  showLoading,
  hideLoading,
  showToast,
  tencentUpload,
} from '@/utils';
import styles from './styles';

export default function PickupCodeDaily() {
  const navigation = useNavigation<any>();
  const confirmRef = useRef<any>(null);

  const [pickupCode, setPickupCode] = useState('');
  const [deviceImg, setDeviceImg] = useState('');
  const [channelQrUrl, setChannelQrUrl] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  // 页面显示时检查是否有扫码或跳转传入的卡密
  useEffect(() => {
    const loadCode = async () => {
      try {
        const scanRes = await getStorage({
          key: 'PICKUP_CODE_FROM_SCAN',
        }).catch(() => null);
        if (scanRes) {
          setPickupCode(scanRes);
          await removeStorage({ key: 'PICKUP_CODE_FROM_SCAN' }).catch(() => {});
          return;
        }
      } catch {}

      try {
        const jumpRes = await getStorage({ key: 'pickupCodeJump' }).catch(
          () => null,
        );
        const path = (jumpRes as any)?.path as string | undefined;
        if (path) {
          const match = path.match(/[?&]pk=([^&]+)/);
          const encodedPk = match && match[1];
          if (encodedPk) {
            setPickupCode(decodeURIComponent(encodedPk));
          }
          await removeStorage({ key: 'pickupCodeJump' }).catch(() => {});
        }
      } catch {}
    };
    void loadCode();
  }, []);

  // 获取卡密详情
  const handleGetCodeDetail = useCallback(async () => {
    const code = pickupCode.trim();
    if (!code) {
      showToast({ title: '请输入卡密', icon: 'info' });
      return false;
    }

    try {
      const res = await getPickupCodeDetail({ pickupCode: code });
      if (res.code === 200 && res.success) {
        setDeviceImg(res.data?.imageUrl || '');
        setChannelQrUrl(res.data?.channelQrUrl || '');
        return true;
      }
      showToast({
        title: res.msg || res.message || '卡密无效，请检查后重试',
        icon: 'info',
      });
      return false;
    } catch {
      showToast({ title: '网络异常，请稍后重试', icon: 'info' });
      return false;
    }
  }, [pickupCode]);

  // 确认领取
  const handleConfirmPickup = useCallback(async () => {
    const code = pickupCode.trim();
    if (!code) {
      showToast({ title: '请输入卡密', icon: 'info' });
      return false;
    }

    try {
      const res = await confirmPickupCode({ pickupCode: code });
      if (res.code === 200 && res.success) {
        return true;
      }
      showToast({
        title: res.msg || res.message || '领取失败，请稍后重试',
        icon: 'info',
      });
      return false;
    } catch {
      showToast({ title: '领取失败，请稍后重试', icon: 'info' });
      return false;
    }
  }, [pickupCode]);

  const handleSubmit = useCallback(async () => {
    const ok = await handleGetCodeDetail();
    if (ok) {
      confirmRef.current?.open();
    }
  }, [handleGetCodeDetail]);

  const handleConfirm = useCallback(async () => {
    const ok = await handleConfirmPickup();
    confirmRef.current?.close();
    if (ok) {
      setPickupCode('');
      setSuccessVisible(true);
    }
  }, [handleConfirmPickup]);

  // 识别图片中的卡密（上传 + OCR，拍照与相册共用）
  const processImageUri = useCallback(async (uri: string) => {
    let toastMsg = '';
    try {
      showLoading({ title: '识别中...' });

      const uploadRes: any = await tencentUpload({
        file: uri,
        filename: uri.split('/').pop() || `pickup-${Date.now()}.jpg`,
        index: 0,
      });
      const location =
        uploadRes?.data?.Location || uploadRes?.data?.location || '';
      const uploadUrl = location
        ? `https://${location.replace(/^https?:\/\//, '')}`
        : '';
      if (!uploadUrl) {
        toastMsg = '上传失败，请重试';
        return;
      }

      const ocrRes: any = await ocrPickupCode({ url: uploadUrl });
      const code = ocrRes?.data?.pickupCode;

      if (ocrRes?.success && Number(ocrRes?.code) === 200) {
        if (code) {
          setPickupCode(code);
        } else {
          toastMsg = '未识别到卡密';
        }
        return;
      }
      const errorMsg =
        (ocrRes && (ocrRes.message || ocrRes.msg)) || '识别失败，请手动输入';
      toastMsg = errorMsg;
    } catch (error: any) {
      if (
        error?.errMsg &&
        typeof error.errMsg === 'string' &&
        error.errMsg.includes('cancel')
      ) {
        return;
      }
      toastMsg = '识别失败，请重试';
    } finally {
      hideLoading();
      if (toastMsg) {
        showToast({ title: toastMsg, icon: 'info' });
      }
    }
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '需要相机权限',
          message: '用于拍照识别卡密',
          buttonPositive: '允许',
          buttonNegative: '拒绝',
          buttonNeutral: '稍后',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }, []);

  const handleScan = useCallback(() => {
    ActionSheet.showActionSheetWithOptions(
      {
        title: '',
        options: ['拍照', '从相册选择', '取消'],
        cancelButtonIndex: 2,
      },
      async index => {
        if (index === 2 || index === undefined) return; // 取消
        if (index === 0) {
          const ok = await ensureCameraPermission();
          if (!ok) {
            showToast({ title: '未获得相机权限', icon: 'info' });
            return;
          }
          launchCamera(
            { mediaType: 'photo', quality: 0.8, saveToPhotos: false },
            res => {
              if (res.didCancel) return;
              if (res.errorCode || res.errorMessage) {
                showToast({
                  title: res.errorMessage || '拍照失败',
                  icon: 'info',
                });
                return;
              }
              const uri = res.assets?.[0]?.uri;
              if (uri) void processImageUri(uri);
              else showToast({ title: '未获取到图片', icon: 'info' });
            },
          );
          return;
        }
        if (index === 1) {
          launchImageLibrary(
            {
              mediaType: 'photo',
              selectionLimit: 1,
              quality: 0.8,
            },
            res => {
              if (res.didCancel) return;
              if (res.errorCode || res.errorMessage) {
                showToast({
                  title: res.errorMessage || '选择失败',
                  icon: 'info',
                });
                return;
              }
              const uri = res.assets?.[0]?.uri;
              if (uri) void processImageUri(uri);
              else showToast({ title: '未获取到图片', icon: 'info' });
            },
          );
        }
      },
    );
  }, [ensureCameraPermission, processImageUri]);

  const handleRecord = useCallback(() => {
    navigation.navigate('PickupCodeRecordList');
  }, [navigation]);

  const canSubmit = pickupCode.trim().length === 19;

  const qrSrc =
    channelQrUrl ||
    'https://g.18qjz.cn/img/boklock/pickupCode/custServiceQRCode.png';

  return (
    <PageContainer
      backgroundColor="transparent"
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent"
      safeAreaEdges={['top', 'bottom']}
      scrollable
      pageNavProps={{
        text: '绑定礼品卡',
        showBack: true,
        background: 'transparent',
        titleColor: '#FFFFFF',
      }}
      backgroundImageHeight={400}
      backgroundImage={{
        uri: 'https://g.18qjz.cn/img/boklock/pickupCode/rcvBg2.png',
      }}
    >
      <Flex direction="column" justify="between" style={styles.container}>
        <View style={styles.headerImageWrap}>
          <Image
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/pickupCode/pickupCodeBg.png',
            }}
            style={styles.headerImage}
          />
        </View>

        <Flex
          style={styles.contentCard}
          direction="column"
          align="center"
          justify="between"
        >
          <View style={{ width: '100%' }}>
            <Text style={styles.dailyTitle}>卡密绑定</Text>
            <Text style={styles.dailyTips}>
              输入礼品卡密码（扫码可自动填充）
            </Text>

            <View style={styles.rowLabel}>
              <Text style={styles.rowLabelText}>卡密</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={handleScan}>
                <AppIcon name="a-scanQRcodes1" color="#333333" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.codeInputBox}>
              <TextInput
                value={pickupCode}
                onChangeText={setPickupCode}
                placeholder="请输入卡密"
                placeholderTextColor="#CCCCCC"
                maxLength={19}
                style={styles.codeInput}
                autoCapitalize="characters"
              />
            </View>

            <GradientButton
              colors={
                canSubmit ? ['#333333', '#333333'] : ['#EEEEEE', '#EEEEEE']
              }
              width={196}
              height={48}
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text
                style={[
                  styles.submitBtnText,
                  !canSubmit && { color: '#666666' },
                ]}
              >
                绑定领取
              </Text>
            </GradientButton>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.recordBtn}
              onPress={handleRecord}
            >
              <Text style={styles.recordBtnText}>绑定记录</Text>
              <AppIcon name="a-nextpage" color="#333333" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>绑卡说明：</Text>
            <Text style={styles.tipsItem}>
              1、扫码绑卡，即可兑换泊刻地锁一台。
            </Text>
            <Text style={styles.tipsItem}>
              2、本卡为不记名兑换卡，不挂失、不计息、不兑现金。
            </Text>
            <Text style={styles.tipsItem}>
              3、提交后，客服将联系您确认配送与安装事宜。
            </Text>
            <Text style={styles.tipsItem}>
              4、每人限兑一次，违规获取或使用将被取消权益。
            </Text>
            <Text style={styles.tipsItem}>
              注：如有疑问，请致电泊刻客服：400-097-8660。
            </Text>
            <Text style={styles.tipsItem}>
              本活动最终解释权归新腔科技所有。
            </Text>
          </View>
        </Flex>
      </Flex>

      {/* 确认领取弹窗 */}
      <PopConfirm
        ref={confirmRef}
        title={
          <Flex direction="column" align="center" justify="center">
            <Text style={styles.popupTitle}>确认要领取吗？</Text>
            {deviceImg ? (
              <View style={styles.deviceImgBox}>
                <Image
                  source={{ uri: deviceImg }}
                  style={styles.deviceImage}
                  resizeMode="contain"
                />
                <Flex direction="row" align="end" style={styles.numBox}>
                  <Text style={styles.numBoxText}>x</Text>
                  <Text style={styles.numBoxText2}>1</Text>
                </Flex>
              </View>
            ) : null}
          </Flex>
        }
        cancelText="取消"
        confirmText="确定领取"
        onConfirm={handleConfirm}
      />

      {/* 领取成功弹窗 */}
      <Popup
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="恭喜您领取成功"
        minHeight={420}
      >
        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ width: '100%' }}
          >
            {deviceImg ? (
              <View style={styles.deviceImgBox}>
                <Image
                  source={{ uri: deviceImg }}
                  style={styles.deviceImage}
                  resizeMode="contain"
                />
                <Flex direction="row" align="end" style={styles.numBox}>
                  <Text style={styles.numBoxText}>x</Text>
                  <Text style={styles.numBoxText2}>1</Text>
                </Flex>
              </View>
            ) : null}

            <View style={styles.qrCodeContent}>
              <Image
                source={{ uri: qrSrc }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
              <Text style={styles.qrCodeContentText}>
                发货及预约安装请添加客服企业微信
              </Text>
            </View>
          </Flex>
        </View>
      </Popup>
    </PageContainer>
  );
}
