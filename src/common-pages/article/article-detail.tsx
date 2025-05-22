import React, {useEffect, useState} from 'react';
import RenderHtml from 'react-native-render-html';
import {useInnerStyle} from './article.hooks';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import {goBack, scaleSize} from '@utils';
import {ArticleListItem, getArticleDetailService} from './article.service';
import {ScrollView, View, Image, Platform} from 'react-native';
import theme from '@/style';
import Text from '@basicComponents/text';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import RNConfig from 'react-native-config';

const ArticleDetail = () => {
  const {i18n} = useTranslation();
  const params = useRoute().params || {};
  const {id = 1, type} = params as BasicObject;

  const [item, setItem] = useState<ArticleListItem>();
  const {
    size: {screenHeight, screenWidth},
    listStyle,
    detailStyle,
  } = useInnerStyle();

  const getArticleDetail = async () => {
    try {
      const res = await getArticleDetailService(id as number);
      setItem(res);
    } catch (error) {}
  };

  useEffect(() => {
    getArticleDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const source = {
    html: item?.articleContent || '',
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

  const IS_WEB = Platform.OS === 'web';

  const ENV_CONFIG = (IS_WEB ? process.env : RNConfig) as {
    REACT_APP_ENV: 'dev' | 'prod';
    REACT_APP_API_BASE_URL: string;
    REACT_APP_API_INDUSWIN_URL?: string;
    REACT_APP_API_SPORTS_URL?: string;
    REACT_APP_API_H5GAMES_URL?: string;
    REACT_APP_API_RACECAR_URL?: string;
    REACT_APP_API_H5VUE_URL?: string;
    [k: string]: string | number | undefined;
  };
  const indexFlag = type === 'index';
  return (
    <LazyImageLGBackground style={[{height: screenHeight}]}>
      {indexFlag ? (
        <DetailNavTitle
          title={i18n.t('article.detail.title')}
          hideAmount
          hideServer
        />
      ) : (
        <DetailNavTitle
          title={i18n.t('article.detail.title')}
          hideAmount
          hideServer
          onBack={goBack}
        />
      )}

      <ScrollView
        style={[
          theme.flex.flex1,
          theme.background.mainDark,
          // theme.margin.lrl,
          // theme.margin.tbxxl,
          theme.padding.xxl,
          // theme.borderRadius.m,
        ]}
        contentContainerStyle={[listStyle.list]}>
        <View style={[theme.flex.center]}>
          <Text
            fontSize={theme.fontSize.xl}
            white
            blod
            style={[theme.margin.m, detailStyle.title]}>
            {item?.articleTitle}
          </Text>
          <Text
            fontSize={theme.fontSize.l}
            white
            blod
            style={[theme.margin.m, detailStyle.title]}>
            {item?.articleSubhead}
          </Text>
          {item?.articleImg ? (
            <Image
              style={[
                theme.margin.m,
                {
                  width: scaleSize(400),
                  height: scaleSize(400),
                },
              ]}
              source={{
                uri: (ENV_CONFIG.REACT_APP_API_BASE_URL +
                  item?.articleImg) as string,
              }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <RenderHtml
          source={source}
          baseStyle={htmlStyle}
          tagsStyles={tagsStyles}
        />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ArticleDetail;
