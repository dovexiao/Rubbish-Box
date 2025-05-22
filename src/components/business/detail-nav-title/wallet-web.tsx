import React from 'react';
import {View, ViewStyle, StyleProp} from 'react-native';
import animationjson from './wallet-animation-config-web';
import globalStore from '@/services/global.state';

const WalletWeb = ({style}: {style?: StyleProp<ViewStyle>}) => {
  const viewRef = React.useRef(null);
  React.useEffect(() => {
    if (document && viewRef.current) {
      const lottie = require('lottie-web');
      const animation = lottie.loadAnimation({
        container: viewRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: animationjson,
      });
      const sub = globalStore.amountChanged.subscribe(res => {
        if (res.last !== null) {
          if (
            res.last < res.current &&
            res.current !== globalStore.userAmount
          ) {
            animation.play();
          }
        }
      });
      return () => {
        animation.destroy();
        sub.unsubscribe();
      };
    }
  }, []);
  return (
    <View style={[style]}>
      <View
        ref={viewRef}
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          height: 76,
          width: 76,
        }}
      />
    </View>
  );
};

export default WalletWeb;
