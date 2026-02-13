import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import IconFont from '@/iconfont';
import { getAddressList } from '@/services/user';
import { deleteAddress } from '@/services/setting';
import PopConfirm from '@/components/popConfirm';
import styles from './styles';
import GradientButton from '@/components/GradientButton';

interface AddressItem {
  id: number | string;
  name: string;
  phone: string;
  province: string;
  city: string;
  county: string;
  detailAddress: string;
}

const PAGE_SIZE = 10;

export default function Address() {
  const navigation = useNavigation<any>();
  const [list, setList] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const deleteRef = React.useRef<any>(null);
  const [currentId, setCurrentId] = useState<number | string | null>(null);

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (loading) return;

      if (refresh) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = refresh ? 0 : list.length;
        const res: any = await getAddressList({ pageSize: PAGE_SIZE, offset });
        const dataList: AddressItem[] = Array.isArray(res?.list)
          ? res.list
          : Array.isArray(res?.data?.list)
          ? res.data.list
          : [];

        setList(prev => (refresh ? dataList : [...prev, ...dataList]));
        setHasMore(dataList.length >= PAGE_SIZE);
      } catch (e) {
        Toast.fail('获取地址列表失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [list.length, loading],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const handleDelete = async () => {
    if (!currentId) return;
    try {
      const res: any = await deleteAddress({ id: currentId });
      const ok = Number(res?.code) === 200 || res === true;
      Toast.show(ok ? '删除地址成功' : res?.msg || res?.message || '删除失败');
      if (ok) {
        void loadList(true);
      }
    } catch (e) {
      Toast.fail('删除失败');
    }
  };

  const renderItem: ListRenderItem<AddressItem> = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.addressItem}
        onPress={() => {
          // 如后续有地址选择场景，可在此回传所选地址
        }}
      >
        <View style={styles.rowTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPhone}>{item.phone}</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate(
                'AddressCreate' as never,
                {
                  id: item.id,
                } as never,
              );
            }}
          >
            <Text style={styles.itemEdit}>编辑</Text>
          </TouchableOpacity>
          <IconFont name="a-headfor-20" size={12} color="#333333" />
        </View>
        <View style={styles.rowBottom}>
          <Text style={styles.itemAddress}>{`${item.province || ''}${
            item.city || ''
          }${item.county || ''}${item.detailAddress || ''}`}</Text>
          <TouchableOpacity
            style={styles.itemDel}
            onPress={() => {
              setCurrentId(item.id);
              deleteRef.current?.open?.();
            }}
          >
            <Text style={styles.itemDelText}>删除</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: AddressItem, index: number) =>
    `${item.id ?? 'addr'}-${index}`;

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>暂无地址</Text>
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '我的地址',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading}
    >
      <View style={styles.container}>
        <FlatList
          data={list}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listWrapper}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!loading && hasMore) {
              void loadList(false);
            }
          }}
          refreshing={refreshing}
          onRefresh={() => void loadList(true)}
          ListEmptyComponent={!initialLoading ? renderEmpty : null}
        />

        <View style={styles.footerBtnWrap}>
          <GradientButton
            btnBorderRadius={16}
            width={196}
            height={48}
            colors={['#4A4A4A', '#282828']}
            style={styles.addBtn}
            onPress={() => {
              navigation.navigate('AddressCreate' as never);
            }}
          >
            <Text style={styles.addBtnText}>添加地址</Text>
          </GradientButton>
        </View>

        <PopConfirm
          ref={deleteRef}
          title="确定要删除此地址"
          cancelText="暂不删除"
          confirmText="确定删除"
          onConfirm={handleDelete}
        />
      </View>
    </PageContainer>
  );
}
