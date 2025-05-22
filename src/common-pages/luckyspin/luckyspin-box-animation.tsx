import React from 'react';

const LuckyspinBoxAnimation = () => {
  const LottieView = require('lottie-react-native').default;
  const lottieStyle = {
    height: 192,
    width: 192,
  };
  return (
    <LottieView
      style={[lottieStyle]}
      source={require('./luckyspin-box-animation-config.json')}
      loop={false}
      autoPlay
      imageAssetsFolder={'lottie/luckyspin'}
    />
  );
};

export default LuckyspinBoxAnimation;
