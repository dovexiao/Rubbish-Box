import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import { loopFunc, showToast } from '@/utils';
import { px } from '@/utils/ui';
import { styles } from './style';
import { getDeviceKeyResponse, getLockInfo } from '@/services';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const DEFAULT_POSTER_URL =
  'https://g.18qjz.cn/img/boklock/deviceChargingPoster.png';
const DEFAULT_VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/setting/connectBluetooth_720.mp4';

export default function RemoteKeyUnbind() {
  const { params } = useRoute<any>() as {
    params?: { deviceNo?: string; key?: string; id?: number };
  };
  const navigation = useAppNavigation();
  const popConfirmRef = useRef<PopConfirmRef>(null);
  const videoRef = useRef<any>(null);

  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [videoKey, setVideoKey] = useState(0);
  const [canUnbind, setCanUnbind] = useState(false);
  const [keys, setKeys] = useState<string>('');

  const videoUrl = DEFAULT_VIDEO_URL;
  const posterUrl = DEFAULT_POSTER_URL;

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setVideoKey(k => k + 1);
  }, []);

  const handleUnbind = async () => {
    const res: any = await getLockInfo({ id: params?.id });
    if (res?.code === 200 && res?.success) {
      const phoneNumber = res?.data?.adminMobile;

      navigation.navigate('UnbindDevice', {
        deviceNo: params?.deviceNo,
        key: params?.key,
        phoneNumber,
        type: 'remoteKey',
      });
    }
  };

  const disableUnbind = useMemo(() => !canUnbind, [canUnbind]);

  useFocusEffect(
    useCallback(() => {
      const deviceNo = params?.deviceNo;
      const key = params?.key;
      if (!deviceNo || !key) return;

      setCanUnbind(false);

      const { start, stop } = loopFunc(async () => {
        try {
          const res = await getDeviceKeyResponse({
            deviceNo,
            key,
          });
          if (res.code === 200 && res.success && res.data) {
            setCanUnbind(true);
            setKeys(res.data);
            return false;
          }
        } catch (e) {
          console.error('getDeviceKeyResponse error:', e);
        }
        return true;
      }, 1000);

      start();
      return () => stop();
    }, [params?.deviceNo, params?.key]),
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      navBorder
      pageNavProps={{
        text: '解绑',
        showBack: true,
      }}
      scrollable={false}
    >
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { marginTop: px(24) }]}>
          遥控钥匙解绑视频
        </Text>
        <View style={styles.videoWrap}>
          <Video
            key={videoKey}
            ref={videoRef}
            source={{ uri: videoUrl }}
            paused={paused}
            controls={false}
            poster={posterUrl}
            posterResizeMode="cover"
            resizeMode="cover"
            onEnd={resetVideo}
            onError={() => {
              showToast({ title: '视频加载失败', icon: 'info' });
              resetVideo();
            }}
            style={styles.video}
          />
          {showPlayBtn ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.playOverlay}
              onPress={() => {
                setShowPlayBtn(false);
                setPaused(false);
              }}
            >
              <View style={styles.playCircle}>
                <AppIcon name="play" size={px(48)} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.noticeSection}>
          <Text style={styles.sectionTitle}>解除绑定须知</Text>
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              地锁解除遥控钥匙后，将无法使用遥控钥匙控制地锁升降
            </Text>
          </View>
        </View>

        <View style={styles.footerWrap}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.unbindBtn,
              disableUnbind ? styles.unbindBtnDisabled : {},
            ]}
            onPress={handleUnbind}
          >
            <Text style={styles.unbindBtnText}>
              {disableUnbind ? '解绑' : `解绑${keys}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
