/* eslint-disable */
/* prettier-ignore */
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import {getCasinoList, getCasinoType} from '../home.service';
import {CasinoGameItem, CasinoListParams, CasinoTypeItem} from '../home.type';
import NoData from '@/components/basic/error-pages/no-data';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import LazyImage from '@/components/basic/image';
import theme from '@style';

const HomeCasino: React.FC = () => {
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [tabs, setTabs] = useState<CasinoTypeItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [data, setData] = useState<CasinoGameItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 保存每个 tab 的布局信息
  const [tabLayouts, setTabLayouts] = useState<{
    [key: string]: {x: number; width: number};
  }>({});

  // ScrollView ref 用于滚动
  const scrollViewRef = useRef<ScrollView>(null);

  // fetchData 只和 selectedTab 相关，最后展示游戏列表
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: CasinoListParams = {pageNo: 1, gameType: selectedTab};
      const res = await getCasinoList(params);
      if (
        res?.content &&
        Array.isArray(res.content) &&
        res.content.length > 0
      ) {
        setData(res.content);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching casino list', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  // —— 优化 1：只在 selectedTab 变更时请求数据 ——
  useEffect(() => {
    if (selectedTab) {
      fetchData();
    }
  }, [selectedTab, fetchData]);

  // —— 优化 2：把滚动到中间的逻辑单独放一个 useEffect ——
  useEffect(() => {
    if (selectedTab) {
      const layout = tabLayouts[selectedTab];
      if (layout && scrollViewRef.current && scrollViewWidth > 0) {
        const tabCenterX = layout.x + layout.width / 2;
        const targetOffsetX = tabCenterX - scrollViewWidth / 2;
        scrollViewRef.current.scrollTo({x: targetOffsetX, animated: true});
      }
    }
  }, [selectedTab, tabLayouts, scrollViewWidth]);

  // 获取 tab 列表
  useEffect(() => {
    fetchTabs();
  }, []);

  const fetchTabs = async () => {
    try {
      const res = await getCasinoType();
      if (res && Array.isArray(res)) {
        // 过滤掉 name 为 "Live" 的项
        const filteredTabs = res.filter(item => item.name !== 'Live');
        setTabs(filteredTabs);
        // 默认选中第一个 tab（如果存在）
        if (filteredTabs.length > 0) {
          setSelectedTab(filteredTabs[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching tabs', error);
    }
  };

  const getUrl = async (id: number) => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    goTo('CasinoGameWeb', {id: id});
  };

  const onTabLayout = (tabName: string) => (event: LayoutChangeEvent) => {
    const {x, width} = event.nativeEvent.layout;
    setTabLayouts(prev => ({...prev, [tabName]: {x, width}}));
  };

  const renderTab = (tab: CasinoTypeItem, index: number) => {
    const isActive = selectedTab === tab.name;
    const isLast = index === tabs.length - 1;
    return (
      <TouchableOpacity
        key={`${tab.name}-${index}`}
        onPress={() => !isActive && setSelectedTab(tab.name)}
        onLayout={onTabLayout(tab.name)}
        style={[styles.tabItemContainer, isLast && styles.lastTabItem]}>
        <View style={styles.tabItem}>
          <Image
            source={{uri: isActive ? tab.icon : tab.openIcon}}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {tab.name}
          </Text>
        </View>
        {isActive && <View style={styles.tabIndicator} />}
      </TouchableOpacity>
    );
  };

  if (!loading && data.length === 0) {
    return <NoData />;
  }

  return (
    <View style={[styles.container]}>
      <View
        style={styles.tabScrollWrapper}
        onLayout={e => setScrollViewWidth(e.nativeEvent.layout.width)}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}>
          {tabs.map((tab, index) => renderTab(tab, index))}
        </ScrollView>
      </View>
      <View style={styles.cardsWrapper}>
        {data.map((item, index) => (
          <View
            key={`${item.gameId}-${index}`}
            style={[
              styles.card,
              // {backgroundColor: theme.basicColor.primary},
            ]}>
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
    </View>
  );
};

export default HomeCasino;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  tabScrollWrapper: {
    marginHorizontal: 12,
  },
  cardsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  tabsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  tabItemContainer: {
    marginRight: 20,
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  tabText: {
    fontSize: 12,
    color: theme.basicColor.primary,
    fontWeight: '600',
  },
  tabTextActive: {
    fontSize: 12,
    color: theme.basicColor.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    marginTop: 6,
    height: 2,
    width: 25,
    // backgroundColor: theme.basicColor.primary,
  },
  card: {
    margin: 3,
    alignItems: 'center',
    alignSelf: 'flex-start',
    width: (globalStore.screenWidth - 42) / 3,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  name: {
    marginTop: 5,
    marginBottom: 7,
    color: theme.basicColor.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  lastTabItem: {
    marginRight: 0,
  },
});
