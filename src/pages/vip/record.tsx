import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { Toast } from '@ant-design/react-native';
import { PageContainer, Popup, PopConfirm, Flex } from '@/components';
import IconFont from '@/iconfont';
import { DAY_OF_WEEK, INVITE_STATUS } from '@/constants';
import { cancelInvite, getDetails, getRecordList } from '@/services/user';
import { generateShareImage, onShareAppMessage } from '@/utils/shareImage';
import { tencentUpload } from '@/utils/request';
import { checkInstalledWeChat } from '@/utils/wechat';
import { showLoading, hideLoading, showToast } from '@/utils';
import { styles } from './recordStyle';
import { DetailsProp } from './type';
import { WeChatCoverImage } from './com/weChatCoverImage';

const PAGE_SIZE = 20;

interface ListItem {
  id: number;
  username: string;
  mobile: string;
  startTime: string;
  endTime: string;
}

export default function VipRecordPage() {
  const navigation = useNavigation<any>();
  const [list, setList] = useState<ListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [currentRow, setCurrentRow] = useState<ListItem | undefined>();
  const [isOption, setIsOption] = useState(false);
  const [details, setDetails] = useState<DetailsProp | undefined>();
  const [shareDetail, setShareDetail] = useState<DetailsProp | undefined>();
  const [shareImagePath, setShareImagePath] = useState<string | undefined>();

  const deleteRef = useRef<any>(null);
  const [detailPopupVisible, setDetailPopupVisible] = useState(false);
  const shareContentRef = useRef<any>(null);
  const loadingRef = useRef(false);
  const listLengthRef = useRef(0);
  const onEndReachedCalledDuringMomentum = useRef(true);

  const cdnDomain = (cosPath: string) =>
    cosPath.replace(
      'sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
      'https://g.18qjz.cn',
    );

  const handleUploadImages = useCallback(async (file: string) => {
    try {
      const fl: any = await tencentUpload({
        file,
        filename: file.split('/').pop() as string,
        index: 0,
      });
      if (Number(fl?.code) !== 200) {
        showToast({ title: '资源上传失败', icon: 'error' });
        return '';
      }
      const location = fl.data?.Location || fl?.Location;
      return location ? cdnDomain(location) : '';
    } catch (e) {
      showToast({ title: '资源上传失败', icon: 'error' });
      return '';
    }
  }, []);

  const loadList = useCallback(async (refresh: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (refresh) {
      setRefreshing(true);
      if (listLengthRef.current === 0) {
        setInitialLoading(true);
      }
    } else {
      setLoading(true);
    }

    try {
      const offset = refresh ? 0 : listLengthRef.current;
      const res: any = await getRecordList({
        pageSize: PAGE_SIZE,
        offset,
      });

      const data = res.data || res;
      const rows: ListItem[] = Array.isArray(data.list)
        ? data.list
        : Array.isArray((res as any).list)
        ? (res as any).list
        : [];

      setList(prev => {
        const next = refresh ? rows : [...prev, ...rows];
        listLengthRef.current = next.length;
        return next;
      });
      setComplete(rows.length < PAGE_SIZE);
    } catch (e) {
      Toast.fail('获取贵宾邀请记录失败');
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadList(true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (onEndReachedCalledDuringMomentum.current) {
      return;
    }
    if (!loadingRef.current && !complete && list.length > 0) {
      onEndReachedCalledDuringMomentum.current = true;
      void loadList(false);
    }
  }, [complete, list.length, loadList]);

  const handleRefresh = useCallback(() => {
    void loadList(true);
  }, [loadList]);

  const handleCancelInvite = useCallback(async () => {
    if (!currentRow?.id) return;
    showLoading({ title: '删除中...' });
    try {
      await cancelInvite({ id: currentRow.id } as any);
      await loadList(true);
      setCurrentRow(undefined);
    } catch (e) {
      showToast({ title: '作废失败，请重试', icon: 'error' });
    } finally {
      hideLoading();
    }
  }, [currentRow?.id, loadList]);

  const fetchSimpleDetails = useCallback(async (id: number) => {
    const res: any = await getDetails({ id });
    const data: DetailsProp = (res.data || res) as any;
    setDetails(data);
    return data;
  }, []);

  const handleShare = useCallback(
    async (detail: DetailsProp | undefined) => {
      if (!detail) return;
      try {
        showLoading({ title: '生成分享图片中...' });
        let imagePath = await generateShareImage({
          details: detail,
          width: 750,
          height: 600,
          ref: shareContentRef,
        });

        imagePath = await handleUploadImages(imagePath);
        if (!imagePath) {
          return;
        }

        setShareImagePath(imagePath);

        const sharePayload = {
          title: '',
          imageUrl: imagePath,
          path: `/pages/user/vipCode/index?id=${detail.id}`,
        } as any;

        const isInstalledWeChat: any = await checkInstalledWeChat();
        if (!isInstalledWeChat.result) {
          showToast({
            title: isInstalledWeChat.message,
            icon: 'error',
          });
          return;
        }
        await onShareAppMessage(sharePayload);
      } catch (error) {
        console.error('分享失败:', error);
        showToast({ title: '分享封面图生成失败，请重试', icon: 'error' });
      } finally {
        hideLoading();
      }
    },
    [handleUploadImages],
  );

  const renderItem: ListRenderItem<ListItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={async () => {
          setCurrentRow(item);
          showLoading();
          const detail = await fetchSimpleDetails(item.id);
          setShareDetail(detail);
          hideLoading();
          setDetailPopupVisible(true);
        }}
      >
        <Flex direction="row" justify="between" align="center">
          <Text style={styles.infoText}>贵宾：</Text>
          <Flex style={{ flex: 1 }} direction="row">
            <Text style={[styles.infoText, styles.mr8]}>{item.username}</Text>
            <Text style={styles.infoText}>{item.mobile}</Text>
          </Flex>
          <View>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </View>
        </Flex>
        <View style={styles.itemLine} />
        <Flex style={{ width: '100%' }} direction="row" align="center">
          <Text style={styles.timeText}>
            {dayjs(item.startTime).format('YYYY-MM-DD HH:mm')}
          </Text>
          <Text style={styles.timeText}> ~ </Text>
          <Text style={styles.timeText}>
            {dayjs(item.endTime).format('YYYY-MM-DD HH:mm')}
          </Text>
        </Flex>
      </TouchableOpacity>
    ),
    [fetchSimpleDetails],
  );

  const footer = (
    <View style={{ paddingVertical: 12 }}>
      {loading && list.length > 0 && (
        <ActivityIndicator size="small" color="#666666" />
      )}
      {complete && (
        <Text style={{ textAlign: 'center' }}>
          共 {list?.length ?? 0} 条记录
        </Text>
      )}
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{ text: '贵宾邀请记录', showBack: true }}
      loading={initialLoading && list.length === 0}
    >
      <FlatList
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}
        data={list}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListFooterComponent={footer}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#333333']}
          />
        }
      />

      <PopConfirm
        ref={deleteRef}
        textWeight="bold"
        title="确定要作废此贵宾码？"
        onConfirm={handleCancelInvite}
      />

      <Popup
        visible={detailPopupVisible}
        onClose={() => {
          setDetailPopupVisible(false);
          setIsOption(false);
        }}
        showClose={false}
        minHeight={507}
      >
        <Flex
          style={styles.num}
          direction="row"
          justify="between"
          align="center"
        >
          {details?.status !== 10 &&
          details?.status !== 20 &&
          details?.status !== 5 &&
          details?.leftTime !== 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsOption(v => !v);
              }}
            >
              <IconFont name="more" size={24} color="#333333" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <View>
            <Text style={styles.popTitleText}>贵宾码</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setDetailPopupVisible(false);
              setIsOption(false);
            }}
          >
            <IconFont name="close" size={24} color="#333333" />
          </TouchableOpacity>
        </Flex>

        {isOption && (
          <View style={styles.fixBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fixBtn}
              onPress={() => {
                setIsOption(false);
                setDetailPopupVisible(false);
                navigation.navigate(
                  'VipEditRecord' as never,
                  {
                    currentId: currentRow?.id,
                  } as never,
                );
              }}
            >
              <Text style={styles.color333}>编辑</Text>
            </TouchableOpacity>
            <View style={styles.fixBoxLine} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.fixBtn}
              onPress={() => {
                setIsOption(false);
                setDetailPopupVisible(false);
                deleteRef.current?.open?.();
              }}
            >
              <Text style={styles.redColor}>作废</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentBox}>
          <Flex
            direction="row"
            justify="between"
            style={{ width: '100%', paddingLeft: 16, paddingRight: 16 }}
          >
            <Text style={styles.rowText1}>尊敬的贵宾</Text>
            <Text
              style={[
                styles.tagBox,
                details?.status === 1 && styles.color1,
                (details?.status === 2 || details?.status === 5) &&
                  styles.color2,
                details?.status === 10 && styles.color10,
                details?.status === 20 && styles.color20,
              ]}
            >
              {INVITE_STATUS[details?.status as keyof typeof INVITE_STATUS]}
            </Text>
          </Flex>
          <Text style={styles.inviteCode}>{details?.code}</Text>
          <Text style={styles.popTime}>使用时间:</Text>
          <Flex
            direction="row"
            justify="between"
            align="center"
            style={styles.timeBox}
          >
            <Flex
              direction="column"
              justify="between"
              style={{ marginLeft: 10 }}
            >
              <Flex direction="row" align="center">
                <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                  {`${dayjs(details?.startTime).format('MM')}月${dayjs(
                    details?.startTime,
                  ).format('DD')}日`}
                </Text>
                <Text style={[styles.dateText, styles.mb8]}>
                  {
                    DAY_OF_WEEK[
                      dayjs(
                        details?.startTime,
                      ).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Text style={styles.dateTime}>
                {`${dayjs(details?.startTime).format('HH')}：${dayjs(
                  details?.startTime,
                ).format('mm')}`}
              </Text>
            </Flex>
            <IconFont name="arrows1" size={20} color="#333333" />
            <Flex
              direction="column"
              justify="between"
              style={{ marginLeft: 10 }}
            >
              <Flex direction="row" align="center">
                <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                  {`${dayjs(details?.endTime).format('MM')}月${dayjs(
                    details?.endTime,
                  ).format('DD')}日`}
                </Text>
                <Text style={[styles.dateText, styles.mb8]}>
                  {
                    DAY_OF_WEEK[
                      dayjs(details?.endTime).day() as keyof typeof DAY_OF_WEEK
                    ]
                  }
                </Text>
              </Flex>
              <Text style={styles.dateTime}>
                {`${dayjs(details?.endTime).format('HH')}：${dayjs(
                  details?.endTime,
                ).format('mm')}`}
              </Text>
            </Flex>
          </Flex>
          <Flex direction="row" justify="center" align="center">
            <Text style={styles.dateText}>使用次数：</Text>
            <Text style={styles.dateText}>
              {details?.noLimit ? '不限' : details?.limitTime}
            </Text>
          </Flex>
        </View>

        <View style={styles.popup}>
          <Flex
            style={{ width: '100%', marginTop: 31, marginBottom: 8 }}
            direction="row"
            justify="center"
            align="center"
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancalBtn}
              onPress={() => {
                setDetailPopupVisible(false);
              }}
            >
              <Text>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.confirmBtn, styles.bgColor333]}
              onPress={() => handleShare(shareDetail)}
              disabled={!shareDetail}
            >
              <Text style={{ color: '#ffffff' }}>发送给贵宾</Text>
            </TouchableOpacity>
          </Flex>
        </View>
      </Popup>

      {/* 隐藏的封面图UI */}
      {shareDetail && (
        <WeChatCoverImage
          style={{ position: 'absolute', top: -9999, left: -9999 }}
          shareContentRef={shareContentRef}
          details={shareDetail}
        />
      )}
    </PageContainer>
  );
}
