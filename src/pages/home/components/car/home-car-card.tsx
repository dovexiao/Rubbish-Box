import React from 'react';
import {CarListItem} from '../../home.type';
import Text from '@basicComponents/text';
import {View, StyleSheet, Image} from 'react-native';
import theme from '@/style';
import LazyImage from '@basicComponents/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {toGame} from '@/common-pages/game-navigate';
import LinearGradient from '@basicComponents/linear-gradient';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
  imgWrap: {
    width: 64,
    height: 64,
  },
  position: {
    top: -2,
    left: -2,
    width: 76,
    height: 76,
  },
  timeName: {
    color: theme.fontColor.main,
    fontFamily: 'Inter',
    fontSize: 14,
    fontStyle: 'normal',
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  timeText: {
    color: theme.fontColor.accent,
    fontFamily: 'Inter',
    fontSize: 9,
    fontStyle: 'normal',
    fontWeight: '400',
  },
  cutTime: {
    padding: 2,
    borderRadius: 2,
    backgroundColor: '#000',
    width: 16,
    height: 15,
  },
  sep: {
    color: theme.fontColor.main,
    fontFamily: 'Inter',
    fontSize: 9,
    fontStyle: 'normal',
    fontWeight: '700',
  },
  curText: {
    color: '#fff',
    fontFamily: 'Inter',
    fontSize: 9,
    fontStyle: 'normal',
    fontWeight: '700',
  },
});

const HomeCarCard = ({
  item,
  marginRight,
  cardWidth,
  imageHeight,
  bg,
}: {
  item: CarListItem;
  marginRight?: boolean;
  cardWidth: number;
  imageHeight: number;
  bg: string[];
}) => {
  const {i18n} = useTranslation();
  // const timer = React.useRef<NodeJS.Timeout>();
  // const currentRef = React.useRef(0);
  // const [currentTime, setCurrentTime] = React.useState(0);

  // React.useEffect(() => {
  //   requestAnimationFrame(() => {
  //     item.clcyle =
  //       parseInt(item.gameUrl.split('cycle=')[1]?.split('&')[0], 10) || 1.5;
  //     item.remain = item.clcyle * 60;
  //     currentRef.current =
  //       item.remain - (Math.round(new Date().getTime() / 1000) % item.remain);
  //     setCurrentTime(currentRef.current);
  //     timer.current && clearInterval(timer.current);
  //     timer.current = setInterval(() => {
  //       currentRef.current--;
  //       if (currentRef.current === -1) {
  //         currentRef.current = item.remain! - 1;
  //       }
  //       // console.log(item.remain, currentRef.current);
  //       setCurrentTime(currentRef.current);
  //     }, 1000);
  //   });
  //   return () => {
  //     timer.current && clearInterval(timer.current);
  //   };
  // }, [item]);

  // const timeValue = React.useMemo(() => {
  //   const hour = Math.floor(currentTime / 3600);
  //   const minutes = Math.floor(currentTime / 60) % 60;
  //   const seconds = currentTime % 60;
  //   return {
  //     h: (hour + '').padStart(2, '0'),
  //     m: (minutes + '').padStart(2, '0'),
  //     s: (seconds + '').padStart(2, '0'),
  //   };
  // }, [currentTime]);

  return (
    <NativeTouchableOpacity
      onPress={() => toGame({...item, name: i18n.t('home.car.title')})}
      style={[
        {
          width: cardWidth,
          height: imageHeight,
        },
        marginRight ? theme.margin.rights : null,
        theme.flex.col,
        theme.borderRadius.s,
        theme.overflow.hidden,
        theme.background.white,
      ]}>
      <LinearGradient
        style={[theme.fill.fill]}
        start={{x: 1, y: 0}}
        end={{x: 1, y: 1}}
        colors={[bg[0], bg[1]]}>
        <View
          style={[
            theme.fill.fill,
            theme.padding.s,
            theme.flex.flex,
            theme.flex.col,
            theme.flex.around,
            theme.flex.centerByCol,
          ]}>
          <View style={[styles.imgWrap, theme.position.rel]}>
            <View style={[theme.position.abs, styles.position]}>
              <Image
                source={require('@assets/imgs/home/lottery-img-light-bg.webp')}
                style={[styles.position]}
              />
            </View>
            <LazyImage height="100%" width="100%" imageUrl={item.gamePic} />
          </View>
          <View>
            <Text style={[styles.timeName]}>{`${
              item.name.split(' ')[0]
            } ${i18n.t('home.car.min')}`}</Text>
          </View>
          {/* <View>
            <Text style={[styles.timeText]}>{i18n.t('home.car.text')}</Text>
          </View>
          <View style={[theme.flex.flex, theme.flex.row]}>
            <View
              style={[
                theme.flex.flex,
                theme.flex.col,
                theme.flex.center,
                styles.cutTime,
              ]}>
              <Text style={[styles.curText]}>{timeValue.h}</Text>
            </View>
            <Text style={[]}>&nbsp;:&nbsp;</Text>
            <View
              style={[
                theme.flex.flex,
                theme.flex.col,
                theme.flex.center,
                styles.cutTime,
              ]}>
              <Text style={[styles.curText]}>{timeValue.m}</Text>
            </View>
            <Text>&nbsp;:&nbsp;</Text>
            <View
              style={[
                theme.flex.flex,
                theme.flex.col,
                theme.flex.center,
                styles.cutTime,
              ]}>
              <Text style={[styles.curText]}>{timeValue.s}</Text>
            </View>
          </View> */}
        </View>
      </LinearGradient>
    </NativeTouchableOpacity>
  );
};

export default HomeCarCard;
