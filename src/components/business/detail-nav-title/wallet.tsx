import React from 'react';
import {ViewStyle, StyleProp} from 'react-native';
import globalStore from '@/services/global.state';

const Wallet = ({style}: {style?: StyleProp<ViewStyle>}) => {
  const LottieView = require('lottie-react-native').default;
  const lottieRef = React.useRef<typeof LottieView>(null);
  React.useEffect(() => {
    const sub = globalStore.amountChanged.subscribe(res => {
      if (res.last !== null) {
        if (res.last < res.current && res.current !== globalStore.userAmount) {
          lottieRef.current?.play();
        }
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);
  const lottieStyle = {
    height: 76,
    width: 76,
  };
  return (
    <LottieView
      ref={lottieRef}
      style={[lottieStyle, style]}
      source={require('./wallet-animation-config.json')}
      loop={false}
      autoPlay={false}
      imageAssetsFolder={'lottie'}
    />
  );
};

export default Wallet;
