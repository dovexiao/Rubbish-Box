import WebTouchableOpacity, {
  NativeTouchableOpacity,
} from '@basicComponents/touchable-opacity';
import {useModal} from '@basicComponents/modal';
import React, {useState} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import theme from '@style';
import LazyImage, {LazyImageBackground} from '@basicComponents/image';
import Text from '@basicComponents/text';
import Clipboard from '@react-native-clipboard/clipboard';
import {Tooltip} from '@rneui/themed';
import globalStore from '@/services/global.state';

const closeIcon = require('@assets/icons/home/button-close.png');
// const progressBgIcon = require('@assets/icons/home/button-close.png');
// const progressIcon = require('@assets/icons/home/button-close.png');
const questionIcon = require('@assets/icons/about-w.webp');

const TouchableOpacity = globalStore.isWeb
  ? WebTouchableOpacity
  : NativeTouchableOpacity;

export interface LotteryInfo {
  /** 当前Claimed的值 */
  current: number;
  /** 所需Claimed的值 */
  total: number;
  /** 背景图，外部传入；如果没有说明你要登录才能用 */
  backgroundUrl: string;
  toolTipContent: string;
  shareUrl: string;
}

export function useLotteryModal(copiedCallback: () => void) {
  const [backgroundUrl, setBackgroundUrl] = useState<string>();
  // 当前Claimed的值
  const [current, setCurrent] = useState<number>(0);
  // 所需Claimed的值
  const [total, setTotal] = useState<number>(5);
  const [tooltipList, setTooltipList] = useState<string[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  const styles = StyleSheet.create({
    progressArea: {
      bottom: 70,
      zIndex: 1,
    },
    progress: {
      top: 0,
      left: 0,
    },
    bgView: {
      width: 366,
      height: 387,
    },
    tooltip: {
      height: 'auto',
    },
    claimeds: {
      top: -265,
      right: 30,
      zIndex: 1,
    },
    question: {
      top: -265,
      right: 5,
      zIndex: 1,
    }
  });

  const copy = () => {
    // 写复制
    Clipboard.setString(shareUrl);

    copiedCallback();
    hide();
  };

  const {renderModal, show, hide} = useModal(
    <View style={[theme.position.rel, theme.flex.col, theme.flex.centerByCol]}>
      <Pressable onPress={copy}>
        <LazyImageBackground
          occupancy={'transparent'}
          width={320}
          height={435}
          radius={12}
          imageUrl={backgroundUrl}>
          <View
            style={[
              theme.position.abs,
              theme.flex.row,
              theme.flex.end,
              theme.flex.centerByCol,
              theme.padding.lrm,
              styles.progressArea,
              theme.fill.fillW,
            ]}>
            <Text
              fontSize={13}
              style={[theme.font.white, theme.font.bold, theme.margin.rightm, theme.position.abs, styles.claimeds]}>
              Claimed:{current}/{total}
            </Text>
            {/* <LazyImageBackground
              occupancy={'transparent'}
              imageUrl={progressBgIcon}
              width={129}
              height={13}
              style={[theme.margin.rightm, theme.position.rel]}>
              <LazyImageBackground
                occupancy={'transparent'}
                width={(129 * current) / total}
                height={13}
                imageUrl={progressIcon}
                style={[theme.position.abs]}
              />
            </LazyImageBackground> */}
            <Tooltip
              visible={tooltipVisible}
              onOpen={() => setTooltipVisible(true)}
              onClose={() => setTooltipVisible(false)}
              backgroundColor={theme.basicColor.white}
              skipAndroidStatusBar={true}
              width={280}
              containerStyle={[
                styles.tooltip,
                theme.flex.col,
                theme.flex.alignStart,
              ]}
              popover={
                <View
                  style={[
                    theme.flex.col,
                    theme.flex.alignStart,
                    theme.padding.l,
                  ]}>
                  {tooltipList.map((text, index) => (
                    <Text
                      fontSize={14}
                      key={index}
                      style={index !== 0 ? [theme.margin.topl] : {}}>
                      {text}
                    </Text>
                  ))}
                </View>
              }>
              <LazyImage
                style={[styles.question]}
                occupancy={'transparent'}
                imageUrl={questionIcon}
                width={18}
                height={18}
              />
            </Tooltip>
          </View>
        </LazyImageBackground>
      </Pressable>
      <TouchableOpacity
        onPress={() => hide()}
        containerStyle={[theme.margin.topxxl, theme.flex.center]}>
        <LazyImage
          occupancy={'transparent'}
          imageUrl={closeIcon}
          width={40}
          height={40}
        />
      </TouchableOpacity>
    </View>,
    {
      backDropClose: true,
      overlayStyle: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
      },
    },
  );
  const handleShow = ({
    current: _current,
    total: _total,
    backgroundUrl: _backgroundUrl,
    shareUrl: _shareUrl,
    toolTipContent: _content,
  }: LotteryInfo) => {
    setCurrent(Math.min(_current, _total));
    setTotal(_total || 1); // total不能是0
    setBackgroundUrl(_backgroundUrl);
    setShareUrl(_shareUrl);
    setTooltipList(
      _content ? _content.split('\n').map(text => text.trim()) : [],
    );
    show();
  };
  return {
    renderModal,
    show: handleShow,
  };
}
