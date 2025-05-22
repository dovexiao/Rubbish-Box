import React, {useEffect, useState, useMemo} from 'react';
import RenderHtml from 'react-native-render-html';
import {useInnerStyle} from './promotion.hooks';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {goBack, goTo} from '@utils';
import {PromotionListItem, getPromotionDetail} from './promotion.service';
import {ScrollView, View, Image} from 'react-native';
import theme from '@/style';
import Text from '@basicComponents/text';
// import Button from '@basicComponents/button';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {PromotionFixBottomButton} from './components';

const PromotionDetail = () => {
  const {i18n} = useTranslation();
  const {id} = useRoute().params as BasicObject;
  const [item, setItem] = useState<PromotionListItem>();
  const {
    // size: {screenHeight, screenWidth, designWidth},
    size: {screenHeight, screenWidth},
    // itemStyle,
    listStyle,
    // detailStyle,
  } = useInnerStyle();
  const {calculateItemWidth} = useSettingWindowDimensions();
  const imageWidth = screenWidth - theme.paddingSize.l * 2;
  const [buttonTitle, setButtonTitle] = useState<string>('');
  const [buttonLink, setButtonLink] = useState<string>('');

  const getPromotionDetails = async () => {
    try {
      const res = await getPromotionDetail(id as number);
      setItem(res);
      setButtonTitle(res?.buttonName);
      setButtonLink(res?.buttonLink);
    } catch (error) {}
  };

  useEffect(() => {
    getPromotionDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const source = {
    html: item?.activityContent || '',
  };
  const htmlStyle = {
    fontSize: theme.fontSize.m,
    lineHeight: theme.fontSize.m * 1.4,
    fontFamily: 'Inter',
    color: theme.fontColor.white,
  };
  const tagsStyles = {
    p: {
      marginTop: 0,
    },
    img: {
      width: screenWidth - (theme.paddingSize.xxl + theme.paddingSize.l) * 2,
    },
  };
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
  return (
    <LazyImageLGBackground style={[{height: screenHeight}]}>
      <DetailNavTitle
        title={i18n.t('promotion.title')}
        hideAmount
        hideServer
        onBack={goBack}
      />
      <ScrollView
        style={[
          theme.flex.flex1,
          theme.margin.lrl,
          theme.margin.tbxxl,
          // theme.padding.xxl,
          theme.borderRadius.m,
        ]}
        contentContainerStyle={[listStyle.list]}>
        <View
          style={[
            theme.background.mainDark,
            theme.borderRadius.m,
            {marginBottom: 8},
          ]}>
          <Image
            style={[
              {
                width: imageWidth,
                height: calculateItemWidth(180),
              },
            ]}
            source={{uri: item?.activityIcon}}
          />
          <View style={[theme.padding.xxl]}>
            <Text
              fontSize={28}
              fontWeight="700"
              style={[
                {
                  color: '#97e91d',
                },
              ]}>
              {item?.activityTitle}
            </Text>
            <Text
              fontSize={20}
              fontWeight="700"
              style={[
                {
                  color: '#FFFFFF',
                },
              ]}>
              {item?.activitySubTitle}
            </Text>
          </View>
        </View>
        <View
          style={[
            theme.background.mainDark,
            theme.padding.xxl,
            theme.borderRadius.m,
          ]}>
          <RenderHtml
            source={source}
            baseStyle={htmlStyle}
            tagsStyles={tagsStyles}
          />
        </View>
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

export default PromotionDetail;
