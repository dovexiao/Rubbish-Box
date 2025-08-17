import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';
import LazyImage from '@/components/basic/image';
import CountDown from '../count-down';
import theme from '@/style';

interface CardProps {
  drawTimestamp: number;
  status: number;
  winAmount: number;
  digitsLogo: string;
}

const HomeDigitStoCard: React.FC<CardProps> = ({
  digitsLogo,
  drawTimestamp,
  winAmount,
  status,
}) => {
  return (
    <LinearGradient
      colors={['#bef164', '#0ece8f']} // 渐变颜色
      style={styles.card}>
      <View style={styles.cardTop}>
        <LazyImage
          occupancy="transparent"
          width={60}
          height={60}
          imageUrl={digitsLogo}
        />
        <View>
          <Text style={styles.win}>WIN-PRIZE</Text>
          <Text style={styles.amount}>₹{winAmount}</Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <CountDown
          remain={drawTimestamp ? Math.round(drawTimestamp / 1000) : 0}
        />
        <View style={styles.play}>
          <Text style={styles.playText}>PLAY</Text>
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
    borderRadius: 10,
    padding: 10,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'Arial, Arial-Bold',
    textAlign: 'right',
  },

  amount: {
    fontSize: 23,
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
    width: 48.5,
    height: 21,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },

  playText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '700',
    fontFamily: 'Arial, Arial-Bold',
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default HomeDigitStoCard;
