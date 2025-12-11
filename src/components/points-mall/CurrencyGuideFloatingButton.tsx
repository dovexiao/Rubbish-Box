import React from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';

interface CurrencyGuideFloatingButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const CurrencyGuideFloatingButton: React.FC<CurrencyGuideFloatingButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={['#FFDF5E', '#FF9D00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        <Image
          source={Images.pointsMallGuideFloatingButtonIcon}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.text}>货币指南</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = createStyles({
  container: {
    width: 56.25, // 144
    height: 62.109375, // 159
    shadowColor: '#984700',
    shadowOffset: {
      width: 1.5625, // 4
      height: 1.171875, // 3
    },
    shadowOpacity: 0.25, // 25%
    shadowRadius: 10.0390625, // 25.7px
    elevation: 8,
  },
  gradient: {
    width: '100%' as const,
    minHeight: 62.109375, // 159px
    borderRadius: 11.71875, // 30px
    paddingTop: 7.8125, // 20px
    paddingRight: 9.375, // 24px
    paddingBottom: 7.8125, // 20px
    paddingLeft: 9.375, // 24px
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  icon: {
    width: 31.25, // 80
    height: 34.375, // 88
    marginBottom: 3.90625, // 10
  },
  text: {
    fontFamily: 'kingnam_bobo',
    fontSize: 9.375, // 24px
    fontWeight: '400' as const,
    color: '#FF7300',
  },
});

export default CurrencyGuideFloatingButton;
