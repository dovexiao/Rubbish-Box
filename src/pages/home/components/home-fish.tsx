import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {getCasinoList} from '../home.service';
import {CasinoGameItem, CasinoListParams} from '../home.type';
import NoData from '@/components/basic/error-pages/no-data';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import LazyImage from '@/components/basic/image';
import theme from '@style';

const HomeCasino: React.FC = () => {
  const [data, setData] = useState<CasinoGameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 在调用时传递入参
      const params: CasinoListParams = {pageNo: 1, gameType: 'Fishing'};
      const res = await getCasinoList(params);
      if (
        res?.content &&
        Array.isArray(res.content) &&
        res.content.length > 0
      ) {
        setData(res.content);
      } else {
      }
    } catch (error) {
      console.error('Error', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrl = async (id: number) => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    goTo('CasinoGameWeb', {id: id});
  };

  if (!loading && data.length === 0) {
    return <NoData />;
  }

  return (
    <View style={[styles.wrapper]}>
      {data.map(item => (
        <View
          key={item.gameId}
          style={[styles.card, {backgroundColor: theme.basicColor.primary}]}>
          <TouchableOpacity onPress={() => getUrl(item.gameId)}>
            <LazyImage
              imageUrl={item.gamePic}
              width={(globalStore.screenWidth - 42) / 3}
              height={(globalStore.screenWidth - 42) / 3}
              occupancy="transparent"
              radius={9}
            />
          </TouchableOpacity>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {item.gameName}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default HomeCasino;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    width: '100%',
  },
  card: {
    margin: 3,
    alignItems: 'center',
    alignSelf: 'flex-start', // 让剩余的卡片靠左对齐
    width: (globalStore.screenWidth - 42) / 3, // 确保宽度固定
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: {
    marginTop: 5,
    marginBottom: 7,
    color: theme.basicColor.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
});
