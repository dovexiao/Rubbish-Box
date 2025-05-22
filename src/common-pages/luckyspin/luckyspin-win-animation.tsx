import React from 'react';

const LuckyspinWinAnimation = () => {
  const LottieView = require('lottie-react-native').default;
  const lottieStyle = {
    height: 192,
    width: 192,
  };
  return (
    <LottieView
      style={[lottieStyle]}
      source={require('./luckyspin-win-animation-config.json')}
      loop={true}
      autoPlay
      imageAssetsFolder={'lottie/luckyspin'}
    />
  );
};

export default LuckyspinWinAnimation;
