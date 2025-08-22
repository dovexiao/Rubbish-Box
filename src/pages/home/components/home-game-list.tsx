import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import theme from '@style';
import {useTranslation} from 'react-i18next';

interface BoxData {
  id: number;
  image: any;
  text: string;
}

const HomeGameList: React.FC<{setSelectedGame: (id: number) => void}> = ({
  setSelectedGame,
}) => {
  const {i18n} = useTranslation();
  const [selectedBox, setSelectedBox] = useState<number>(1);

  const boxWidth = (globalStore.screenWidth - 24) / 5; // 平分屏幕宽度

  const data: BoxData[] = [
    {
      id: 1,
      image: require('@/assets/icons/home/home-game-list/Casino.webp'),
      text: i18n.t('home.tab.casino'),
    },
    {
      id: 2,
      image: require('@/assets/icons/home/home-game-list/Lottery.webp'),
      text: i18n.t('home.tab.lottery'),
    },
    {
      id: 3,
      image: require('@/assets/icons/home/home-game-list/Live.webp'),
      text: i18n.t('home.tab.live'),
    },
    {
      id: 4,
      image: require('@/assets/icons/home/home-game-list/Fishing.webp'),
      text: i18n.t('home.tab.fishing'),
    },
    {
      id: 5,
      image: require('@/assets/icons/home/home-game-list/Sports.webp'),
      text: i18n.t('home.tab.sports'),
    },
  ];

  const getUrl = async () => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    goTo('CasinoGameWeb', {id: 99999});
  };

  return (
    <View style={styles.container}>
      {data.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[styles.box, {width: boxWidth, height: 1.28 * boxWidth}]}
          onPress={() => {
            if (item.id === 5) {
              getUrl();
              return;
            }
            setSelectedBox(item.id);
            setSelectedGame(item.id); // 通知父组件切换显示的内容
          }}>
          {selectedBox === item.id ? ( // 选中的盒子使用背景图片
            <ImageBackground
              source={require('@/assets/icons/home/home-game-list/list-bg.webp')}
              style={styles.imageBackground}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.text}>{item.text}</Text>
            </ImageBackground>
          ) : (
            <>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.text}>{item.text}</Text>
            </>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Arial, Arial-Bold',
    fontWeight: '700',
    color: theme.basicColor.white,
    textAlign: 'center',
  },
});

export default HomeGameList;
