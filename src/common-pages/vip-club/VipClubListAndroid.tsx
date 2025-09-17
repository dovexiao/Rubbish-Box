/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
  ScrollView,
  ListRenderItemInfo,
} from 'react-native';
import Text from '@basicComponents/text';
import Svg, {
  Path,
  Circle as SvgCircle,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import LinearGradient from '@/components/basic/linear-gradient';
import theme from '@/style';
import {IVipConfigItem, IVipItem} from '@/services/global.service';
import {useInnerStyle} from '../vip/vip.hooks';
import {useTranslation} from 'react-i18next';
import {toPriceStr} from '@/utils';
import {
  vipOptionsMap,
  VipProgress,
  vipBgColors,
  maxVipLevel,
} from '@/components/business/vip';

const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth - theme.paddingSize.l * 2;
const ARC_HEIGHT = 28;
const ARC_FACTOR = 2;
const CONTROL_Y = ARC_HEIGHT * ARC_FACTOR;
const NODE_SIZE_SIDE = 6;
const SIDE_PADDING = 20;

interface VipClubListProps {
  vipConfigList: IVipConfigItem[];
  rechargeAmount?: number;
  vipList?: IVipItem[];
  checkIndex?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

const VipClubListAndroid: React.FC<VipClubListProps> = ({
  vipConfigList = [],
  rechargeAmount = 0,
  vipList = [],
  checkIndex,
}) => {
  const {
    cardStyle,
    size: {vipCardWidth},
  } = useInnerStyle();
  const {i18n} = useTranslation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 初始化滚动到 checkIndex
  useEffect(() => {
    if (checkIndex !== undefined && checkIndex >= 0) {
      const clampedIndex = Math.min(
        Math.max(checkIndex, 0),
        vipConfigList.length - 1,
      );
      setActiveIndex(clampedIndex);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: clampedIndex * vipCardWidth,
          animated: true,
        });
      }, 100);
    }
  }, [checkIndex, vipConfigList.length, vipCardWidth]);

  const CONTROL_X = screenWidth / 2;
  const progress = Animated.divide(scrollX, vipCardWidth); // 滚动进度 0→1→2...

  // 计算小球在贝塞尔曲线上的位置
  const getBezierPos = (index: number) => {
    const t = Animated.add(
      0.5,
      Animated.multiply(Animated.subtract(index, progress), 0.8),
    ).interpolate({
      inputRange: [-0.5, 0, 1, 1.5],
      outputRange: [0.05, 0.2, 0.8, 0.95],
      extrapolate: 'extend',
    });

    // 1 - t
    const oneMinusT = Animated.subtract(1, t);

    // (1-t)^2 * SIDE_PADDING
    const term1 = Animated.multiply(oneMinusT, oneMinusT);
    const x1 = Animated.multiply(term1, SIDE_PADDING);

    // 2*(1-t)*t*CONTROL_X
    const term2 = Animated.multiply(2, Animated.multiply(oneMinusT, t));
    const x2 = Animated.multiply(term2, CONTROL_X);

    // t^2 * (screenWidth - SIDE_PADDING)
    const term3 = Animated.multiply(t, t);
    const x3 = Animated.multiply(term3, screenWidth - SIDE_PADDING);

    const x = Animated.add(Animated.add(x1, x2), x3);

    // y = 2*(1-t)*t*CONTROL_Y
    const y = Animated.multiply(2, Animated.multiply(oneMinusT, t));
    const yPos = Animated.multiply(y, CONTROL_Y);

    return {x, y: yPos};
  };

  // 渲染 VIP 卡片
  const renderVipCardItem = ({item, index}: ListRenderItemInfo<IVipItem>) => (
    <LinearGradient
      colors={vipBgColors[index]}
      style={[
        cardStyle.cardContainerStyle,
        {
          width: vipCardWidth - 20,
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
        {paddingTop: 10, paddingBottom: 10},
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
        <View style={[theme.flex.row, {alignItems: 'flex-end'}]}>
          <Text blod color={theme.fontColor.white} style={{fontSize: 28}}>
            V{index}
          </Text>
          {index !== 0 && (
            <Text
              color={theme.fontColor.white}
              style={{fontSize: 14, marginLeft: 4, paddingBottom: 2}}>
              {vipList[index - 1].statusReached === 1
                ? vipList[index - 1].rewardReceivingStatus === 0
                  ? i18n.t('vip.received')
                  : i18n.t('vip.collected')
                : i18n.t('vip.finished')}
            </Text>
          )}
        </View>

        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={theme.fontColor.white60} fontSize={theme.fontSize.s}>
            Level progress{' '}
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

        <VipProgress
          currentLevel={item?.level}
          nextCurrentLevel={item?.level + 1}
          current={rechargeAmount}
          total={item?.amount}
          hasCurrentText={true}
        />

        <View style={[theme.position.rel, theme.flex.row]}>
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
              VIP{Math.min(item.level + 1, maxVipLevel)}
            </Text>
          </Text>
        </View>
      </View>

      <View style={[theme.flex.centerByCol]}>
        <Image
          source={vipOptionsMap[item?.level].small as ImageSourcePropType}
          style={{height: 98, width: 98}}
        />
        <Text color={theme.fontColor.white} fontSize={18}>
          VIP{item?.level}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderInfoRow = (label: string, value: any) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 24,
        borderRadius: 5,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
      }}>
      <Text style={{color: '#fff', fontSize: 12}}>{label}</Text>
      <Text style={{color: theme.basicColor.yellow, fontSize: 12}}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={vipCardWidth}
        decelerationRate="fast"
        scrollEventThrottle={32}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - vipCardWidth) / 2,
        }}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true},
        )}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / vipCardWidth);
          setActiveIndex(idx);
        }}>
        {vipConfigList.map((item, index) => (
          <View key={index} style={{width: vipCardWidth, alignItems: 'center'}}>
            <View style={{marginBottom: 12, width: vipCardWidth}}>
              {renderVipCardItem({
                item: vipList[index],
                index,
              } as ListRenderItemInfo<IVipItem>)}
            </View>
            <View style={{height: CONTROL_Y + 40, marginBottom: 15}} />
            <View
              style={{
                width: CARD_WIDTH,
                height: 363,
                marginHorizontal: 10,
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: theme.basicColor.newBgInOne,
                paddingHorizontal: 10,
                position: 'relative',
                zIndex: index === activeIndex ? 10 : 1,
                elevation: index === activeIndex ? 10 : 1,
              }}>
              <Image
                source={vipOptionsMap[item?.level].small as ImageSourcePropType}
                style={{
                  width: 95,
                  height: 95,
                  marginTop: 10,
                  resizeMode: 'contain',
                }}
              />
              <Text style={{color: '#fff', fontSize: 18, marginTop: 10}}>
                V{index}
              </Text>
              {renderInfoRow('Level Bonus', item?.amount)}
              {renderInfoRow('Spin Count', item?.spin)}
              {renderInfoRow('Daily Bonus', item?.dailyBonus)}
              {renderInfoRow('Withdrawal Count', item?.withdrawCount)}
              {renderInfoRow('Withdrawal Amount', item?.withdrawAmount)}
              {renderInfoRow('Deposit', item?.recharge)}
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* 贝塞尔弧线 & 小球 */}
      <View
        style={{
          position: 'absolute',
          top: vipList.length > 0 ? 140 : 100,
          left: 0,
          right: 0,
          height: CONTROL_Y + 40,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
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
            <RadialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
              <Stop
                offset="0%"
                stopColor="rgba(255,255,255,0.5)"
                stopOpacity="0.8"
              />
              <Stop
                offset="100%"
                stopColor="rgba(255,255,255,0)"
                stopOpacity="0"
              />
            </RadialGradient>
          </Defs>

          <Path
            d={`M${SIDE_PADDING},0 Q${CONTROL_X},${CONTROL_Y} ${
              screenWidth - SIDE_PADDING
            },0`}
            stroke="url(#grad)"
            strokeWidth={3}
            fill="transparent"
          />
          {vipConfigList.map((_, idx) => {
            const {x, y} = getBezierPos(idx);

            // 小球 opacity 随 scrollX 平滑变化
            const scale = scrollX.interpolate({
              inputRange: [
                (idx - 1) * vipCardWidth,
                idx * vipCardWidth,
                (idx + 1) * vipCardWidth,
              ],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange: [
                (idx - 1.5) * vipCardWidth,
                idx * vipCardWidth,
                (idx + 1.5) * vipCardWidth,
              ],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            return (
              <React.Fragment key={idx}>
                <AnimatedCircle
                  cx={x}
                  cy={y}
                  r={NODE_SIZE_SIDE * 2}
                  fill="url(#ballGlow)"
                  scale={scale}
                  opacity={scale}
                />
                <AnimatedCircle
                  cx={x}
                  cy={y}
                  r={NODE_SIZE_SIDE * 1.2}
                  fill="#fff"
                  // opacity={opacity}
                />
                <Animated.View
                  style={{
                    position: 'absolute',
                    transform: [
                      {translateX: x},
                      {translateY: Animated.add(y, 8)},
                    ],
                    width: 24,
                    opacity,
                    left: -10,
                  }}
                  pointerEvents="none">
                  <Text
                    fontSize={10}
                    fontWeight="600"
                    style={{color: '#fff', textAlign: 'center'}}>
                    {`V${idx}`}
                  </Text>
                </Animated.View>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

export default VipClubListAndroid;
