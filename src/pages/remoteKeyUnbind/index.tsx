import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';
import { styles } from './style';

const DEFAULT_POSTER_URL =
  'https://g.18qjz.cn/img/boklock/deviceChargingPoster.png';
const DEFAULT_VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/setting/connectBluetooth_720.mp4';

export default function RemoteKeyUnbind() {
  const { params } = useRoute<any>() as {
    params?: { lockId?: number; videoUrl?: string; posterUrl?: string };
  };

  const popConfirmRef = useRef<PopConfirmRef>(null);
  const videoRef = useRef<any>(null);

  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [videoKey, setVideoKey] = useState(0);

  const videoUrl = params?.videoUrl || DEFAULT_VIDEO_URL;
  const posterUrl = params?.posterUrl || DEFAULT_POSTER_URL;

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setVideoKey(k => k + 1);
  }, []);

  const handleUnbind = useCallback(() => {
    // TODO: 接入遥控钥匙解绑 API
    showToast({ title: '解绑成功', icon: 'success' });
  }, []);

  const disableUnbind = useMemo(() => {
    return true;
  }, []);

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
            <Text style={styles.unbindBtnText}>解绑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
