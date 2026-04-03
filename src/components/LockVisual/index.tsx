import React, { useEffect, useMemo, useState } from 'react';
import { Image, Text, View, Platform } from 'react-native';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';
import { LOCK_ROLE } from '@/constants';
import FastImage from 'react-native-fast-image';
import styles from './styles';
import type { LockInfoDTO } from '@/pages/index/typing';
import { useTheme } from '@/context/ThemeContext';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { px } from '@/utils/ui';

export type LockVisualStatus =
  | 'rise'
  | 'fall'
  | 'rise30'
  | 'rise120'
  | 'openCover';

export type DeviceStatusFlags = Partial<
  Record<
    | 'rising30'
    | 'falling30'
    | 'rising120'
    | 'falling120'
    | 'rising'
    | 'falling'
    | 'openCovering'
    | 'closeCovering',
    boolean
  >
>;

export interface LockVisualProps {
  detail?: LockInfoDTO;
  deviceStatus?: DeviceStatusFlags;
  currentDeviceStatus: LockVisualStatus;
  gifNonce?: number | string;
  inconsistentStatus?: boolean;
}

const LockVisual: React.FC<LockVisualProps> = props => {
  const {
    detail,
    deviceStatus,
    currentDeviceStatus,
    gifNonce,
    inconsistentStatus,
  } = props;
  const { theme, themeType } = useTheme();
  const navigation = useAppNavigation();

  const [lockStatus, setLockStatus] =
    useState<LockVisualStatus>(currentDeviceStatus);
  const [gifLoaded, setGifLoaded] = useState(false);

  const showRising30Gif = !inconsistentStatus && !!deviceStatus?.rising30;
  const showFalling30Gif = !inconsistentStatus && !!deviceStatus?.falling30;
  const showRising120Gif = !inconsistentStatus && !!deviceStatus?.rising120;
  const showFalling120Gif = !inconsistentStatus && !!deviceStatus?.falling120;
  const showRisingGif = !inconsistentStatus && !!deviceStatus?.rising;
  const showFallingGif = !inconsistentStatus && !!deviceStatus?.falling;
  const showOpenCoveringGif =
    !inconsistentStatus && !!deviceStatus?.openCovering;
  const showCloseCoveringGif =
    !inconsistentStatus && !!deviceStatus?.closeCovering;

  const anyGifShowing =
    showRisingGif ||
    showFallingGif ||
    showOpenCoveringGif ||
    showCloseCoveringGif ||
    showRising30Gif ||
    showFalling30Gif ||
    showRising120Gif ||
    showFalling120Gif;

  useEffect(() => {
    if (inconsistentStatus) {
      setLockStatus('rise');
      return;
    }

    if (anyGifShowing) {
      return;
    }

    setLockStatus(currentDeviceStatus);
  }, [currentDeviceStatus, inconsistentStatus, anyGifShowing]);

  useEffect(() => {
    setGifLoaded(false);
  }, [deviceStatus, gifNonce]);

  // const showActionButton = detail?.role === LOCK_ROLE.ADMIN;
  const showActionButton = true;

  const actionButtonText = useMemo(() => {
    if (!showActionButton) return '';
    return detail?.isGroup ? '组合设备' : '添加设备';
  }, [detail?.isGroup, showActionButton]);

  const handlePressAction = () => {
    if (!showActionButton) return;
    if (detail?.isGroup) {
      navigation.navigate('CombineDevice', {
        id: detail?.id,
        lockName: detail?.lockName,
        type: false,
      });
      return;
    } else {
      navigation.navigate('BindDevice');
    }
  };

  const renderStaticImage = (uri?: string | null, active?: boolean) => {
    if (!uri || uri === 'null') return null;
    return (
      <Image
        source={{ uri }}
        style={[
          styles.staticImage,
          !active && { position: 'absolute', opacity: 0 },
        ]}
        resizeMode="contain"
        fadeDuration={0}
      />
    );
  };

  const withNonce = (uri: string, nonce?: number | string) => {
    if (nonce === undefined || nonce === null || nonce === '') return uri;
    const hasQuery = uri.includes('?');
    const sep = hasQuery ? '&' : '?';
    return `${uri}${sep}__nonce=${encodeURIComponent(String(nonce))}`;
  };

  const renderGif = (uri?: string | null, key?: string) => {
    if (!uri || uri === 'null') return null;
    const finalUri = withNonce(uri, gifNonce);

    // 所有的系统全部使用原生 Image 渲染 gif，因为 react-native-fast-image 在底层的 SDWebImage/Glide 默认策略下常常忽略 GIF 的循环次数。
    return (
      <Image
        key={key}
        source={{ uri: finalUri }}
        style={[
          styles.gifImage,
          !gifLoaded && { position: 'absolute', opacity: 0 },
        ]}
        resizeMode="contain"
        onLoad={() => setGifLoaded(true)}
      />
    );
  };

  return (
    <Flex justify="center" align="center" style={styles.container}>
      {showActionButton ? (
        <Flex
          justify="center"
          align="center"
          isTouchView
          onPress={handlePressAction}
          style={[
            styles.actionButton,
            themeType === 'dark'
              ? styles.actionButtonDeep
              : styles.actionButtonLight,
          ]}
        >
          <Text
            style={[
              styles.actionText,
              themeType === 'dark'
                ? styles.actionTextDeep
                : styles.actionTextLight,
            ]}
          >
            {actionButtonText}
          </Text>
          <View style={styles.actionIcon}>
            <AppIcon
              name={detail?.isGroup ? 'a-combinationunit' : 'a-add12'}
              size={16}
              color={
                themeType === 'dark'
                  ? 'rgba(255,255,255,0.8)'
                  : 'rgba(51,51,51,0.8)'
              }
            />
          </View>

          {detail?.isGroup && (
            <Flex
              direction="row"
              justify="center"
              align={'center'}
              style={styles.groupCount}
            >
              <AppIcon
                style={{ marginRight: px(4), marginTop: px(4) }}
                name={'multiplication'}
                size={px(14)}
                color={themeType === 'dark' ? '#ffffff' : '#333333'}
              />
              <Text
                style={[
                  styles.groupCountText,
                  { color: themeType === 'dark' ? '#ffffff' : '#333333' },
                ]}
              >
                {detail?.groupCount}
              </Text>
            </Flex>
          )}
        </Flex>
      ) : null}

      {renderStaticImage(
        detail?.imageMap?.upLockPng,
        lockStatus === 'rise' && (!anyGifShowing || !gifLoaded),
      )}
      {renderStaticImage(
        detail?.imageMap?.up30LockPng,
        lockStatus === 'rise30' && (!anyGifShowing || !gifLoaded),
      )}
      {renderStaticImage(
        detail?.imageMap?.up120LockPng,
        lockStatus === 'rise120' && (!anyGifShowing || !gifLoaded),
      )}
      {renderStaticImage(
        detail?.imageMap?.fallLockPng,
        lockStatus === 'fall' && (!anyGifShowing || !gifLoaded),
      )}
      {renderStaticImage(
        detail?.imageMap?.openLockPng,
        lockStatus === 'openCover' && (!anyGifShowing || !gifLoaded),
      )}

      {showRisingGif
        ? renderGif(detail?.imageMap?.upLockGif, `upLockGif_${gifNonce ?? 0}`)
        : null}

      {showRising30Gif
        ? renderGif(
            detail?.imageMap?.up30LockGif,
            `up30LockGif_${gifNonce ?? 0}`,
          )
        : null}

      {showRising120Gif
        ? renderGif(
            detail?.imageMap?.up120LockGif,
            `up120LockGif_${gifNonce ?? 0}`,
          )
        : null}

      {showFallingGif
        ? renderGif(
            detail?.imageMap?.fallLockGif,
            `fallLockGif_${gifNonce ?? 0}`,
          )
        : null}

      {showFalling30Gif
        ? renderGif(
            detail?.imageMap?.fall30LockGif,
            `fall30LockGif_${gifNonce ?? 0}`,
          )
        : null}

      {showFalling120Gif
        ? renderGif(
            detail?.imageMap?.fall120LockGif,
            `fall120LockGif_${gifNonce ?? 0}`,
          )
        : null}

      {showOpenCoveringGif
        ? renderGif(
            detail?.imageMap?.openCoverGif,
            `openCoverGif_${gifNonce ?? 0}`,
          )
        : null}

      {showCloseCoveringGif
        ? renderGif(
            detail?.imageMap?.closeCoverGif,
            `closeCoverGif_${gifNonce ?? 0}`,
          )
        : null}
    </Flex>
  );
};

export default LockVisual;
