import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack, goTo} from '@/utils';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {
  LazyImageBackground,
  LazyImageLGBackground,
} from '@basicComponents/image';
import {ScrollView} from 'react-native';
import {CollectResponseData, postCollectHomeData} from './collect.service';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import CollectCategoryItem from './components/collect-category-item';
import BottomImage from '@/components/business/bottom-image/bottom-image';

const Collect = () => {
  const {i18n} = useTranslation();
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const itemWidth = screenWidth - theme.paddingSize.l * 2;

  const [responseData, setResponseData] = useState<CollectResponseData>();

  const fetchData = async () => {
    try {
      const res = await postCollectHomeData();
      setResponseData(res);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onPressWorking = () => {
    goTo('ArticleDetail', {
      id: 100,
    });
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fill]} showBottomBG={false}>
      <DetailNavTitle
        onBack={goBack}
        hideAmount
        serverRight
        title={i18n.t('homeMenu.title.collect')}
      />
      <ScrollView
        style={[theme.flex.flex1NoHidden, theme.padding.lrl]}
        contentContainerStyle={[theme.gap.m]}>
        <LazyImageBackground
          imageUrl={responseData?.imageUrl}
          width={itemWidth}
          height={calculateItemWidth(400)}
          style={[
            theme.borderRadius.s,
            {
              paddingTop: 30,
              paddingLeft: 30,
            },
          ]}>
          <Text fontSize={28} blod white>
            {responseData?.title}
          </Text>
          <Text fontSize={20} blod white style={{marginTop: 20}}>
            {responseData?.desc}
          </Text>
          <Text color={theme.fontColor.green} fontSize={28} blod>
            {responseData?.rewardDesc}
          </Text>
          <Button
            buttonStyle={[
              // eslint-disable-next-line react-native/no-inline-styles
              {
                width: 'auto',
                maxWidth: 150,
                marginTop: 20,
              },
            ]}
            title={'Working principle'}
            type="linear-primary"
            onPress={onPressWorking}
          />
        </LazyImageBackground>
        {responseData?.categoryList?.map(item => {
          return (
            <CollectCategoryItem
              collectCategoryItem={item}
              refreshHomeData={fetchData}
            />
          );
        })}
        <BottomImage style={{width: itemWidth}} />
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default Collect;
