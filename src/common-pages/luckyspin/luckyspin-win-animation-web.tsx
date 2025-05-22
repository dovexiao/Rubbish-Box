import React from 'react';
import {View} from 'react-native';
import theme from '@/style';
import animationjson from './luckyspin-win-animation-config-web';

const LuckyspinWinAnimationWeb = () => {
  const viewRef = React.useRef(null);
  React.useEffect(() => {
    if (document && viewRef.current) {
      const lottie = require('lottie-web');
      const animation = lottie.loadAnimation({
        container: viewRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationjson,
      });
      return () => {
        animation.destroy();
      };
    }
  }, []);
  return (
    <View
      ref={viewRef}
      style={[
        {
          height: theme.imageSize.m * 3,
          width: theme.imageSize.m * 3,
        },
      ]}
    />
  );
};

export default LuckyspinWinAnimationWeb;
