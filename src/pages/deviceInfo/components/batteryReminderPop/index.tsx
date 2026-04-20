import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AppIcon from '@/components/AppIcon';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';
import Video from 'react-native-video';
import { styles } from './style';
import { showToast } from '@/utils';
import { Popup } from '@/components';
import { px } from '@/utils/ui';

export type BatteryReminderPopRef = {
  open: () => void;
  close: () => void;
};

export interface BatteryReminderPopProps {
  defaultDetails: any;
  refresh?: () => void;
}

const POSTER_URL = 'https://g.18qjz.cn/img/boklock/deviceChargingPoster.png';
const VIDEO_URL =
  'https://g.18qjz.cn/img/boklock/deviceChargingVideo_compatible.mp4';

export const BatteryReminderPop = forwardRef<
  BatteryReminderPopRef,
  BatteryReminderPopProps
>(function BatteryReminderPopInner(_props, ref) {
  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [videoKey, setVideoKey] = useState(0);

  const [visible, setVisible] = useState(false);
  const videoRef = useRef<any>(null);

  const resetVideo = useCallback(() => {
    setShowPlayBtn(true);
    setPaused(true);
    setIsFullScreen(false);
    setVideoKey(k => k + 1);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        resetVideo();
        setVisible(true);
      },
      close: () => {
        setVisible(false);
      },
    }),
    [resetVideo],
  );

  return (
    <Popup
      visible={visible}
      showClose={false}
      onClose={() => {
        resetVideo();
      }}
    >
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={styles.headerTitle}>充电指导</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.8}
          onPress={handleClose}
        >
          <AppIcon name="close" size={px(24)} color="#999999" />
        </TouchableOpacity>
      </View>

      <View style={styles.popupContainer}>
        <View style={styles.videoWrap}>
          <Video
            key={videoKey}
            ref={videoRef}
            source={{ uri: VIDEO_URL }}
            paused={paused}
            // controls={!showPlayBtn}
            controls={false}
            poster={POSTER_URL}
            posterResizeMode="cover"
            // resizeMode={isFullScreen ? 'contain' : 'cover'}
            resizeMode={'contain'}
            onEnd={() => {
              resetVideo();
            }}
            onError={() => {
              showToast({ title: '视频加载失败', icon: 'info' });
              resetVideo();
            }}
            onFullscreenPlayerDidPresent={() => {
              setIsFullScreen(true);
            }}
            onFullscreenPlayerDidDismiss={() => {
              setIsFullScreen(false);
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
    </Popup>
  );
});
