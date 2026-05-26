import React, { useCallback, useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';
import { styles } from './style';

const DEFAULT_POSTER_URL =
  'https://g.18qjz.cn/img/boklock/deviceChargingPoster.png';
const DEFAULT_VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/setting/connectBluetooth_720.mp4';

export default function RemoteKeyPairingVideo() {
  const { params } = useRoute<any>() as {
    params?: { lockId?: number; videoUrl?: string; posterUrl?: string };
  };

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

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      navBorder
      pageNavProps={{
        text: '遥控钥匙配对视频',
        showBack: true,
      }}
      scrollable={false}
    >
      <View style={styles.container}>
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
      </View>
    </PageContainer>
  );
}
