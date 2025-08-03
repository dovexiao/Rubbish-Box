import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';
import LazyImage from '@/components/basic/image';
import CountDown from '../count-down';
import theme from '@/style';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';

interface CardProps {
  drawTimestamp: number;
  status: number;
  winAmount: number;
  digitsLogo: string;
}

const HomeDigitOffCard: React.FC<CardProps> = ({
  digitsLogo,
  drawTimestamp,
  winAmount,
  status,
}) => {
  const {screenWidth} = useScreenSize();

  return (
    <LinearGradient
      colors={['#bef164', '#0ece8f']} // 渐变颜色
      style={[
        styles.card,
        {padding: screenWidth * 0.027, borderRadius: screenWidth * 0.027},
      ]}>
      <View style={styles.cardTop}>
        <LazyImage
          occupancy="transparent"
          width={screenWidth * 0.16}
          height={screenWidth * 0.16}
          imageUrl={digitsLogo}
        />
        <View>
          <Text style={[styles.win, {fontSize: screenWidth * 0.027}]}>
            WIN-PRIZE
          </Text>
          <Text style={[styles.amount, {fontSize: screenWidth * 0.061}]}>
            ₹{winAmount}
          </Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <CountDown
          remain={drawTimestamp ? Math.round(drawTimestamp / 1000) : 0}
        />
        <View
          style={[
            styles.play,
            {
              width: screenWidth * 0.129,
              height: screenWidth * 0.056,
              borderRadius: screenWidth * 0.027,
            },
          ]}>
          <Text
            style={[
              styles.playText,
              {fontSize: screenWidth * 0.035, lineHeight: screenWidth * 0.056},
            ]}>
            PLAY
          </Text>
        </View>
      </View>
      {status === 0 && (
        <View
          style={[
            theme.background.white,
            theme.fill.fill,
            theme.position.abs,
            {
              opacity: 0.5,
              left: 0,
              bottom: 0,
              borderRadius: screenWidth * 0.027,
            },
          ]}>
          <View
            style={[
              theme.position.abs,
              {
                right: theme.paddingSize.xxs / 2,
                top: theme.paddingSize.s,
              },
            ]}>
            <LazyImage
              imageUrl={require('@assets/icons/home/closed.webp')}
              width={theme.imageSize.m}
              height={theme.imageSize.m}
              occupancy="#0000"
            />
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  cardTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  win: {
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Arial, Arial-Bold',
    textAlign: 'right',
  },

  amount: {
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'HeadLineA, HeadLineA-Black',
    textAlign: 'right',
  },

  cardBottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  play: {
    backgroundColor: '#ffffff',
  },

  playText: {
    color: '#000000',
    fontWeight: '700',
    fontFamily: 'Arial, Arial-Bold',
    textAlign: 'center',
  },
});

export default HomeDigitOffCard;
