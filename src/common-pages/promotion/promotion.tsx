/* eslint-disable react-native/no-inline-styles */
import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect, useCallback} from 'react';
import {useInnerStyle} from './promotion.hooks';
import theme from '@style';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  View,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Card from '@basicComponents/card';
import {NoMoreData} from '@/components/basic/default-page';
import {PromotionListItem, getPromotionList} from './promotion.service';
import globalStore from '@/services/global.state';
import NoData from '@/components/basic/error-pages/no-data';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {goTo} from '@/utils';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
const proNew = require('@/assets/imgs/promotion/promotion-new.webp');
const proWhy = require('@/assets/imgs/promotion/pro-right-why.webp');
const amountClaim = require('@/assets/imgs/promotion/claim.webp');
const proAmountImages = [
  require('@/assets/imgs/promotion/pro-amount1.webp'),
  require('@/assets/imgs/promotion/pro-amount2.webp'),
  require('@/assets/imgs/promotion/pro-amount3.webp'),
  require('@/assets/imgs/promotion/pro-amount4.webp'),
];
const Promotion = () => {
  const {i18n} = useTranslation();
  const {
    size: {itemImgWidth, signImgHeight}, //itemImgHeight,
    listStyle,
  } = useInnerStyle();

  const [refreshing, setRefreshing] = useState(false);
  const pageNo = useRef(1);
  const totalPage = useRef(1);
  const [promotionList, setPromotionList] = useState<PromotionListItem[]>([]);
  const tagIndex = 0;

  const {screenHeight} = useSettingWindowDimensions();

  const fetchPageData = useCallback(
    async (isMore = false) => {
      try {
        const pageInfo = await getPromotionList(pageNo.current, tagIndex);
        if (pageInfo?.content) {
          setPromotionList(prev =>
            isMore ? [...prev, ...pageInfo.content] : [...pageInfo.content],
          );
          totalPage.current = pageInfo.totalPages;
        }
      } catch (e) {
        console.error('Error fetching promotions:', e);
      }
    },
    [tagIndex],
  );

  const refreshPage = useCallback(async () => {
    globalStore.globalLoading.next(true);
    pageNo.current = 1;
    await fetchPageData(false);
    globalStore.globalLoading.next(false);
    setRefreshing(false);
  }, [fetchPageData]);

  const loadNextPage = useCallback(async () => {
    if (pageNo.current < totalPage.current) {
      pageNo.current++;
      globalStore.globalLoading.next(true);
      await fetchPageData(true);
      globalStore.globalLoading.next(false);
    }
  }, [fetchPageData]);

  useEffect(() => {
    refreshPage();
  }, [refreshPage]);

  const onPressItemTo = (item: PromotionListItem) => {
    if (!item?.activityUrl) {
      goTo('PromotionDetail', {id: item?.id});
    } else {
      goToUrl(item.activityUrl, item.activityTitle);
    }
  };
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  });
  const [_countdown, setCountdown] = useState(36); // 初始倒计时秒数
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const [visible, setVisible] = useState(false);
  const onPressGetBonus = (amt?: number) => {
    console.log('item', amt);
    // if (item?.activityUrl) {
    //   goToUrl(item.activityUrl, item.activityTitle);
    // }
  };
  const renderRedBonusCard = (item: PromotionListItem) => {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
          marginBottom: 16,
        }}>
        <LinearGradient
          colors={['#FA1C1B', '#A1251D']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{
            borderRadius: 16,
            // overflow: 'hidden',
            position: 'relative',
            padding: 16,
            paddingBottom: 4,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}>
          {/* "New"图标标签 */}
          <View
            style={{
              position: 'absolute',
              top: -3,
              left: -1,
              borderTopLeftRadius: 16,
              borderBottomRightRadius: 20,
              elevation: 4,
              zIndex: 10,
            }}>
            <Image
              source={proNew}
              style={{
                width: 56,
                height: 56,
                resizeMode: 'contain',
              }}
            />
          </View>
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 20,
              elevation: 4,
              zIndex: 10,
              width: 40,
              height: 22,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <NativeTouchableOpacity onPressIn={() => setVisible(true)}>
              <Image
                source={proWhy}
                style={{
                  width: 12,
                  height: 12,
                  resizeMode: 'contain',
                }}
              />
            </NativeTouchableOpacity>
          </View>
          {/* <NativeTouchableOpacity onPress={() => onPressItemTo(item)}> */}
          {/* 标题和倒计时行 */}
          <View style={{marginTop: 12, marginBottom: 20}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 'bold',
                  flex: 1,
                  marginRight: 12,
                }}>
                {i18n.t('promotion.continueBonus')}
              </Text>

              {/* 倒计时 */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginHorizontal: 2,
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                    00
                  </Text>
                </View>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginHorizontal: 2,
                  }}>
                  :
                </Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginHorizontal: 2,
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                    00
                  </Text>
                </View>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginHorizontal: 2,
                  }}>
                  :
                </Text>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 4,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginHorizontal: 2,
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: 16,
                    }}>
                    36
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 奖励图标行 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
              paddingHorizontal: 8,
              position: 'relative',
            }}>
            {[2000, 3000, 4000, 5000].map((amt, idx) => (
              <View key={idx} style={{alignItems: 'center', flex: 1}}>
                {/* 金币图标 */}
                <View
                  style={{
                    width: 25,
                    height: 25,
                    position: 'relative',
                    left: 3,
                  }}>
                  <Image
                    source={proAmountImages[idx]}
                    style={{
                      width: 25,
                      height: 25,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: '#fff7e3',
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}>
                  {i18n.t('recharge-page.label.max')}
                </Text>
                <Text
                  style={{
                    color: '#FFD700',
                    fontSize: 16,
                    // fontWeight: 'bold',
                    marginBottom: 8,
                    fontStyle: 'italic',
                  }}>
                  {amt}Rs
                </Text>

                {/* 完成状态勾选 */}
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: '#9932CC',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 4,
                    position: 'relative',
                  }}>
                  {item.buttonStyle === 1 ? (
                    <Image
                      source={amountClaim}
                      style={{
                        width: 16,
                        height: 16,
                      }}
                    />
                  ) : (
                    <view style={styles.checkmark} />
                  )}
                </View>
                <Text style={{color: '#fff', fontSize: 11, fontWeight: '500'}}>
                  {idx === 0
                    ? '2nd'
                    : idx === 1
                    ? '3st'
                    : idx === 2
                    ? '5st'
                    : '1st'}
                </Text>
              </View>
            ))}

            {/* 紫色进度条 */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={['#C803FF', '#FF0085']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(1 * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
          {/* 获取奖励按钮 */}
          <NativeTouchableOpacity
            onPress={() => onPressGetBonus(item.amount || 0)}
            style={{
              alignItems: 'center',
            }}>
            <LinearGradient
              colors={['#FE8A1A', '#FEBC0A']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={{
                position: 'relative',
                alignItems: 'center',
                marginBottom: 8,
                width: '80%',
                borderRadius: 25,
                paddingVertical: 12,
                paddingHorizontal: 60,
                shadowColor: '#FF6347',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
              }}>
              <Text
                style={{
                  color: theme.fontColor.white60,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                {i18n.t('rebate.get-bonus')}
              </Text>
            </LinearGradient>
          </NativeTouchableOpacity>
          {/* </NativeTouchableOpacity> */}
        </LinearGradient>
      </Animated.View>
    );
  };
  const renderItem = ({item}: ListRenderItemInfo<PromotionListItem>) => {
    if (item.activityTitle === 'Recharge for bonus') {
      return renderRedBonusCard(item);
    }
    return (
      <View
        style={[
          // theme.border.primary50,
          theme.borderRadius.m,
          theme.margin.bottomMd,
          // {backgroundColor: theme.basicColor.newBgInOne},
        ]}>
        <Card>
          <NativeTouchableOpacity onPress={() => onPressItemTo(item)}>
            <Card.Image
              style={[
                theme.flex.centerByCol,
                theme.borderRadius.m,
                theme.position.rel,
              ]}
              width={itemImgWidth}
              height={item.activityType === 'signin' ? signImgHeight : 122}
              imageUrl={item.activityIcon}
            />
          </NativeTouchableOpacity>
        </Card>
      </View>
    );
  };

  return (
    <LazyImageLGBackground style={{height: screenHeight}}>
      <DetailNavTitle title={i18n.t('promotion.title')} hideServer />
      <FlatList
        data={promotionList}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPage();
            }}
          />
        }
        ListEmptyComponent={
          <View style={theme.padding.xxl}>
            <NoData />
          </View>
        }
        onEndReached={loadNextPage}
        contentContainerStyle={[theme.padding.lrl, listStyle.list]}
        ListFooterComponent={
          promotionList.length > 0 && pageNo.current >= totalPage.current ? (
            <NoMoreData />
          ) : null
        }
      />
      <Modal
        animationType="none"
        transparent
        visible={visible}
        onRequestClose={() => {
          setVisible(false);
        }}>
        <View style={modalStyles.overlay}>
          <View
            style={[
              modalStyles.container,
              {backgroundColor: theme.basicColor.newBgInTwo},
            ]}>
            <Text style={modalStyles.title}>{i18n.t('label.prompt')}</Text>
            <Text style={modalStyles.message}>
              {
                'This is a detailed explanation of weekly salary, to be determined ...'
              }
            </Text>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={modalStyles.button}
                onPress={() => {
                  setVisible(false);
                }}>
                <Text style={modalStyles.confirmText}>
                  {i18n.t('label.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LazyImageLGBackground>
  );
};
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '75%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.fontColor.white,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.fontColor.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: '#999',
    fontSize: 16,
  },
  confirmText: {
    color: theme.basicColor.newFontYellow,
    fontSize: 16,
    fontWeight: '600',
  },
});
const styles = StyleSheet.create({
  checkmark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.basicColor.white,
  },
  progressSection: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  progressLabel: {
    marginBottom: theme.paddingSize.xxs,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingLeft: 15,
    paddingRight: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: theme.borderRadiusSize.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadiusSize.xs,
  },
  progressBarText: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingLeft: 15,
    paddingRight: 20,
  },
});

export default Promotion;
