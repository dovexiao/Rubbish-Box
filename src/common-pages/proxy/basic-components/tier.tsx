import React from 'react';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@/components/basic/text';
import theme from '@/style';
import i18n from '@/i18n';

export interface TierProps {
  level: number;
  style?: StyleProp<ViewStyle>;
  size?: TierSize;
}

interface TierOption {
  linearColors: string[];
  textColor: string;
}

export type TierSize = 'middle' | 'large';

const tierOptions: Record<number, TierOption> = {
  1: {
    // linearColors: ['#FCC', '#F26969'],
    // textColor: '#800A0A',
    linearColors: ['#ffffff', '#ffffff'],
    textColor: theme.fontColor.main,
  },
  2: {
    // linearColors: ['#CCEDFF', '#60BDE5'],
    // textColor: '#044F70',
    linearColors: ['#ffffff', '#ffffff'],
    textColor: theme.fontColor.main,
  },
  3: {
    // linearColors: ['#FFF1CC', '#EEBF45'],
    // textColor: '#775005',
    linearColors: ['#ffffff', '#ffffff'],
    textColor: theme.fontColor.main,
  },
  4: {
    // linearColors: ['#CCD7FF', '#5982ED'],
    // textColor: '#052169',
    linearColors: ['#ffffff', '#ffffff'],
    textColor: theme.fontColor.main,
  },
};

const tierSizeOptions: Record<
  TierSize,
  {width: number; height: number; borderRadius: number}
> = {
  middle: {
    width: 48,
    height: 20,
    borderRadius: 20,
  },
  large: {
    width: 64,
    height: 28,
    borderRadius: 20,
  },
};

const Tier: React.FC<TierProps> = props => {
  const {level, style, size = 'middle'} = props;

  const styles = StyleSheet.create({
    vipWrap: tierSizeOptions[size],
  });

  const {} = tierOptions[level] || tierOptions[0];

  return (
    <View style={style}>
      {level > 0 && level <= 4 && (
        <LinearGradient
          style={[styles.vipWrap, theme.flex.center]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={[
            theme.basicColor.newTransparent,
            theme.basicColor.newTransparent,
          ]}>
          <Text color={theme.fontColor.white} fontSize={theme.fontSize.s}>
            {i18n.t('proxy.tier', {number: ` ${level}`})}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};

export default Tier;
