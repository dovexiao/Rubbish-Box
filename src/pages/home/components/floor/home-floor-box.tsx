/* eslint-disable react-native/no-inline-styles */
import Text from '@basicComponents/text';
import theme from '@/style';
import React, {Component} from 'react';
import {
  ImageURISource,
  FlatList,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  Animated,
  Easing,
  ImageBackground,
  Image,
} from 'react-native';
import globalStore from '@/services/global.state';
// import HomeFloorTitleBox from './home-floor-title-box';

interface HomeFloorBoxProps<listItemT> {
  /** 数据列表 */
  list: listItemT[];
  /** 渲染item,会返回数据列表的项,以及index */
  renderItem: (item: listItemT, index: number) => React.ReactElement;
  title: string;
  /** 标题背景图 */
  titleBgImg?: ImageURISource;
  titleIcon: ImageURISource;
  titleIconSize?: number;
  /** 每个元素的宽度,这个加上偏移量为每次拖动的距离 */
  itemWidth: number;
  /** 偏移量(中间padding的距离,默认theme.paddingSize.l) */
  offsetSize?: number;
  /** 当点击viewAll时触发的方法,如果不传,不会显示viewAll的按钮 */
  onPressViewAll?: () => void;
  type?: string;
}
// const huoIcon = require('@assets/animated/fire.gif');

class HomeFloorBox<listItemT> extends Component<
  HomeFloorBoxProps<listItemT>,
  {
    leftDisabled: boolean;
    rightDisabled: boolean;
    currentIndex: number;
    lastOffset: number;
    /** 滚动区域一屏的宽度 */
    listLayoutWidth: number;
    /** 偏移量(中间padding的距离,默认theme.paddingSize.s) */
    offsetSize: number;
    bounceValue: Animated.Value;
  }
> {
  constructor(props: HomeFloorBoxProps<listItemT>) {
    super(props);
    this.state = {
      leftDisabled: true,
      rightDisabled: false,
      currentIndex: 0,
      lastOffset: 0,
      listLayoutWidth: 0,
      offsetSize: props.offsetSize || theme.paddingSize.s,
      bounceValue: new Animated.Value(1),
    };
  }
  componentDidMount() {
    this.startBounceAnimation();
  }

  startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.state.bounceValue, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(this.state.bounceValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };
  flatListRef = React.createRef<FlatList>();
  handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, layoutMeasurement, contentSize} = event.nativeEvent;
    this.setState(() => ({
      leftDisabled: contentOffset.x === 0,
      rightDisabled:
        Math.floor(contentOffset.x + layoutMeasurement.width) >=
        Math.floor(contentSize.width),
      lastOffset: contentOffset.x,
    }));
  };
  layoutList = (event: LayoutChangeEvent) => {
    event.persist && event.persist();
    this.setState(() => ({
      listLayoutWidth: event.nativeEvent.layout.width,
    }));
  };
  scrollListTo = (type: 1 | -1) => {
    this.scrollListToOffsetX(
      this.state.lastOffset +
        (this.state.listLayoutWidth + this.state.offsetSize) * type,
    );
  };
  scrollListToOffsetX = (num: number) => {
    this.flatListRef.current!.scrollToOffset({
      animated: true,
      offset: Math.round(num),
    });
  };
  render() {
    const basePx = globalStore.screenWidth / 375;
    const {list, renderItem, title} = this.props; //type
    // const {bounceValue} = this.state;
    // const typeFlag = type === 'worldDigit' || type === 'digit';
    return (
      <View style={[theme.fill.fillW, theme.flex.col]}>
        <ImageBackground
          source={require('@/assets/icons/home/game-name-bg.webp')}
          style={[
            theme.flex.row,
            theme.flex.center,

            {
              height: basePx * 46,
              marginLeft: -14,
              marginRight: -14,
              marginBottom: 10,
            },
          ]}>
          <Image
            source={require('@/assets/icons/home/game-name-img.webp')}
            style={{
              width: theme.iconSize.m,
              height: theme.iconSize.m,
              marginRight: theme.paddingSize.s,
            }}
          />
          <Text
            fontSize={17}
            color={theme.basicColor.newFontYellow}
            fontFamily="fontInter"
            style={{fontWeight: '700', marginBottom: 5}}>
            {title}
          </Text>
        </ImageBackground>
        {/* <HomeFloorTitleBox style={[theme.fill.fillW]}>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,

              {
                height: 36,
                // marginTop: -12,
                marginTop: 0,
              },
            ]}>
            {typeFlag && (
              <Animated.Image
                source={huoIcon}
                style={{
                  width: 24,
                  height: 24,
                  marginRight: 10,
                  position: 'relative',
                  top: -6,
                  transform: [{scale: bounceValue}],
                }}
              />
            )}
            <Text size="large" white fontFamily="fontInter">
              {title}
            </Text>
          </View>
        </HomeFloorTitleBox> */}
        <View style={[theme.margin.btml, theme.flex.row, theme.flex.wrap]}>
          {list.map((item, index) => renderItem(item, index))}
        </View>
      </View>
    );
  }
}

export default HomeFloorBox;
