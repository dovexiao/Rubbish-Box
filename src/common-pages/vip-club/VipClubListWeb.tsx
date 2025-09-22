/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect, useMemo} from 'react';
import {
  View,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  ListRenderItemInfo,
  TouchableOpacity,
  StyleSheet,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Text from '@basicComponents/text';
import Svg, {
  Path,
  Circle as SvgCircle,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import theme from '@/style';
import {IVipConfigItem, IVipItem} from '@/services/global.service';
import {
  vipOptionsMap,
  VipProgressInfo,
  VipRenderType,
  maxVipLevel,
  VipProgress,
  vipBgColors,
} from '@/components/business/vip';
import {toPriceStr} from '@/utils';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient';
import {useInnerStyle} from '../vip/vip.hooks';
import VipClubTop from './vip-club-top';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
const ablotW = require('@assets/icons/about-w.webp');
const vipLeft = require('@assets/imgs/vip/vip-left.webp');
const vipTop = require('@assets/imgs/vip/vip-top.webp');

const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth - theme.paddingSize.l * 2;
const ARC_HEIGHT = 28;
const ARC_FACTOR = 2;
const CONTROL_Y = ARC_HEIGHT * ARC_FACTOR;
const NODE_SIZE_CENTER = 10;
const NODE_SIZE_SIDE = 6;
const SIDE_PADDING = 0;
const TOP_WEEKLY_HEIFGT = 150;

interface VipClubListProps {
  vipConfigList: IVipConfigItem[];
  // VIP Card List props
  rechargeAmount?: number;
  vipInfoList?: VipProgressInfo[];
  cards?: VipRenderType[];
  vipList?: IVipItem[];
  onRecharge?: () => void;
  onRefresh?: () => void;
  currentLevel?: number;
  // Common props
  handlePressClaim?: () => void;
  checkIndex?: number;
  currentInfo?: any;
}

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

const VipClubList: React.FC<VipClubListProps> = ({
  vipConfigList = [],
  // VIP Card List props
  rechargeAmount = 0,
  vipList = [],
  // Common props
  handlePressClaim,
  checkIndex,
  currentInfo = {},
}) => {
  const {i18n} = useTranslation();
  const {
    cardStyle,
    size: {vipCardWidth},
  } = useInnerStyle();

  // VIP Club List effects
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // 添加平滑过渡的动画值
  // const activeIndexAnim = useRef(new Animated.Value(0)).current;
  // 添加防抖动的标志
  // const isAnimating = useRef(false);
  // VIP Club List effects
  useEffect(() => {
    const id = scrollX.addListener(({value}) => {
      // 计算滚动进度，调整阈值让卡片更接近中心才激活
      const scrollProgress = value / vipCardWidth;
      // 使用更严格的判断条件：卡片需要滚动超过65%才切换到下一个
      // 这样V9卡片需要更接近中心位置才会变高
      const threshold = 0.35; // 35%的位置开始切换，
      // const idx = Math.round(value / CARD_WIDTH);
      const idx = Math.floor(scrollProgress + threshold);
      const clamped = Math.min(Math.max(idx, 0), vipConfigList.length - 1);
      // 只在索引真正改变时才更新状态
      if (activeIndex !== clamped) {
        setActiveIndex(clamped);
      }
    });
    return () => scrollX.removeListener(id);
  }, [scrollX, vipConfigList.length, activeIndex, vipCardWidth]);
  useEffect(() => {
    if (vipConfigList.length <= 0) {
      return;
    }
    if (checkIndex !== undefined && checkIndex >= 0) {
      const clampedIndex = Math.min(
        Math.max(checkIndex, 0),
        vipConfigList.length - 1,
      );
      setActiveIndex(clampedIndex);
      // 滚动到指定位置
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: clampedIndex * vipCardWidth,
          animated: true,
        });
      }, 100);
    }
  }, [vipConfigList.length, checkIndex, vipCardWidth]);
  const CONTROL_X = screenWidth / 2;

  // Render VIP Card Item
  const renderVipCardItem = ({item, index}: ListRenderItemInfo<IVipItem>) => {
    return (
      <LinearGradient
        colors={vipBgColors[index]}
        style={[
          cardStyle.cardContainerStyle,
          {
            width: vipCardWidth - 20, // 使用vipCardWidth宽度
            height: 140,
            marginHorizontal: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
          },
          theme.flex.row,
          theme.flex.between,
          theme.padding.lrl,
          theme.flex.centerByCol,
          {
            paddingTop: 10,
            paddingBottom: 10,
          },
        ]}
        key={index}>
        <View
          style={[
            theme.flex.flex1,
            theme.flex.col,
            theme.margin.rightl,
            theme.flex.around,
            {height: 120},
          ]}>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
            <Text
              fontSize={28}
              fontFamily="fontDin"
              blod
              color={theme.fontColor.white}>
              V{index}
            </Text>
            {/* {index !== 0 && (
              <View style={[cardStyle.topTag]}>
                <Text fontSize={theme.fontSize.s} color={theme.fontColor.white}>
                  (
                  {vipList[index - 1].statusReached === 1
                    ? vipList[index - 1].rewardReceivingStatus === 0
                      ? i18n.t('vip.received')
                      : i18n.t('vip.collected')
                    : i18n.t('vip.finished')}
                  )
                </Text>
              </View>
            )} */}
            <View style={[cardStyle.topTag, theme.flex.row]}>
              <Text white fontSize={theme.fontSize.s} blod>
                {toPriceStr(rechargeAmount, {fixed: 0, thousands: true})}
              </Text>
              <Text
                white
                fontSize={theme.fontSize.s}
                blod
                style={[theme.margin.leftxxs]}>
                / {toPriceStr(item.amount, {fixed: 0, thousands: true})}(V
                {Math.min(index + 1, maxVipLevel)})
              </Text>
            </View>
          </View>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text color={theme.fontColor.white60} fontSize={theme.fontSize.s}>
              Level prograss{' '}
              <Text color={theme.fontColor.white}>
                {Math.floor(
                  Math.max(
                    0,
                    Math.min((rechargeAmount / item?.amount) * 100, 100),
                  ),
                )}
                %
              </Text>
            </Text>
          </View>
          <View style={[]}>
            <VipProgress
              currentLevel={item?.level}
              nextCurrentLevel={item?.level + 1}
              current={rechargeAmount}
              total={item?.amount}
              hasCurrentText={true}
            />
          </View>

          {/* <View style={[theme.position.rel, theme.flex.row]}>
            <Text white fontSize={theme.fontSize.s} blod>
              {toPriceStr(rechargeAmount, {fixed: 0, thousands: true})}
            </Text>
            <Text
              white
              fontSize={theme.fontSize.s}
              blod
              style={[theme.margin.leftxxs]}>
              / {toPriceStr(item.amount, {fixed: 0, thousands: true})}(V
              {Math.min(index + 1, maxVipLevel)})
            </Text>
          </View> */}
          <View
            style={[theme.flex.row, theme.flex.centerByCol, theme.fill.fillW]}>
            <Text
              color={theme.fontColor.white60}
              style={[cardStyle.text]}
              fontSize={theme.fontSize.xs}>
              {i18n.t('vip.recharge')}{' '}
              <Text color={theme.fontColor.white} blod>
                {toPriceStr(item.diff, {fixed: 0, thousands: true})}
              </Text>{' '}
              {i18n.t('vip.move')}
              <Text white blod>
                VIP
                {Math.min(item.level + 1, maxVipLevel)}
              </Text>
            </Text>
          </View>
        </View>
        <View style={[theme.flex.centerByCol]}>
          <Image
            source={vipOptionsMap[item?.level].small as ImageSourcePropType}
            style={[
              {
                height: 98,
                width: 98,
              },
            ]}
          />
          <Text white fontSize={18}>
            VIP{item?.level}
          </Text>
        </View>
      </LinearGradient>
    );
  };
  // 根据贝塞尔曲线计算小球在弧线上的精确位置
  const getBallPositionOnCurve = useMemo(() => {
    return (index: number) => {
      // 计算小球相对于当前滚动位置的偏移
      const scrollProgress = Animated.divide(
        scrollX,
        new Animated.Value(vipCardWidth), // 使用vipCardWidth
      );
      const ballOffset = Animated.subtract(
        new Animated.Value(index),
        scrollProgress,
      );

      // 将偏移映射到弧线上的位置
      // -1对应弧线左端，0对应弧线中心，1对应弧线右端
      const normalizedOffset = Animated.divide(
        ballOffset,
        new Animated.Value(1),
      );

      // 计算弧线上的t值（0到1之间）
      const t = Animated.add(
        new Animated.Value(0.5),
        Animated.multiply(normalizedOffset, new Animated.Value(0.8)),
      );

      // 限制t值在合理范围内
      const clampedT = t.interpolate({
        inputRange: [-0.5, 0, 1, 1.5],
        // outputRange: [-0.5, 0, 1, 1.5],
        outputRange: [0.05, 0.2, 0.8, 0.95],
        // extrapolate: Platform.OS === 'web' ? 'extend' : 'clamp',
        extrapolate: Platform.OS === 'web' ? 'extend' : 'extend',
      });

      // 计算贝塞尔曲线上的X位置
      // B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
      const oneMinusT = Animated.subtract(new Animated.Value(1), clampedT);
      const oneMinusTSquared = Animated.multiply(oneMinusT, oneMinusT);
      const tSquared = Animated.multiply(clampedT, clampedT);
      const twoOneMinusTTimesT = Animated.multiply(
        Animated.multiply(new Animated.Value(2), oneMinusT),
        clampedT,
      );

      // X位置：P₀.x = SIDE_PADDING, P₁.x = CONTROL_X, P₂.x = screenWidth - SIDE_PADDING
      const ballX = Animated.add(
        Animated.add(
          Animated.multiply(oneMinusTSquared, new Animated.Value(SIDE_PADDING)),
          Animated.multiply(twoOneMinusTTimesT, new Animated.Value(CONTROL_X)),
        ),
        Animated.multiply(
          tSquared,
          new Animated.Value(screenWidth - SIDE_PADDING),
        ),
      );

      // Y位置：P₀.y = 0, P₁.y = CONTROL_Y, P₂.y = 0
      const ballY = Animated.multiply(
        new Animated.Value(CONTROL_Y),
        twoOneMinusTTimesT,
      );

      return {x: ballX, y: ballY};
    };
  }, [scrollX, CONTROL_X, vipCardWidth]);

  // 计算可见小球索引
  const getVisibleBalls = (active: number, length: number) => {
    const balls: number[] = [];
    balls.push(active); // 中间球
    if (active - 1 >= 0) {
      balls.push(active - 1);
    } // 左球
    if (active + 1 < length) {
      balls.push(active + 1);
    } // 右球
    return balls.sort((a, b) => a - b);
  };

  // Render info row for VIP club cards
  const renderInfoRow = (label: string, value: any, isAmt?: boolean) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 42,
        borderRadius: 5,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={vipLeft as ImageSourcePropType}
          style={{
            width: 12,
            height: 12,
            // marginTop: 30,
            marginRight: 5,
            resizeMode: 'contain',
          }}
        />
        <Text
          fontSize={15}
          fontWeight="400"
          style={{color: theme.fontColor.white60}}>
          {label}
        </Text>
      </View>
      <Text
        fontSize={16}
        fontWeight="500"
        style={{color: theme.basicColor.yellow}}>
        {isAmt ? toPriceStr(value, {fixed: 0, thousands: true}) : value}
      </Text>
    </View>
  );

  const visibleBalls = getVisibleBalls(activeIndex, vipConfigList.length);
  const activeStyle = {
    top: -10,
  };
  const activeStyleLeft = {
    right: -60,
  };
  const activeStyleRight = {
    left: -60,
  };
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      const x = e.nativeEvent.contentOffset.x;
      const targetIndex = Math.round(x / vipCardWidth);
      scrollViewRef.current?.scrollTo({
        x: targetIndex * vipCardWidth,
        animated: true,
      });
    }, 100); // 100~150ms 视情况
  };

  // buttonStatus?: 'available' | 'claimed' | 'locked';
  const [isPressed, setIsPressed] = useState(false);
  // const [buttonStatus, _setButtonStatus] = useState('available');
  const [visible, setVisible] = useState(false);

  const handleInfoPress = () => {
    setVisible(true);
  };
  // const getButtonText = () => {
  //   switch (buttonStatus) {
  //     case 'available':
  //       return 'Available';
  //     //   case 'claimed':
  //     //     return 'Claimed';
  //     //   case 'locked':
  //     //     return 'Locked';
  //     default:
  //       return 'Available';
  //   }
  // };

  // const getButtonStyle = () => {
  //   switch (buttonStatus) {
  //     case 'available':
  //       return styles.availableButton;
  //     case 'claimed':
  //       return styles.claimedButton;
  //     case 'locked':
  //       return styles.lockedButton;
  //     default:
  //       return styles.availableButton;
  //   }
  // };
  const buttonStatus =
    currentInfo.receive === 1 && currentInfo.weekRewardAmount > 0;
  return (
    <View style={{flex: 1}}>
      {/* 单一滚动容器 - 包含上方卡片、中间小球、下方卡片 */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={vipCardWidth} // 使用vipCardWidth作为顶部卡片的滚动间隔
        decelerationRate="fast"
        scrollEventThrottle={Platform.OS !== 'web' ? 32 : 64}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - vipCardWidth) / 2, // 根据vipCardWidth计算padding
        }}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: Platform.OS !== 'web' ? true : false,
            listener: handleScroll,
          },
        )}>
        {vipConfigList.map((item, index) => (
          <View key={index} style={{width: vipCardWidth, alignItems: 'center'}}>
            {/* 上方VIP卡片区域 */}
            <View
              style={{
                marginBottom: 12,
                width: vipCardWidth,
              }}>
              {renderVipCardItem({
                item: vipList[index],
                index,
              } as ListRenderItemInfo<IVipItem>)}
            </View>
            {/* 中间小球指示器区域的占位空间 */}
            <View
              style={{
                height: CONTROL_Y + TOP_WEEKLY_HEIFGT - 40,
                marginBottom: 15,
              }}
            />

            {/* 下方Club卡片区域 */}
            <View
              style={[
                {
                  width: CARD_WIDTH - 60,
                  height: index === activeIndex ? 343 : 323, // 当前活跃卡片高度增加20
                  marginHorizontal: 10,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: theme.basicColor.newBgInOne,
                  paddingHorizontal: 10,
                  position: 'relative',
                  overflow: 'visible',
                  zIndex: index === activeIndex ? 10 : 1,
                  elevation: index === activeIndex ? 10 : 1,
                },
                index === activeIndex ? activeStyle : null,
                // index < 8 && index > 7 ? activeStyleLeft : null,
                index === activeIndex - 1 ? activeStyleLeft : null,
                index === activeIndex + 1 ? activeStyleRight : null,
                // index === vipConfigList.length - 1 ? activeStyleRight : null,
                // index === vipConfigList.length - 2 ? activeStyleRight : null,
              ]}>
              {index === activeIndex && (
                <LinearGradient
                  colors={['#fff9b2', '#e8b138']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 7,
                    marginLeft: -8,
                    zIndex: 10,
                    width: 90,
                    height: 22,
                    // backgroundImage: 'linear-gradient(90deg,#fff9b2, #e8b138 91%)',
                    borderRadius: 12,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={[
                      {
                        fontSize: 12,
                        fontWeight: '500',
                        color: theme.basicColor.newRed,
                      },
                    ]}>
                    {i18n.t('vip.currentLevel')}
                  </Text>
                </LinearGradient>
              )}
              {/* 三角形指示器 - 只显示在当前活跃卡片上 */}
              {index === activeIndex && (
                <View
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    marginLeft: -8,
                    zIndex: 10,
                    width: 16,
                    height: 15,
                    backgroundColor: 'transparent',
                  }}>
                  <View
                    style={{
                      width: 0,
                      height: 0,
                      borderLeftWidth: 8,
                      borderRightWidth: 8,
                      borderBottomWidth: 15,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: theme.basicColor.newBgInOne,
                      borderStyle: 'solid',
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 1,
                      left: 1,
                      width: 0,
                      height: 0,
                      borderLeftWidth: 7,
                      borderRightWidth: 7,
                      borderBottomWidth: 13,
                      borderLeftColor: 'transparent',
                      borderRightColor: 'transparent',
                      borderBottomColor: theme.basicColor.newBgInOne,
                      borderStyle: 'solid',
                    }}
                  />
                </View>
              )}
              {/* <Image
                source={vipOptionsMap[item?.level].small as ImageSourcePropType}
                style={{
                  width: 95,
                  height: 95,
                  marginTop: 10,
                  resizeMode: 'contain',
                }}
              /> */}
              <Image
                source={vipTop as ImageSourcePropType}
                style={{
                  width: 160,
                  height: 12,
                  marginTop: 30,
                  resizeMode: 'contain',
                }}
              />
              {/* <Text
                fontSize={18}
                fontWeight="700"
                style={{color: '#FFFFFF', marginTop: 10}}>
                V{index}
              </Text> */}
              {renderInfoRow('Level Bonus', item?.amount, true)}
              {renderInfoRow('Spin Count', item?.spin)}
              {/* {renderInfoRow('Daily Bonus', item?.dailyBonus)} */}
              {renderInfoRow('Withdrawal Count', item?.withdrawCount)}
              {renderInfoRow('Withdrawal Amount', item?.withdrawAmount, true)}
              {renderInfoRow('Deposit', item?.recharge, true)}
            </View>
          </View>
        ))}
      </Animated.ScrollView>
      {vipList.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            top: vipList.length > 0 ? 70 : 50,
            // right: 0,
            left: (screenWidth - vipCardWidth) / 2 + 10,
            zIndex: -1,
            elevation: 10,
          }}>
          <VipClubTop
            w={vipCardWidth - 20}
            h={TOP_WEEKLY_HEIFGT}
            currentLevel={checkIndex}
            currentInfo={currentInfo}
            onClaim={handlePressClaim}
          />
        </View>
      ) : null}
      {vipList.length > 0 ? (
        <NativeTouchableOpacity
          style={{
            marginLeft: 5,
            position: 'absolute',
            top: vipList.length > 0 ? 147 : 107,
            left: (screenWidth - vipCardWidth) / 2 + 120,
          }}
          onPress={() => {
            handleInfoPress();
          }}>
          <Image
            source={ablotW}
            style={[
              {
                width: 16,
                height: 16,
              },
            ]}
          />
        </NativeTouchableOpacity>
      ) : null}
      {vipList.length > 0 ? (
        <View
          style={[
            styles.buttonSection,
            {
              position: 'absolute',
              top: vipList.length > 0 ? 150 : 110,
              right: (screenWidth - vipCardWidth) / 2 + 30,
            },
          ]}>
          <TouchableOpacity
            style={[styles.claimButton, isPressed && styles.buttonPressed]}
            onPress={handlePressClaim}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            disabled={buttonStatus}>
            <LinearGradient
              colors={
                buttonStatus ? ['#FF6B35', '#FF8E53'] : ['#888888', '#666666']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}>
              <Text
                fontSize={theme.fontSize.m}
                fontWeight="bold"
                color={theme.fontColor.white}
                style={[
                  {
                    textAlign: 'center',
                  },
                ]}>
                {'Available'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
      {/* 固定在屏幕中间的小球指示器 */}
      {vipList.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            top:
              vipList.length > 0
                ? 140 + TOP_WEEKLY_HEIFGT - 60
                : 100 + TOP_WEEKLY_HEIFGT - 60, // 根据上方卡片高度调整位置
            left: 0,
            right: 0,
            height: CONTROL_Y + 40,
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none', // 允许触摸事件穿透
          }}>
          {/* 贝塞尔弧线 */}
          <Svg
            height={CONTROL_Y + 40}
            width={screenWidth}
            style={{position: 'absolute', top: 20}}>
            <Defs>
              <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#EEACAC" stopOpacity="0.2" />
                <Stop offset="50%" stopColor="#EEACAC" stopOpacity="1" />
                <Stop offset="100%" stopColor="#EEACAC" stopOpacity="0.2" />
              </SvgLinearGradient>
            </Defs>
            <Path
              d={`M${SIDE_PADDING},0 Q${CONTROL_X},${CONTROL_Y} ${
                screenWidth - SIDE_PADDING
              },0`}
              stroke="url(#grad)"
              strokeWidth={3}
              fill="transparent"
            />
          </Svg>

          {/* 小球 */}
          {Platform.OS !== 'web' ? null : (
            <Svg
              height={CONTROL_Y + 40}
              width={screenWidth}
              style={{position: 'absolute', top: 20}}>
              {visibleBalls.map(idx => {
                const ballPos = getBallPositionOnCurve(idx);
                const isCenter = idx === activeIndex;
                const size = isCenter ? NODE_SIZE_CENTER : NODE_SIZE_SIDE;
                const fill = theme.basicColor.white;
                const platformOffset = Platform.OS === 'android' ? 8 : size * 2;
                const textY = Animated.add(
                  ballPos.y,
                  new Animated.Value(platformOffset),
                );
                return (
                  <React.Fragment key={`ball-${idx}`}>
                    {/* 发光效果 - 外层光晕 */}
                    {isCenter && (
                      <AnimatedCircle
                        cx={ballPos.x}
                        cy={ballPos.y}
                        r={size / 2 + 3}
                        fill="rgba(255,255,255,0.3)"
                      />
                    )}
                    {/* 发光效果 - 中层光晕 */}
                    <AnimatedCircle
                      cx={ballPos.x}
                      cy={ballPos.y}
                      r={size / 2 + (isCenter ? 2 : 1)}
                      fill={
                        isCenter
                          ? 'rgba(255,255,255,0.5)'
                          : 'rgba(255,255,255,0.2)'
                      }
                    />
                    <AnimatedCircle
                      cx={ballPos.x}
                      cy={ballPos.y}
                      r={size / 2}
                      fill={fill}
                    />
                    {Platform.OS === 'android' ? (
                      <Animated.View
                        style={{
                          position: 'absolute',
                          transform: [
                            {translateX: ballPos.x},
                            {
                              translateY: Animated.add(
                                ballPos.y,
                                new Animated.Value(platformOffset),
                              ),
                            },
                          ],
                          marginLeft: -(isCenter ? 12 : 10) / 2,
                        }}
                        pointerEvents="none">
                        <Text
                          fontSize={isCenter ? 11 : 9}
                          fontWeight="600"
                          style={{
                            color: '#fff',
                            textAlign: 'center',
                            width: size * 2,
                          }}>
                          {`V${idx}`}
                        </Text>
                      </Animated.View>
                    ) : (
                      <AnimatedSvgText
                        x={ballPos.x}
                        y={textY}
                        fontSize={isCenter ? 12 : 10}
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="#fff">
                        {`V${idx}`}
                      </AnimatedSvgText>
                    )}
                  </React.Fragment>
                );
              })}
            </Svg>
          )}
        </View>
      ) : null}
      <Modal
        animationType="fade"
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
            <Text style={[modalStyles.message, modalStyles.messageTitle]}>
              VIP salary Rules：
              {/* {
                'This is a detailed explanation of weekly salary, to be determined ...'
              } */}
            </Text>
            <Text style={modalStyles.message}>
              To receive your salary, you must complete the weekly top-up task.
            </Text>
            <Text style={modalStyles.message}>
              Salaries are settled every Monday at 3 PM.
            </Text>
            <Text style={modalStyles.message}>
              When VIP pay is settled, your salary is based on your VIP level
              from the previous week.
            </Text>
            <Text style={modalStyles.message}>
              VIP reward Once you have received your previous VIP pay, you can
              still receive your current week's VIP pay without having to top
              up.
            </Text>
            <View style={modalStyles.buttonRow}>
              {/* <TouchableOpacity style={modalStyles.button} onPress={onCancel}>
                <Text style={modalStyles.cancelText}></Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={modalStyles.button}
                onPress={() => {
                  setVisible(false);
                }}>
                <Text style={modalStyles.confirmText}>
                  {i18n.t('label.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    width: '85%',
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
    width: '100%',
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    color: theme.fontColor.white,
  },
  messageTitle: {
    fontSize: 18,
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
  buttonSection: {
    alignItems: 'center',
    marginBottom: theme.paddingSize.s,
  },
  claimButton: {
    borderRadius: theme.borderRadiusSize.xxxl,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  availableButton: {},
  claimedButton: {
    opacity: 0.7,
  },
  lockedButton: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{scale: 0.95}],
  },
  buttonGradient: {
    paddingHorizontal: theme.paddingSize.xxxl,
    paddingVertical: theme.paddingSize.s,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VipClubList;
