import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
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

  // const boxWidth = (globalStore.screenWidth - 24) / 5; // 平分屏幕宽度

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

  const tanList: BoxData[] = [
    {
      id: 1,
      image: require('@/assets/icons/home/home-game-list/Casino.webp'),
      text: 'Tan 1',
    },
    {
      id: 2,
      image: require('@/assets/icons/home/home-game-list/Lottery.webp'),
      text: 'Tan 2',
    },
    {
      id: 3,
      image: require('@/assets/icons/home/home-game-list/Live.webp'),
      text: 'Tan 3',
    },
    {
      id: 4,
      image: require('@/assets/icons/home/home-game-list/Fishing.webp'),
      text: 'Tan 4',
    },
    {
      id: 5,
      image: require('@/assets/icons/home/home-game-list/Sports.webp'),
      text: 'Tan 5',
    },
    {
      id: 6,
      image: require('@/assets/icons/home/home-game-list/Casino.webp'),
      text: 'Tan 6',
    },
    {
      id: 7,
      image: require('@/assets/icons/home/home-game-list/Fishing.webp'),
      text: 'Tan 7',
    },
    {
      id: 8,
      image: require('@/assets/icons/home/home-game-list/Sports.webp'),
      text: 'Tan 8',
    },
    {
      id: 9,
      image: require('@/assets/icons/home/home-game-list/Casino.webp'),
      text: 'Tan 9',
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
      {/* 上方横向滚动展示 tanList */}
      <ScrollView
        horizontal
        style={styles.tanListScroll}
        contentContainerStyle={styles.tanListScrollContent}
        showsHorizontalScrollIndicator={false}>
        {tanList.map(item => (
          <TouchableOpacity key={item.id} style={styles.tanBox}>
            <Image source={item.image} style={styles.tanImage} />
            <Text style={styles.tanText}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {/* 左侧竖向滚动展示 data */}
        <ScrollView
          style={styles.verticalScroll}
          contentContainerStyle={styles.verticalScrollContent}
          showsVerticalScrollIndicator={false}>
          {data.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.verticalBox]}
              onPress={() => {
                if (item.id === 5) {
                  getUrl();
                  return;
                }
                setSelectedBox(item.id);
                setSelectedGame(item.id);
              }}>
              {selectedBox === item.id ? (
                <ImageBackground
                  source={require('@/assets/icons/home/home-game-list/list-bg.webp')}
                  style={styles.verticalBox}>
                  <Image source={item.image} style={styles.smallImage} />
                  <Text style={styles.text}>{item.text}</Text>
                </ImageBackground>
              ) : (
                <>
                  <Image source={item.image} style={styles.smallImage} />
                  <Text style={styles.text}>{item.text}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 右侧具体内容展示 */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {`Selected Game ID: ${selectedBox}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tanListScroll: {
    marginBottom: 12,
    flexGrow: 0,
  },
  tanListScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tanBox: {
    alignItems: 'center',
    marginRight: 12,
  },
  tanImage: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  tanText: {
    fontSize: 10,
    textAlign: 'center',
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  verticalScroll: {
    maxWidth: 80,
    // marginRight: 12,
  },
  verticalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  verticalBox: {
    marginBottom: 24,
    width: 50,
    height: 50,
  },
  smallImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  contentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.basicColor.primary,
  },
  text: {
    fontSize: 10,
    fontFamily: 'Arial, Arial-Bold',
    fontWeight: '700',
    color: theme.basicColor.primary,
    textAlign: 'center',
  },
});

export default HomeGameList;
