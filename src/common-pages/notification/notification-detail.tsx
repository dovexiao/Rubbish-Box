import React, {useState, useMemo, useEffect} from 'react';
import RenderHtml from 'react-native-render-html';
import {useInnerStyle} from './notification.hooks';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {goBack, goTo} from '@utils';
import {ScrollView, View} from 'react-native';
import theme from '@/style';
import Text from '@basicComponents/text';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@basicComponents/image';
import useNotificationStore from '@/store/useNotificationStore';
import {goToUrl} from '@/common-pages/game-navigate';
import {PromotionFixBottomButton} from '@/common-pages/promotion/components';

const NotificationDetail = () => {
  const {i18n} = useTranslation();
  const notificationDetail = useNotificationStore(
    state => state.notificationDetail,
  );
  const [buttonLink, setButtonLink] = useState<string>('');
  const [buttonTitle, setButtonTitle] = useState<string>('');
  useEffect(() => {
    if (notificationDetail?.buttonLink) {
      setButtonLink(notificationDetail?.buttonLink);
    }
    if (notificationDetail?.buttonName) {
      setButtonTitle(notificationDetail?.buttonName);
    }
  }, [notificationDetail]);
  const buttonClick = useMemo(() => {
    return () => {
      if (buttonLink) {
        if (buttonLink.startsWith('http')) {
          goToUrl(buttonLink);
        } else {
          /* 路由name */
          goTo(buttonLink);
        }
      }
    };
  }, [buttonLink]);

  const {
    size: {screenHeight, screenWidth},
    detailStyle,
  } = useInnerStyle();
  const source = {
    html: notificationDetail?.messageContent || '',
  };
  const htmlStyle = {
    fontSize: theme.fontSize.s,
    lineHeight: theme.fontSize.s * 1.2,
    fontFamily: 'Inter',
    color: theme.fontColor.accent,
    /* 底部遮挡 */
    paddingBottom: 20,
  };
  const tagsStyles = {
    p: {
      marginTop: 6,
      marginBottom: 6,
    },
    img: {
      width: screenWidth - (theme.paddingSize.xxl + theme.paddingSize.l) * 2,
    },
  };
  return (
    <LazyImageLGBackground style={[{height: screenHeight}]}>
      <DetailNavTitle
        title={i18n.t('notification.detail')}
        hideAmount
        hideServer
        onBack={goBack}
      />
      <ScrollView
        style={[
          theme.flex.flex1,
          theme.background.mainDark,
          theme.margin.lrl,
          theme.margin.tbxxl,
          theme.padding.xxl,
          theme.borderRadius.m,
        ]}>
        <View style={[theme.flex.center]}>
          <Text
            fontSize={theme.fontSize.xl}
            main
            blod
            style={[theme.margin.btmxxs, detailStyle.title, theme.font.white]}>
            {notificationDetail?.messageTitle}
          </Text>
        </View>
        <View style={[theme.flex.center, theme.margin.btms]}>
          <Text fontSize={theme.fontSize.s} secAccent>
            {dayjs(notificationDetail?.sendTime).format('MM:DD hh:mm')}
          </Text>
        </View>

        <RenderHtml
          source={source}
          baseStyle={htmlStyle}
          tagsStyles={tagsStyles}
        />
      </ScrollView>

      {buttonLink && (
        <PromotionFixBottomButton
          text={buttonTitle}
          disabled={false}
          onPress={buttonClick}
        />
      )}
    </LazyImageLGBackground>
  );
};

export default NotificationDetail;
