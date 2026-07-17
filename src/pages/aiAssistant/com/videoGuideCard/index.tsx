import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import MarkdownView from '@/components/MarkdownView';
import AppIcon from '@/components/AppIcon';
import { showToast } from '@/utils';
import { VideoGuideMessage } from '../../typing';
import { getPageTypeConfig } from '../../constants';
import { px } from '@/utils/ui';
import styles from './styles';

interface Props {
  data: VideoGuideMessage;
}

export default function VideoGuideCard({ data }: Props) {
  const pageConfig = getPageTypeConfig(data.pageType);
  const videoUrl = data.videoUrl || pageConfig?.videoUrl || '';
  const posterUrl = data.posterUrl || pageConfig?.imgUrl || '';
  const [showPlayBtn, setShowPlayBtn] = useState(true);
  const [paused, setPaused] = useState(true);
  const [showPoster, setShowPoster] = useState(true);

  const handlePlay = () => {
    setPaused(false);
    setShowPlayBtn(false);
    setShowPoster(true);
  };

  return (
    <View style={styles.messageRow}>
      <View style={styles.card}>
        <MarkdownView content={data.intro || '充电指导'} style={styles.title} />
        {videoUrl ? (
          <View style={styles.videoWrap}>
            <Video
              source={{ uri: videoUrl }}
              style={styles.video}
              controls={!showPlayBtn}
              paused={paused}
              resizeMode="cover"
              onLoadStart={() => {
                setShowPoster(true);
              }}
              onReadyForDisplay={() => {
                if (!paused) {
                  setShowPoster(false);
                }
              }}
              onError={() => {
                showToast({ title: '视频加载失败', icon: 'none' });
              }}
            />
            {showPoster ? (
              <Image
                source={{ uri: posterUrl }}
                resizeMode="cover"
                style={styles.poster}
              />
            ) : null}
            {showPlayBtn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.playOverlay}
                onPress={handlePlay}
              >
                <View style={styles.playBtn}>
                  <AppIcon
                    name="a-Videoguidance"
                    size={px(24)}
                    color="#ffffff"
                  />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
