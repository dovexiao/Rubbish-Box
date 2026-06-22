import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { px } from '@/utils/ui';
import { GradientButton, TextInput } from '@/components';
import { ActionSheet } from '@ant-design/react-native';
import { hideLoading, showLoading, showToast, tencentUpload } from '@/utils';
import { ocrPickupCode } from '@/services';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export default function AddNetWork() {
  const navigation = useNavigation<any>();
  const [sn, setSn] = useState('');

  const handlePress = () => {
    //  隐藏键盘
    Keyboard.dismiss();
  };

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
          setSn(code);
        } else {
          toastMsg = '未识别到SN码';
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
          message: '用于拍照识别SN码',
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

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarBackgroundColor={'transparent'}
      scrollable={false}
      safeAreaEdges={['top']}
      pageNavProps={{
        text: '新增组合设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.contentBox}>
          <Text style={styles.contentBoxItemTitle}>添加433网关</Text>
          <View style={styles.contentBoxContent}>
            <View style={styles.contentBoxContentTop}>
              <View style={styles.contentBoxContentTopLeft}>
                <Text style={styles.requiredLabel}>*</Text>
                <Text style={styles.contentBoxContentTopTitle}>SN码:</Text>
              </View>
              <TouchableOpacity onPress={handleScan}>
                <AppIcon name="camera1" size={px(20)} color="#333333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.contentBoxContentTopInput}
              placeholder="请输入SN码"
              value={sn}
              onChangeText={setSn}
            />
          </View>
          <GradientButton
            colors={
              sn.length > 0 ? ['#4A4A4A', '#282828'] : ['#999999', '#999999']
            }
            style={styles.footerBtn}
            onPress={async () => {
              navigation.navigate('RcvPaymentRuleEdit');
            }}
          >
            <Text style={styles.footerBtnText}>确定绑定</Text>
          </GradientButton>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
