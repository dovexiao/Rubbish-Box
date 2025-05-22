import theme from '@/style';
import React from 'react';
import {View} from 'react-native';

const GameSpin = ({
  loading,
  children,
}: {
  loading: boolean;
  children?: React.ReactNode;
}) => {
  const LottieView = require('lottie-react-native').default;
  const lottieStyle = {
    height: 192,
    width: 192,
  };
  return (
    <View style={[theme.flex.flex1, theme.flex.flex, theme.flex.col]}>
      {loading && (
        <View style={[theme.flex.center, theme.fill.fill]}>
          <LottieView
            style={[lottieStyle]}
            source={require('./gamespin.config.json')}
            loop
            autoPlay
            imageAssetsFolder={'lottie/luckyspin'}
          />
        </View>
      )}
      {children}
    </View>
  );
};

export default GameSpin;
