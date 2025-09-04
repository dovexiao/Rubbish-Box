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
  ActivityIndicator,
} from 'react-native';
import {getCasinoList, getCasinoType} from '../home.service';
import {CasinoGameItem, CasinoListParams, CasinoTypeItem} from '../home.type';
import NoData from '@/components/basic/error-pages/no-data';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
import LazyImage from '@/components/basic/image';
import theme from '@style';
import { toUrlGame } from "@/common-pages/game-navigate";
interface HomeCasinoProps {
  tabs: CasinoTypeItem[];
  selectedTab: string;
  onTabChange: (tabName: string) => void;
  data: CasinoGameItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}
const HomeCasino: React.FC<HomeCasinoProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  data,
  loading,
  loadingMore,
  hasMore
}) => {
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<{[key: string]: {x: number; width: number}}>({});
  const scrollViewRef = useRef<ScrollView>(null);

  // Tab 布局和滚动逻辑
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

  const onTabLayout = (tabName: string) => (event: LayoutChangeEvent) => {
    const {x, width} = event.nativeEvent.layout;
    setTabLayouts(prev => ({...prev, [tabName]: {x, width}}));
  };

  const getUrl = async (name: string, id: number, provider: string) => {
    if (!globalStore.token) {
      goTo('Login');
      return;
    }
    toUrlGame(name, id.toString(), provider);
  };

  const renderTab = (tab: CasinoTypeItem, index: number) => {
    const isActive = selectedTab === tab.name;
    const isLast = index === tabs.length - 1;
    return (
      <TouchableOpacity
        key={`${tab.name}-${index}`}
        onPress={() => !isActive && onTabChange(tab.name)}
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

  const renderItem = ({ item }: { item: CasinoGameItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => getUrl(item.gameName, item.gameId, item.provider)}
    >
      <LazyImage
        imageUrl={item.gamePic}
        width={(globalStore.screenWidth - 42) / 3}
        height={(globalStore.screenWidth - 42) / 3}
        occupancy="transparent"
        radius={9}
      />
      <Text style={styles.name}>{item.gameName}</Text>
    </TouchableOpacity>
  );

  if (!loading && data.length === 0) {
    return <NoData />;
  }

  return (
    <View style={[styles.container]}>
      {/* Tab 部分 */}
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
      
      {/* 游戏列表 - 使用 View 而不是 FlatList */}
      <View style={styles.cardsWrapper}>
        {data.map((item, index) => (
          <View key={`${item.gameId}-${index}`} style={styles.card}>
            <TouchableOpacity onPress={() => getUrl(item.gameName, item.gameId, item.provider)}>
              <LazyImage
                imageUrl={item.gamePic}
                width={(globalStore.screenWidth - 42) / 3}
                height={(globalStore.screenWidth - 42) / 3}
                occupancy="transparent"
                radius={9}
              />
              <Text style={styles.name}>{item.gameName}</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {/* 加载状态 */}
        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={theme.basicColor.newTabSelectYellow} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
        
        {!hasMore && data.length > 0 && (
          <View style={styles.noMoreData}>
            <Text style={styles.noMoreText}>没有更多游戏了</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeCasino;

const styles = StyleSheet.create({
   loadingMore: {
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.basicColor.newFontYellow,
  },
  noMoreData: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  noMoreText: {
    fontSize: 14,
    color: theme.basicColor.newFontYellow,
  },
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
    color: theme.basicColor.newFontRed1,
    fontWeight: '600',
  },
  tabTextActive: {
    fontSize: 12,
    color: theme.basicColor.newTabSelectYellow,
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
