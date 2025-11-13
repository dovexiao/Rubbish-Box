import React, {useEffect, useCallback, useState} from 'react';
import {View, Image, StyleSheet, Modal} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Text from '@basicComponents/text';
import LinearGradient from '@/components/basic/linear-gradient';
import useDailyRewardsStore, {useHideDailyRewards} from './daily-rewards.store';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import {LazyImageBackground} from '@/components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {getActivityWeekSignInList, getActivityReceiveReward} from './daily-rewards.service';
import {useTranslation} from 'react-i18next';
import {goTo, goToWithLogin} from '@/utils';
import GetBonusModal from '@/common-pages/promotion/components/get-bonus-modal';

const Days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DailyRewardsModal: React.FC = () => {
  const {calcActualSize} = useScreenSize();
  const {i18n} = useTranslation();
  const visible = useDailyRewardsStore(state => state.visible);

  const [sevenInfo, setSevenInfo] = useState([]);
  const [canGetBonus, setCanGetBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [isImageVisible, setIsImageVisible] = useState(false);

  // 创建缩放动画值，初始值为1（正常大小）
  const coinScale = useSharedValue(1);

  // 呼吸动画效果：周期性放大缩小
  useEffect(() => {
    coinScale.value = withRepeat(
      withSequence(
        // 从1变大到1.15
        withTiming(1.15, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        // 从1.15变小到1
        withTiming(1, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1, // 无限循环
      true, // 反向播放
    );

    return () => {
      coinScale.value = coinScale.value;
    };
  }, [coinScale]);

  // 应用动画样式
  const coinAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: coinScale.value}],
    };
  }, [coinScale]);

  const dynamicStyles = {
    backgroundImage: {
      width: calcActualSize(308),
      height: calcActualSize(387),
    },
    content: {
      flex: 1,
      paddingHorizontal: calcActualSize(10),
    },
    ruleContainer: {
      marginTop: calcActualSize(53),
      marginLeft: calcActualSize(5),
    },
    ruleIcon: {
      width: calcActualSize(14),
      height: calcActualSize(14),
      marginRight: calcActualSize(4),
    },
    ruleText: {
      fontSize: calcActualSize(12),
      lineHeight: calcActualSize(14),
    },
    titleContainer: {
      maxWidth: calcActualSize(180),
      height: calcActualSize(55),
      marginLeft: calcActualSize(5),
    },
    title: {
      fontSize: calcActualSize(18),
      lineHeight: calcActualSize(24),
    },
    rewardsContainer: {
      width: calcActualSize(288),
      borderRadius: calcActualSize(12),
      paddingHorizontal: calcActualSize(10),
      paddingVertical: calcActualSize(14),
      rowGap: calcActualSize(10),
      columnGap: calcActualSize(28 / 3),
    },
    rewardItem: {
      width: calcActualSize(60),
      height: calcActualSize(77),
      borderRadius: calcActualSize(8),
      paddingVertical: calcActualSize(5),
    },
    dayText: {
      fontSize: calcActualSize(9),
      lineHeight: calcActualSize(10),
      marginBottom: calcActualSize(6),
    },
    coinContainer: {
      marginBottom: calcActualSize(6),
    },
    coinIcon: {
      width: calcActualSize(24),
      height: calcActualSize(24),
    },
    amountText: {
      fontSize: calcActualSize(14),
      lineHeight: calcActualSize(20),
    },
    buttonContainer: {
      width: calcActualSize(288),
      height: calcActualSize(44),
      marginTop: calcActualSize(10),
      borderRadius: calcActualSize(24),
    },
    selectedIcon: {
      width: calcActualSize(35),
      height: calcActualSize(30),
    },
    buttonText: {
      fontSize: calcActualSize(14),
    },
    closeIcon: {
      width: calcActualSize(38),
      height: calcActualSize(38),
    },
  };

  // 获取7天活动信息
  const fetchSevenInfo = useCallback(async () => {
    try {
      const sevenRes = await getActivityWeekSignInList();
      console.log('7天活动信息', sevenRes);
      if (sevenRes?.length) {
        setSevenInfo(sevenRes);
        setCanGetBonus(
          sevenRes.some((item: any) => item?.status === 0)
        );
      }
    } catch (error: unknown) {
      console.error('获取7天活动信息失败', error);
    }
  }, []);

  // 领取当天签到奖励
  const getDailyRewards = useCallback(async () => {
    try {
      const canGetBonusItems: any[] = sevenInfo.filter((item: any) => item?.status === 0);
      let ids: any[] = [];
      if (canGetBonusItems.length === 1 && canGetBonusItems[0].id) {
        ids.push(canGetBonusItems[0].id);
      } else {
        return;
      }
      const res = await getActivityReceiveReward(ids);
      console.log('领取当天签到奖励', res);
      fetchSevenInfo();
      setBonusAmount(canGetBonusItems[0]?.rewardAmount || 0);
      setIsImageVisible(true);
    } catch (error: unknown) {
      console.error('领取当天签到奖励失败', error);
    }
  }, [sevenInfo]);

  useEffect(() => {
    if (visible) {
      fetchSevenInfo();
    }
  }, [fetchSevenInfo, visible]);

  if (!visible) return null;

  return (
    <>
      <Modal
        transparent
        visible={visible}
        onRequestClose={useHideDailyRewards}
        animationType="fade">
        <View style={styles.overlay}>
          <LazyImageBackground
            width={dynamicStyles.backgroundImage.width}
            height={dynamicStyles.backgroundImage.height}
            imageUrl={require('@assets/imgs/promotion/daily-rewards-bg.webp')}>
            <View style={dynamicStyles.content}>
              {/* 规则按钮 */}
              <NativeTouchableOpacity
                style={[styles.ruleContainer, dynamicStyles.ruleContainer]}>
                <Image
                  source={require('@assets/imgs/promotion/rule-icon.webp')}
                  style={dynamicStyles.ruleIcon}
                />
                <Text style={[styles.ruleText, dynamicStyles.ruleText]}>Rule</Text>
              </NativeTouchableOpacity>

              {/* 标题 */}
              <View style={dynamicStyles.titleContainer}>
                <Text style={[styles.title, dynamicStyles.title]}>
                  DAILY CHECK-IN REWARDS
                </Text>
              </View>

              {/* 奖励列表 */}
              <View style={[styles.rewardsContainer, dynamicStyles.rewardsContainer]}>
                {sevenInfo.map((item: any, index: number) => (
                  <LinearGradient
                    key={index}
                    colors={item.status === 0 ? ['#F7E851', '#F19D09'] : ['#474747', '#2B2B2D']}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={[
                      styles.rewardItem,
                      dynamicStyles.rewardItem,
                      Days[item.weekDay] === 'Sunday'
                        ? {
                            width:
                              dynamicStyles.rewardItem.width * 2 +
                              dynamicStyles.rewardsContainer.columnGap,
                          }
                        : {},
                    ]}>
                    <Text style={[styles.dayText, dynamicStyles.dayText]}>
                      {Days[item.weekDay]}
                    </Text>
                    <View style={dynamicStyles.coinContainer}>
                      <Animated.Image
                        source={require('@assets/imgs/promotion/coin-icon.webp')}
                        style={[dynamicStyles.coinIcon, (item.status === 0 || item.status === -1) && coinAnimatedStyle]}
                      />
                    </View>
                    <Text style={[styles.amountText, dynamicStyles.amountText]}>
                      +{item.rewardAmount}Rs
                    </Text>
                    {item?.status === 1 && (
                      <View style={styles.rewardItemFinished} >
                        <Image
                          source={require('@assets/imgs/promotion/daily-rewards-selected.webp')}
                          style={dynamicStyles.selectedIcon}
                        />
                      </View>
                    )}
                  </LinearGradient>
                ))}
              </View>

              {/* 跳转充值或领取当天签到奖励按钮 */}
              <NativeTouchableOpacity
                style={[styles.buttonContainer, dynamicStyles.buttonContainer]}
                activeOpacity={0.8}
                onPress={() => {
                  if (canGetBonus) {
                    getDailyRewards();
                  } else {
                    useHideDailyRewards();
                    goToWithLogin('Deposit');
                  }
                }}>
                <LinearGradient
                  colors={['#FF0000', '#CE0A02']}
                  start={{x: 0, y: 0}}
                  end={{x: 0, y: 1}}
                  locations={[0, 0.8]}
                  style={styles.button}>
                  <Text style={[styles.buttonText, dynamicStyles.buttonText]}>
                    {canGetBonus
                    ? i18n.t('rebate.get-bonus')
                    : i18n.t('rebate.go-get-bonus')}
                  </Text>
                </LinearGradient>
              </NativeTouchableOpacity>
            </View>
          </LazyImageBackground>

          {/* 关闭按钮 */}
          <NativeTouchableOpacity
            onPress={useHideDailyRewards}
            style={[styles.closeButton]}>
            <Image
              style={[dynamicStyles.closeIcon, theme.margin.topl,]}
              source={require('@assets/imgs/promotion/daily-rewards-close.webp')}
            />
          </NativeTouchableOpacity>

          {/* 设计稿背景图资源高了一块高度为44dp的空白，补充一个空白视图已使布局垂直方向上平衡 */}
          <View style={{ height: calcActualSize(44) }} />
        </View>
      </Modal>
      <GetBonusModal
        isImageVisible={isImageVisible}
        amount={bonusAmount || 0}
        setIsImageVisible={setIsImageVisible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    textAlign: 'left',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  rewardsContainer: {
    backgroundColor: '#1C1A1F',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardItem: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  dayText: {
    color: '#FFFFFF',
  },
  rewardItemFinished: {
    flex:1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(105, 3, 3, 0.75)',
    zIndex: 1,
  },
  amountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    overflow: 'hidden',
    shadowColor: 'rgba(135, 0, 0, 1)',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'transparent',
  },
});

export default DailyRewardsModal;

