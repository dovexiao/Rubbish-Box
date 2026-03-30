import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex, Popup } from '@/components';
import PopConfirm from '@/components/popConfirm';
import GradientButton from '@/components/GradientButton';
import AppIcon from '@/components/AppIcon';
import { getPickupCodeDetail, confirmPickupCode } from '@/services/mall';
import { getStorage, removeStorage, showToast } from '@/utils';
import styles from './styles';

export default function PickupCode() {
  const navigation = useNavigation<any>();
  const confirmRef = useRef<any>(null);

  const [pickupCode, setPickupCode] = useState('');
  const [deviceImg, setDeviceImg] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  // 页面显示时检查是否有扫码或跳转传入的提货码
  useEffect(() => {
    const loadCode = async () => {
      try {
        // 检查扫码传入的提货码
        const scanRes = await getStorage({ key: 'PICKUP_CODE_FROM_SCAN' });
        if (scanRes) {
          setPickupCode(scanRes);
          await removeStorage({ key: 'PICKUP_CODE_FROM_SCAN' });
          return;
        }

        // 检查跳转传入的提货码
        const jumpRes = await getStorage({ key: 'pickupCodeJump' });
        if (jumpRes?.path) {
          const path = jumpRes.path as string;
          const match = path.match(/[?&]pk=([^&]+)/);
          const encodedPk = match && match[1];
          if (encodedPk) {
            setPickupCode(decodeURIComponent(encodedPk));
          }
          await removeStorage({ key: 'pickupCodeJump' });
        }
      } catch (e) {
        // 忽略错误
      }
    };
    void loadCode();
  }, []);

  // 获取提货码详情
  const handleGetCodeDetail = useCallback(async () => {
    const code = pickupCode.trim();
    if (!code) {
      showToast('请输入提货码');
      return false;
    }

    try {
      const res = await getPickupCodeDetail({ pickupCode: code });
      if (res.code === 200 && res.success) {
        setDeviceImg(res.data?.imageUrl || '');
        return true;
      }
      showToast(res.msg || res.message || '提货码无效，请检查后重试');
      return false;
    } catch (e: any) {
      showToast('网络异常，请稍后重试');
      return false;
    }
  }, [pickupCode]);

  // 确认领取
  const handleConfirmPickup = useCallback(async () => {
    const code = pickupCode.trim();
    if (!code) {
      showToast('请输入提货码');
      return false;
    }

    try {
      const res = await confirmPickupCode({ pickupCode: code });
      if (res.code === 200 && res.success) {
        return true;
      }
      showToast(res.msg || res.message || '提货失败，请稍后重试');
      return false;
    } catch (e: any) {
      showToast('提货失败，请稍后重试');
      return false;
    }
  }, [pickupCode]);

  // 立即领取
  const handleSubmit = useCallback(async () => {
    const ok = await handleGetCodeDetail();
    if (ok) {
      confirmRef.current?.open();
    }
  }, [handleGetCodeDetail]);

  // 确认领取
  const handleConfirm = useCallback(async () => {
    const ok = await handleConfirmPickup();
    confirmRef.current?.close();
    if (ok) {
      setPickupCode('');
      setSuccessVisible(true);
    }
  }, [handleConfirmPickup]);

  // 扫码填入
  const handleScan = useCallback(() => {
    navigation.navigate('ScanPickupCode');
  }, []);

  // 领取记录
  const handleRecord = useCallback(() => {
    navigation.navigate('PickupCodeRecordList');
  }, [navigation]);

  const canSubmit = pickupCode.trim().length === 19;

  return (
    <PageContainer
      backgroundColor="transparent"
      statusBarStyle="light-content"
      statusBarBackgroundColor="transparent"
      safeAreaEdges={['top', 'bottom']}
      scrollable={true}
      pageNavProps={{
        text: '提货码',
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
        <Flex
          direction="column"
          justify="center"
          align="center"
          style={styles.codeBox}
        >
          <Text style={styles.codeBoxTitle}>
            凭有效提货码可领取一台泊刻地锁
          </Text>

          <View style={styles.codeInput}>
            <TextInput
              value={pickupCode}
              onChangeText={setPickupCode}
              placeholder="请输入提货码，请注意区分大小写！"
              placeholderTextColor="#CCCCCC"
              maxLength={19}
              style={styles.codeInputText}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.scanBox}
            onPress={handleScan}
          >
            <AppIcon name="a-scanQRcodes1" color="#333333" size={16} />
            <Text style={styles.scanBoxText}>扫码填入</Text>
          </TouchableOpacity>

          <GradientButton
            colors={canSubmit ? ['#333333', '#333333'] : ['#EEEEEE', '#EEEEEE']}
            width={196}
            height={48}
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Text
              style={[styles.submitBtnText, !canSubmit && { color: '#666666' }]}
            >
              立即领取
            </Text>
          </GradientButton>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bottomBtn}
            onPress={handleRecord}
          >
            <Text style={styles.bottomBtnText}>领取记录</Text>
            <AppIcon name="a-nextpage" color="#333333" size={16} />
          </TouchableOpacity>
        </Flex>

        <Flex direction="column" style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>提货说明：</Text>
          <Text style={styles.tipsItem}>
            1、凭有效提货码可领取一台泊刻地锁，码到即得。
          </Text>
          <Text style={styles.tipsItem}>
            2、请准确填写收货地址，信息确认后，将由客服人员与您确认发货事宜。
          </Text>
          <Text style={styles.tipsItem}>
            3、严禁通过非正当途径获取或使用提货码。如发现违规行为，平台有权收回地锁并取消相关权益。
          </Text>
        </Flex>
      </Flex>

      {/* 确认领取弹窗 */}
      <PopConfirm
        ref={confirmRef}
        title={
          <Flex direction="column" align="center" justify="center">
            <Text>确认要领取吗？</Text>
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
      ></PopConfirm>

      {/* 领取成功弹窗 */}
      <Popup
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        title="恭喜您领取成功"
        minHeight={420}
      >
        <View style={styles.successContent}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={styles.successContentBox}
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
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/pickupCode/custServiceQRCode.png',
                }}
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
