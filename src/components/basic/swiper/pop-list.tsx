import React, { useCallback } from 'react';
import { View, Linking } from 'react-native';
import { LazyImageBackground } from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import theme from '@/style';
import { goToUrl } from '@/common-pages/game-navigate';
import { renderOverlayLinkComponent } from '@/components/basic/swiper';
import { BannerListItem } from '@/pages/home/home.type';

interface PopListProps {
  bannerList: BannerListItem[];
  bannerWidth: number;
  bannerHeight: number;
  currentIndex?: number; // 当前显示哪张
  bannerOverlaySize?: 'small' | 'big';
  type?: number;
  onClose?: () => void; // 点击关闭按钮后触发
}

const PopList = ({
  bannerList,
  bannerWidth,
  bannerHeight,
  bannerOverlaySize = 'big',
  type = 1,
  currentIndex = 0,
  onClose,
}: PopListProps) => {
  const bannerItem = bannerList[currentIndex];
  if (!bannerItem) return null;

  const onPressBanner = useCallback(() => {
    if (!bannerItem.popUrl) return;
    if (bannerItem.popUrl.startsWith('http://') || bannerItem.popUrl.startsWith('https://')){
      Linking.openURL(bannerItem.popUrl);
    }else if (bannerItem.popUrl.startsWith('route:')) {
      goToUrl(bannerItem.popUrl, bannerItem.title);
      // 点击跳转后关闭弹窗
      if (onClose) onClose();
    }else{
      return;
    }
  }, [bannerItem, type]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPressBanner}
      style={[
        theme.fill.fill,
        theme.borderRadius.s,
        theme.overflow.hidden,
        theme.background.primary,
      ]}
    >
      <LazyImageBackground
        occupancy={theme.backgroundColor.palegrey}
        imageUrl={bannerItem.bannerImg}
        height={bannerHeight}
        width={bannerWidth}
      >
        {renderOverlayLinkComponent({
          item: bannerItem,
          onPress: onPressBanner,
          sizeHeight: bannerHeight,
          sizeWidth: bannerWidth,
          size: bannerOverlaySize,
        })}
      </LazyImageBackground>
    </TouchableOpacity>
  );
};

export default React.memo(PopList);
