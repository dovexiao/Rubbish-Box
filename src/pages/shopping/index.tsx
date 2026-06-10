import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getGoodsList } from '@/services/mall';
import Order from '@/pages/order';
import styles from './styles';
import { showToast } from '@/utils';
import { fontSize, px } from '@/utils/ui';

type GoodsItemDTO = {
  id: number;
  productName: string;
  mainImage: string;
  currentPrice: number;
  originalPrice: number;
  saleNum: number;
};

type GoodsCardProps = {
  data: GoodsItemDTO;
  onPress: (id: number) => void;
};

const CARD_WIDTH = (Dimensions.get('window').width - px(32) - px(13)) / 2;

const GoodsCard: React.FC<GoodsCardProps> = ({ data, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: px(12),
        marginBottom: px(12),
        overflow: 'hidden',
        width: CARD_WIDTH,
      }}
      onPress={() => onPress(data.id)}
    >
      <Image
        source={{ uri: data.mainImage }}
        style={{ width: '100%', aspectRatio: 1, borderRadius: px(12) }}
        resizeMode="cover"
      />
      <View style={{ paddingLeft: px(13), paddingBottom: px(12) }}>
        <Text
          style={{
            fontSize: fontSize(14),
            color: '#333333',
            fontWeight: 'bold',
            marginVertical: px(8),
          }}
          numberOfLines={2}
        >
          {data.productName}
        </Text>
        <Flex align="center">
          <Text
            style={{
              color: '#FF0000',
              fontSize: fontSize(14),
              fontWeight: 'bold',
            }}
          >
            ¥{data.currentPrice}
          </Text>
          <Text
            style={{
              fontSize: fontSize(12),
              marginLeft: px(4),
              color: '#CCCCCC',
              textDecorationLine: 'line-through',
            }}
          >
            ¥{data.originalPrice}
          </Text>
        </Flex>
      </View>
    </TouchableOpacity>
  );
};

const PAGE_SIZE = 10;

export default function Shopping() {
  const navigation = useNavigation<any>();

  const [goodsList, setGoodsList] = useState<GoodsItemDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const loadList = useCallback(
    async (reload: boolean) => {
      if (loading) return;

      setLoading(true);
      try {
        const offset = reload ? 0 : goodsList.length;
        const res = await getGoodsList({
          offset,
          pageSize: PAGE_SIZE,
        });

        if (res.code === 200 && res.success) {
          const list: GoodsItemDTO[] = (res.data?.list || []) as GoodsItemDTO[];
          const next = reload ? list : [...goodsList, ...list];
          setGoodsList(next);
          setComplete(list.length < PAGE_SIZE);
        } else {
          showToast({
            title: res.msg || res.message || '获取商品列表失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '获取商品列表失败', icon: 'info' });
      } finally {
        setLoading(false);
      }
    },
    [goodsList, loading],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const handlePressItem = useCallback(
    (id: number) => {
      navigation.navigate('GoodsDetail', { id });
    },
    [navigation],
  );

  const footer =
    currentTab === 0 ? (
      <View style={styles.bottomBtnContent}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.bottomBtn}
          onPress={() => {
            navigation.navigate('PickupCodeDaily');
          }}
        >
          <Text style={styles.bottomBtnText}>绑定礼品卡</Text>
          <AppIcon name="a-nextpage" color="#333333" size={px(20)} />
        </TouchableOpacity>
      </View>
    ) : null;

  const renderItem: ListRenderItem<GoodsItemDTO> = useCallback(
    ({ item }) => <GoodsCard data={item} onPress={handlePressItem} />,
    [handlePressItem],
  );

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '泊刻地锁商城',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={currentTab === 0 && loading && !goodsList.length}
      footer={footer}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.tabContainer}>
          <View style={styles.tabItemList}>
            <TouchableOpacity
              style={[styles.tabItem, currentTab === 0 && styles.tabItemActive]}
              onPress={() => setCurrentTab(0)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.tabItemText,
                  currentTab === 0 && styles.tabItemTextActive,
                ]}
              >
                商品
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, currentTab === 1 && styles.tabItemActive]}
              onPress={() => setCurrentTab(1)}
              activeOpacity={1}
            >
              <Text
                style={[
                  styles.tabItemText,
                  currentTab === 1 && styles.tabItemTextActive,
                ]}
              >
                订单
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tabContent}>
          {currentTab === 0 ? (
            <FlatList
              style={{ flex: 1 }}
              data={goodsList}
              keyExtractor={item => String(item.id)}
              numColumns={2}
              renderItem={renderItem}
              contentContainerStyle={styles.goodsListContent}
              columnWrapperStyle={styles.goodsList}
              onEndReached={() => {
                if (!loading && !complete) {
                  void loadList(false);
                }
              }}
              onEndReachedThreshold={0.3}
            />
          ) : (
            <View style={styles.orderListContainer}>
              <Order embedded />
            </View>
          )}
        </View>
      </View>
    </PageContainer>
  );
}
