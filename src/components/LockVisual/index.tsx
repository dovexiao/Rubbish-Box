import React, { useEffect, useMemo, useState } from 'react';
import { Image, Text, View } from 'react-native';
import Flex from '@/components/Flex';
import IconFont from '@/iconfont';
import { LOCK_ROLE } from '@/constants';
import FastImage from 'react-native-fast-image';
import styles from './styles';
import { LockInfoDTO } from '@/pages/index/typing';

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
  backgroundType?: 'deep' | 'normal' | 'shallow' | string;
  onPressAddDevice?: () => void;
  onPressCombineDevice?: (payload: {
    id?: number | string;
    lockName?: string;
    type: false;
  }) => void;
}

const LockVisual: React.FC<LockVisualProps> = props => {
  const {
    detail,
    deviceStatus,
    currentDeviceStatus,
    gifNonce,
    inconsistentStatus,
    backgroundType,
    onPressAddDevice,
    onPressCombineDevice,
  } = props;

  const [lockStatus, setLockStatus] =
    useState<LockVisualStatus>(currentDeviceStatus);

  useEffect(() => {
    if (inconsistentStatus) {
      setLockStatus('rise');
      return;
    }
    setLockStatus(currentDeviceStatus);
  }, [currentDeviceStatus, inconsistentStatus]);

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

  const isDeep = backgroundType === 'deep';

  const showActionButton = detail?.role === LOCK_ROLE.ADMIN;

  const actionButtonText = useMemo(() => {
    if (!showActionButton) return '';
    return detail?.isGroup ? '组合设备' : '添加设备';
  }, [detail?.isGroup, showActionButton]);

  const handlePressAction = () => {
    if (!showActionButton) return;
    if (detail?.isGroup) {
      onPressCombineDevice?.({
        id: detail?.id,
        lockName: detail?.lockName,
        type: false,
      });
      return;
    }
    onPressAddDevice?.();
  };

  const renderStaticImage = (uri?: string) => {
    if (!uri) return null;
    return (
      <Image
        source={{ uri }}
        style={styles.staticImage}
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

  const renderGif = (uri?: string, key?: string) => {
    if (!uri) return null;
    const finalUri = withNonce(uri, gifNonce);
    return (
      <FastImage
        key={key}
        source={{ uri: finalUri, priority: FastImage.priority.normal }}
        style={styles.gifImage}
        resizeMode={FastImage.resizeMode.contain}
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
            isDeep ? styles.actionButtonDeep : styles.actionButtonLight,
          ]}
        >
          <Text
            style={[
              styles.actionText,
              isDeep ? styles.actionTextDeep : styles.actionTextLight,
            ]}
          >
            {actionButtonText}
          </Text>
          <View style={styles.actionIcon}>
            <IconFont
              name={detail?.isGroup ? 'a-combinationunit' : 'a-add12'}
              size={16}
              color={isDeep ? '#FFFFFF' : '#333333'}
            />
          </View>
        </Flex>
      ) : null}

      {lockStatus === 'rise' && !anyGifShowing
        ? renderStaticImage(detail?.imageMap?.upLockPng)
        : null}
      {lockStatus === 'rise30' && !anyGifShowing
        ? renderStaticImage(detail?.imageMap?.up30LockPng)
        : null}
      {lockStatus === 'rise120' && !anyGifShowing
        ? renderStaticImage(detail?.imageMap?.up120LockPng)
        : null}
      {lockStatus === 'fall' && !anyGifShowing
        ? renderStaticImage(detail?.imageMap?.fallLockPng)
        : null}
      {lockStatus === 'openCover' && !anyGifShowing
        ? renderStaticImage(detail?.imageMap?.openLockPng)
        : null}

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
