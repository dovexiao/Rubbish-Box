import React, {useEffect, useState} from 'react';
import {View, FlatList, StyleSheet, ImageBackground, Image} from 'react-native';
import HomeDigitOffCard from './home-digit-off-card';
import {getDigitOffList} from '../../home.service';
import {DigitOffListItem} from '../../home.type';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import Text from '@basicComponents/text';
import theme from '@/style';
import {useTranslation} from 'react-i18next';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {goTo} from '@/utils';
import globalStore from '@/services/global.state';

const HomeDigitOff: React.FC = () => {
  const basePx = globalStore.screenWidth / 375;
  const {screenWidth} = useScreenSize();
  const {i18n} = useTranslation();
  const digitsType = 1;
  const [digitOffData, setDigitOffData] = useState<DigitOffListItem[]>([]); // 使用状态存储动态数据

  const listDetail = async () => {
    try {
      const list = await getDigitOffList(digitsType); // 调用接口获取数据
      // 对list按照item.sort从小到大排序
      const sortedList = list.sort((a, b) => a.sort - b.sort);
      setDigitOffData(sortedList); // 更新状态
    } catch (error) {
      console.error('Failed to fetch digit off list:', error);
    }
  };

  useEffect(() => {
    listDetail();
  }, [digitsType]);

  return (
    <View>
      <ImageBackground
        source={require('@/assets/icons/home/game-name-bg.webp')}
        style={[
          theme.flex.row,
          theme.flex.center,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: basePx * 46,
            marginLeft: -14,
            marginRight: -14,
            marginBottom: 10,
          },
        ]}>
        <Image
          source={require('@/assets/icons/home/game-name-img.webp')}
          style={{
            width: theme.iconSize.m,
            height: theme.iconSize.m,
            marginRight: theme.paddingSize.s,
          }}
        />
        <Text
          fontSize={17}
          color={theme.basicColor.newFontYellow}
          fontFamily="fontInter"
          style={{fontWeight: '700', marginBottom: 5}}>
          {i18n.t('home.digit.title')}
        </Text>
      </ImageBackground>
      <View style={styles.container}>
        <FlatList
          data={digitOffData}
          renderItem={({item}) => (
            <NativeTouchableOpacity
              onPress={() => {
                if (item.status === 0) {
                  globalStore.globalTotal.next({
                    type: 'warning',
                    message: i18n.t('home.tip.closed', {
                      name: item.digitsName,
                    }),
                  });
                  return;
                }
                goTo('NewWebViewGame', {
                  type: 'digitGame',
                  params: `id=${item.id}`,
                });
              }}
              style={
                (styles.itemContainer,
                [
                  {
                    width: (screenWidth - 36) / 2,
                    height: screenWidth * 0.288,
                    marginBottom: 8,
                  },
                ])
              }>
              <HomeDigitOffCard
                drawTimestamp={item.drawTimestamp}
                status={item.status}
                winAmount={item.winAmount}
                digitsLogo={item.digitsLogo}
              />
            </NativeTouchableOpacity>
          )}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper} // 设置每列之间的样式
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginBottom: 4,
  },

  columnWrapper: {
    justifyContent: 'space-between',
  },

  itemContainer: {
    flex: 1,
  },
});

export default HomeDigitOff;
