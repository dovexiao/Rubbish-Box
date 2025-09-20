/* eslint-disable react-native/no-inline-styles */
import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {useInnerStyle} from './promotion.hooks';
import {useFocusEffect} from '@react-navigation/native';
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
  Platform,
} from 'react-native';
import Card from '@basicComponents/card';
import {NoMoreData} from '@/components/basic/default-page';
import {
  PromotionListItem,
  getPromotionList,
  getReceiveSevenDayReward,
  getListRecharge,
  getSevenDayRewards,
} from './promotion.service';
import globalStore from '@/services/global.state';
import NoData from '@/components/basic/error-pages/no-data';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {goTo, goToWithLogin} from '@/utils';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
import GetBonusModal from './components/get-bonus-modal';
import LazyImage from '@/components/basic/image/lazy-image';
import DeviceInfo from 'react-native-device-info';
import CountDown from './components/count-down';

const proNew = require('@/assets/imgs/promotion/promotion-new.webp');
const proWhy = require('@/assets/imgs/promotion/pro-right-why.webp');
const amountClaim = require('@/assets/imgs/promotion/claim.webp');
const proAmountImages = [
  require('@/assets/imgs/promotion/pro-amount1.webp'),
  require('@/assets/imgs/promotion/pro-amount2.webp'),
  require('@/assets/imgs/promotion/pro-amount3.webp'),
  require('@/assets/imgs/promotion/pro-amount4.webp'),
];
const proAmountSevenImages = [
  require('@/assets/imgs/promotion/amt_10.webp'),
  require('@/assets/imgs/promotion/amt_20.webp'),
  require('@/assets/imgs/promotion/amt_30.webp'),
  require('@/assets/imgs/promotion/amt_40.webp'),
  require('@/assets/imgs/promotion/amt_50.webp'),
  require('@/assets/imgs/promotion/amt_60.webp'),
  require('@/assets/imgs/promotion/amt_100.webp'),
];
const proAmountSevenTopImages = [
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/box_50.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/pro-amount.webp'),
  require('@/assets/imgs/promotion/box_80.webp'),
];
const Promotion = () => {
  const {i18n} = useTranslation();
  const {
    size: {itemImgWidth, signImgHeight}, //itemImgHeight,
    listStyle,
  } = useInnerStyle();
  const [isXiaomi, setIsXiaomi] = useState(false);
  useEffect(() => {
    const getDeviceBrand = async () => {
      const manufacturer = await DeviceInfo.getManufacturer();
      setIsXiaomi(manufacturer.toLowerCase().includes('xiaomi'));
    };
    getDeviceBrand();
  }, []);
  const [refreshing, setRefreshing] = useState(false);
  const pageNo = useRef(1);
  const totalPage = useRef(1);
  const [promotionList, setPromotionList] = useState<PromotionListItem[]>([]);
  const tagIndex = 0;
  const [isImageVisible, setIsImageVisible] = useState(false);

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
  const [sevenInfo, setSevenInfo] = useState<any>([]);
  const [canGetNum, setCanGetNum] = useState(0); //可领取数量
  const [rechargeInfo, setRechargeInfo] = useState<any>({});
  const [currentTime, setCurrentTime] = useState(0);
  const [isCountdownExpired, setIsCountdownExpired] = useState(false);
  const fetchSevenInfo = useCallback(async () => {
    //七日
    try {
      const sevenRes = await getSevenDayRewards();
      // const sevenRes = [
      //   {
      //     amount: 10,
      //     finished: true,
      //     received: true,
      //     day: 1,
      //   },
      //   {
      //     amount: 10,
      //     finished: true,
      //     received: true,
      //     day: 2,
      //   },
      //   {
      //     amount: 10,
      //     finished: true,
      //     received: false,
      //     day: 3,
      //   },
      //   {
      //     amount: 10,
      //     finished: false,
      //     received: false,
      //     day: 4,
      //   },
      //   {
      //     amount: 10,
      //     finished: false,
      //     received: false,
      //     day: 5,
      //   },
      //   {
      //     amount: 10,
      //     finished: false,
      //     received: false,
      //     day: 6,
      //   },
      //   {
      //     amount: 10,
      //     finished: true,
      //     received: false,
      //     day: 7,
      //   },
      // ];
      setSevenInfo(sevenRes);
      if (sevenRes?.length) {
        setCanGetNum(
          sevenRes.filter((item: any) => item?.finished && !item?.received)
            .length,
        );
      }
    } catch (e) {
      console.error('Error fetching promotions:', e);
    }
  }, []);
  const countHideAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (currentTime <= 0 && currentTime !== 0) {
      // 倒计时结束，触发隐藏动画
      setIsCountdownExpired(true);

      // 根据用户偏好，使用动画驱动的实时效果
      Animated.timing(countHideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // 动画完成后，可以执行其他隐藏逻辑
        console.log('倒计时功能已隐藏');
      });
    }
  }, [currentTime, countHideAnim]);
  const fetchRechargeInfo = useCallback(async () => {
    //查看复充列表
    try {
      const rechargeInfo = await getListRecharge();
      if (rechargeInfo?.countdownTimestamp) {
        const futureTimestamp = rechargeInfo?.countdownTimestamp; // 目标时间戳（毫秒）
        const currentTimestamp = Date.now();
        const remainingTimeInMillis = futureTimestamp - currentTimestamp;
        setCurrentTime(remainingTimeInMillis);

        // 检查是否已经过期
        if (remainingTimeInMillis <= 0) {
          setIsCountdownExpired(true);
          countHideAnim.setValue(0);
        }
      }
      setRechargeInfo(rechargeInfo);
    } catch (e) {
      console.error('111111111Error fetching promotions:', e);
    }
  }, [countHideAnim]);
  useFocusEffect(
    useCallback(() => {
      // 启动动画效果
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      // 调用接口获取数据
      fetchSevenInfo();
      fetchRechargeInfo();
    }, [fetchSevenInfo, fetchRechargeInfo, fadeAnim]),
  );
  // 复充
  const onPressGoDeposit = useCallback(() => {
    goToWithLogin(i18n.t('home.tab.deposit'));
  }, [i18n]);
  const renderRedBonusCard = useMemo(() => {
    // rechargeInfo
    return (
      <Animated.View
        style={{
          // opacity: fadeAnim,
          // transform: [
          //   {
          //     scale: fadeAnim.interpolate({
          //       inputRange: [0, 1],
          //       outputRange: [0.95, 1],
          //     }),
          //   },
          // ],
          marginTop: 10,
          marginBottom: 2,
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
              elevation: 100,
              zIndex: 10,
              backgroundColor: 'transparent',
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
              elevation: 100,
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
                  backgroundColor: 'transparent',
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

              <CountDown
                remain={currentTime ? Math.round(currentTime / 1000) : 0}
              />
              {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
              </View> */}
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
              backgroundColor: 'transparent',
            }}>
            {[2000, 3000, 4000, 5000].map((_amt, idx) => {
              const logs = rechargeInfo?.rechargeLogs || [];
              const currentReItem = logs[idx];
              return (
                <View key={idx} style={{alignItems: 'center', flex: 1}}>
                  {/* 金币图标 */}
                  <View
                    style={{
                      width: 54,
                      height: 63,
                      position: 'relative',
                      left: 3,
                      top: idx === 0 ? 3 : 0,
                    }}>
                    <Image
                      source={proAmountImages[idx]}
                      style={{
                        width: 54,
                        height: 63,
                        resizeMode: 'contain',
                      }}
                    />
                  </View>

                  {/* 完成状态勾选 */}
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      // backgroundColor: '#9932CC',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 4,
                      position: 'relative',
                      zIndex: 10,
                    }}>
                    {currentReItem?.succeseFlag ? (
                      <Image
                        source={amountClaim}
                        style={{
                          width: 16,
                          height: 16,
                          zIndex: 10,
                          transform: [{scale: 1}],
                        }}
                      />
                    ) : (
                      <View style={styles.checkmark} />
                    )}
                  </View>
                  <Text
                    style={{color: '#fff', fontSize: 11, fontWeight: '500'}}>
                    {idx === 0
                      ? '2nd'
                      : idx === 1
                      ? '3st'
                      : idx === 2
                      ? '4st'
                      : '5st'}
                  </Text>
                </View>
              );
            })}
            {/* 紫色进度条 */}
            <View
              style={[
                styles.progressSection,
                {
                  bottom: Platform.select({
                    web: 22,
                    android: isXiaomi ? 28 : 24,
                  }),
                },
              ]}>
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
            onPress={() => onPressGoDeposit()}
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
                shadowColor: '#FF6347',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  color: theme.fontColor.white60,
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                {i18n.t('rebate.go-get-bonus')}
              </Text>
            </LinearGradient>
          </NativeTouchableOpacity>
          {/* </NativeTouchableOpacity> */}
        </LinearGradient>
      </Animated.View>
    );
  }, [
    currentTime,
    i18n,
    isXiaomi,
    onPressGoDeposit,
    rechargeInfo?.rechargeLogs,
  ]);
  // 七日连冲
  const [canGetAmount, setCanGetAmount] = useState(0); //可领取数量
  const bounceAnim = useRef(new Animated.Value(2)).current;
  useEffect(() => {
    const createBounceAnimation = () => {
      return Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 2.3,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1.7,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
    };

    const startBounceLoop = () => {
      Animated.loop(createBounceAnimation(), {
        iterations: -1, // 无限循环
      }).start();
    };

    // 延迟开始跳动动画，让页面先完成淡入
    const timer = setTimeout(() => {
      startBounceLoop();
    }, 800);

    return () => {
      clearTimeout(timer);
      bounceAnim.stopAnimation();
      // bounceAnim1.stopAnimation();
    };
  }, [bounceAnim]);
  const getSevenContinuousBonus = useCallback((item: any) => {
    if (item?.finished && !item?.received) {
      let arr = [];
      arr.push(item?.id);
      getReceiveSevenDayReward(arr)
        .then(res => {
          if (res?.code === 200) {
            setCanGetAmount(item?.amount || 0);
            setIsImageVisible(true);
          }
        })
        .catch(() => {});
    }
  }, []);
  const onPressGetBonus1 = useCallback(() => {
    console.log('onPressGetBonus1');
    const arr = sevenInfo.filter(
      (item: any) => item?.finished && !item?.received,
    );
    if (arr.length <= 0) {
      console.log('没有可领取的');
      onPressGoDeposit();
      return;
    }
    let amt = 0;
    arr.forEach((item: any) => {
      amt += item?.amount || 0;
    });
    const idList = arr.map((item: any) => item.id);
    if (idList.length > 0) {
      getReceiveSevenDayReward(idList)
        .then(res => {
          if (res?.code === 200) {
            setCanGetAmount(amt);
            setIsImageVisible(true);
          }
        })
        .catch(() => {});
    }
  }, [onPressGoDeposit, sevenInfo]);
  const renderSevenContinuousBonusCard = useMemo(() => {
    return (
      <View
        style={{
          marginBottom: 2,
        }}>
        <LinearGradient
          colors={['#FA1C1B', '#A1251D']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={{
            borderRadius: 16,
            position: 'relative',
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
              elevation: 100,
              zIndex: 10,
              backgroundColor: 'transparent',
            }}>
            <Image
              source={proNew}
              style={{
                width: 56,
                height: 56,
                resizeMode: 'contain',
                // opacity: fadeAnim,
                // transform: [
                //   {
                //     scale: fadeAnim.interpolate({
                //       inputRange: [0, 1],
                //       outputRange: [0.95, 1],
                //     }),
                //   },
                // ],
              }}
            />
          </View>
          <View style={{marginTop: 12, marginBottom: 17}}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 101,
                zIndex: 11,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  flex: 1,
                }}>
                {i18n.t('promotion.sevenContinueBonus')}
              </Text>
            </View>
          </View>

          {/* 领取连充奖励图标行 */}
          <View key={'first-row'} style={{alignItems: 'center', flex: 1}}>
            {/* 7天连充奖励网格布局 */}
            <View
              style={{
                width: '100%',
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                paddingLeft: 5,
                paddingRight: 5,
              }}>
              {proAmountSevenImages.map((img, index) => {
                const imgW = 28;
                const currentItem = sevenInfo[index] || {};
                return (
                  <View
                    key={`seven-day${index + 1}`}
                    style={{
                      flexBasis:
                        index !== proAmountSevenImages.length - 1
                          ? '25%'
                          : '50%',
                    }}>
                    {/* 跳动时领取 */}
                    <NativeTouchableOpacity
                      onPressIn={() => {
                        getSevenContinuousBonus(currentItem);
                      }}>
                      <LinearGradient
                        key={`day${index + 1}`}
                        colors={['#C803FF', '#FF0085']}
                        start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={{
                          borderRadius: 12,
                          marginLeft: 5,
                          marginRight: 5,
                          marginBottom: 8,
                          height: 80,
                        }}>
                        <View
                          style={{
                            backgroundColor: currentItem?.finished
                              ? '#C803FF'
                              : '#999999',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 4,
                            paddingBottom: 4,
                          }}>
                          <Text
                            style={{
                              color: '#FFFFFF',
                              fontSize: 10,
                            }}>
                            Day{index + 1}
                          </Text>
                        </View>
                        {/* 两张图片垂直排列 */}
                        {index !== proAmountSevenImages.length - 1 ? (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Animated.Image
                              source={proAmountSevenTopImages[index]}
                              style={{
                                width: imgW,
                                height: imgW,
                                resizeMode: 'contain',
                                transform: [
                                  {
                                    scale: index === 2 ? 2 : 1,
                                    // scale:
                                    //   currentItem?.finished &&
                                    //   !currentItem?.received &&
                                    //   index === 2
                                    //     ? bounceAnim
                                    //     : 1,
                                  },
                                ],
                              }}
                            />
                            {currentItem?.finished && !currentItem?.received ? (
                              <View
                                style={{
                                  position: 'relative',
                                  backgroundColor: 'transparent',
                                }}>
                                <LazyImage
                                  imageUrl={proAmountSevenImages[index]}
                                  width={38}
                                  height={18}
                                  style={{
                                    backgroundColor: 'transparent',
                                  }}
                                />
                                <LazyImage
                                  imageUrl={require('@/assets/imgs/promotion/pro_btn_bg.webp')}
                                  width={66}
                                  height={22}
                                  style={{
                                    zIndex: -1,
                                    position: 'absolute',
                                    left: -14,
                                  }}
                                />
                              </View>
                            ) : (
                              <Animated.Image
                                source={proAmountSevenImages[index]}
                                style={{
                                  width: 38,
                                  height: 18,
                                  resizeMode: 'contain',
                                  transform: [
                                    {
                                      scale: 1,
                                    },
                                  ],
                                }}
                              />
                            )}
                          </View>
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Animated.Image
                              source={proAmountSevenTopImages[index]}
                              style={{
                                width: imgW,
                                height: imgW,
                                resizeMode: 'contain',
                                transform: [
                                  {
                                    scale: 2,
                                    // scale:
                                    //   currentItem?.finished &&
                                    //   !currentItem?.received
                                    //     ? bounceAnim
                                    //     : 2,
                                  },
                                ],
                              }}
                            />
                            {currentItem?.finished && !currentItem?.received ? (
                              <View
                                style={{
                                  position: 'relative',
                                  backgroundColor: 'transparent',
                                  marginLeft: 30,
                                }}>
                                <LazyImage
                                  imageUrl={proAmountSevenImages[index]}
                                  width={40}
                                  height={18}
                                  style={{
                                    backgroundColor: 'transparent',
                                  }}
                                />
                                <LazyImage
                                  imageUrl={require('@/assets/imgs/promotion/pro_btn_bg.webp')}
                                  width={66}
                                  height={22}
                                  style={{
                                    zIndex: -1,
                                    position: 'absolute',
                                    left: -13,
                                    top: -1,
                                  }}
                                />
                              </View>
                            ) : (
                              <Image
                                source={proAmountSevenImages[index]}
                                style={{
                                  width: 40,
                                  height: 18,
                                  resizeMode: 'contain',
                                  marginLeft: 30,
                                }}
                              />
                            )}
                          </View>
                        )}
                        {currentItem?.received && (
                          <View
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                            }}>
                            <LazyImage
                              imageUrl={require('@/assets/imgs/promotion/selected.webp')}
                              width={15}
                              height={15}
                            />
                          </View>
                        )}
                      </LinearGradient>
                    </NativeTouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
          {/* 获取奖励按钮 */}
          <NativeTouchableOpacity
            onPress={() => onPressGetBonus1()}
            // disabled={canGetNum <= 0}
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
                {canGetNum > 1
                  ? i18n.t('rebate.get-all-bonus')
                  : canGetNum <= 0
                  ? i18n.t('rebate.go-get-bonus')
                  : i18n.t('rebate.get-bonus')}
              </Text>
            </LinearGradient>
          </NativeTouchableOpacity>
        </LinearGradient>
      </View>
    );
  }, [canGetNum, getSevenContinuousBonus, i18n, onPressGetBonus1, sevenInfo]);
  const renderItem = ({item}: ListRenderItemInfo<PromotionListItem>) => {
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

  const renderListHeader = useCallback(() => {
    if (rechargeInfo?.showFlag && !isCountdownExpired) {
      return (
        <View>
          {renderSevenContinuousBonusCard}
          {renderRedBonusCard}
        </View>
      );
    } else {
      return renderSevenContinuousBonusCard;
    }
  }, [
    rechargeInfo?.showFlag,
    renderRedBonusCard,
    renderSevenContinuousBonusCard,
    isCountdownExpired,
  ]);
  return (
    <LazyImageLGBackground style={{height: screenHeight}}>
      <DetailNavTitle title={i18n.t('promotion.title')} hideServer />
      <FlatList
        data={promotionList}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        ListHeaderComponent={renderListHeader}
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

      <GetBonusModal
        isImageVisible={isImageVisible}
        amount={canGetAmount || 0}
        setIsImageVisible={setIsImageVisible}
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
    backgroundColor: theme.fontColor.white60,
  },
  progressSection: {
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1,
    elevation: 1,
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
    height: 6,
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
