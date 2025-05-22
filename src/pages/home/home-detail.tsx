import {SafeAny} from '@/types';
import {useRoute} from '@react-navigation/native';
import React, {ReactNode, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {
  DiceListItem,
  ColorListItem,
  DigitListItem,
  // QuickDigitListItem,
  KeralaListItem,
  MatkaListItem,
} from './home.type';
import HomeKeralaCard from './components/kerala/home-kerala-card';
import HomeDigitCard from './components/digit/home-digit-card';
// import HomeQuickDigitCard from './components/quickdigit/home-quickdigit-card';
import HomeDiceCard from './components/dice/home-dice-card';
import HomeColorCard from './components/color/home-color-card';
import HomeMatkaCard from './components/matka/home-matka-card';
import theme from '@/style';
import {
  getDiceList,
  getColorList,
  getDigitList,
  // getQuickDigitList,
  getKeralaList,
} from './home.service';
import globalStore from '@/services/global.state';
import {goBack} from '@/utils';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {NoMoreData} from '@/components/basic/default-page';
import {useTranslation} from 'react-i18next';

// type DetailType = 'kerala' | 'digit' | 'quickdigit' | 'dicegame' | 'colorgame' | 'matka';
type DetailType = 'kerala' | 'digit' | 'dicegame' | 'colorgame' | 'matka';
type RenderFn<T> = (params: {
  item: T;
  cardWidth: number;
  imageHeight: number;
  index?: number;
}) => ReactNode;

type RenderConfig<T> = {
  title: string;
  render: RenderFn<T>;
};

const HomeDetail = () => {
  const {i18n} = useTranslation();
  const renderItemMap: Record<DetailType, RenderConfig<SafeAny>> = {
    kerala: {
      title: i18n.t('home.kerala.title'),
      render: params => <HomeKeralaCard {...params} />,
    } as RenderConfig<KeralaListItem>,
    digit: {
      title: i18n.t('home.digit.title'),
      render: params => <HomeDigitCard {...params} />,
    } as RenderConfig<DigitListItem>,
    // quickdigit: {
    //   title: i18n.t('home.quickdigit.title'),
    //   render: params => <HomeQuickDigitCard {...params} />,
    // } as RenderConfig<QuickDigitListItem>,
    dicegame: {
      title: i18n.t('home.dice.title'),
      render: ({index, ...otherParams}) => (
        <HomeDiceCard index={index || 0} {...otherParams} />
      ),
    } as RenderConfig<DiceListItem>,
    colorgame: {
      title: i18n.t('home.color.title'),
      render: ({index, ...otherParams}) => (
        <HomeColorCard index={index || 0} {...otherParams} />
      ),
    } as RenderConfig<ColorListItem>,
    matka: {
      title: i18n.t('home.matka.title'),
      render: params => <HomeMatkaCard {...params} />,
    } as RenderConfig<MatkaListItem>,
  };
  const {params} = useRoute<SafeAny>();
  const detailType: DetailType =
    params && params.detailType ? params.detailType : 'kerala';
  const config = renderItemMap[detailType];
  const [data, setData] = useState<SafeAny[]>([]);
  const cardWidth =
    (globalStore.screenWidth - theme.paddingSize.l * 2 - theme.paddingSize.s) /
    2;
  // const imageHeight = detailType === 'dicegame'  ? (cardWidth * 145) / 172 : (cardWidth * 114) / 172;
  const imageHeight = (cardWidth * 250) / 300;
  const listDetail = async () => {
    let list = [];
    switch (detailType) {
      case 'dicegame':
        list = await getDiceList();
        setData(list);
        break;
      case 'colorgame':
        list = await getColorList();
        setData(list);
        break;
      case 'kerala':
        list = await getKeralaList();
        setData(list);
        break;
      case 'digit':
        list = await getDigitList();
        setData(list);
        break;
      // case 'quickdigit':
      //   list = await getQuickDigitList();
      //   setData(list);
      //   break;
    }
  };
  useEffect(() => {
    listDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailType]);
  return (
    <View style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        disabled={false}
        titleColor={theme.fontColor.main}
        {...theme.shadow.defaultShadow}
        containerStyle={[
          theme.shadow.defaultShadow.style,
          theme.background.white,
        ]}
        title={config.title}
        hideServer
        iconColor={'black'}
        onBack={() => goBack()}
      />
      <ScrollView>
        <View
          style={[
            theme.flex.row,
            theme.flex.wrap,
            theme.flex.between,
            theme.padding.l,
          ]}>
          {data.map((item, index) => (
            <View style={[theme.margin.btms]} key={index}>
              {config.render({
                item,
                cardWidth,
                imageHeight,
                index,
              })}
            </View>
          ))}
        </View>
        <NoMoreData text="" />
      </ScrollView>
    </View>
  );
};

export default HomeDetail;
