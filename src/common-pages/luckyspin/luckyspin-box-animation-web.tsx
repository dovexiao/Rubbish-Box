import React from 'react';
import {View} from 'react-native';
import theme from '@/style';
import animationjson from './luckyspin-box-animation-config-web';
import animationjson1 from './luckyspin-box-animation-config-web1';
interface AnimationWebProps {
  type?: number;
}
const LuckyspinBoxAnimationWeb: React.FC<AnimationWebProps> = ({type}) => {
  const viewRef = React.useRef(null);
  React.useEffect(() => {
    const jsonData = type === 1 ? animationjson1 : animationjson;
    if (document && viewRef.current) {
      const lottie = require('lottie-web');
      const animation = lottie.loadAnimation({
        container: viewRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        animationData: jsonData,
      });
      return () => {
        animation.destroy();
      };
    }
  }, [type]);
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

export default LuckyspinBoxAnimationWeb;
