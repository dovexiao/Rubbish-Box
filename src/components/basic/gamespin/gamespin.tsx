import React from 'react';
import {View} from 'react-native';
import theme from '@/style';
import animationjson from './gamespin.config.json';

const GameSpin = ({
  loading,
  children,
}: {
  loading: boolean;
  children?: React.ReactNode;
}) => {
  const viewRef = React.useRef(null);
  React.useEffect(() => {
    if (!loading) {
      return;
    }
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
  }, [loading]);
  return (
    <View style={[theme.flex.flex1, theme.flex.flex, theme.flex.col]}>
      {loading && (
        <View style={[theme.flex.center, theme.fill.fill]}>
          <View
            ref={viewRef}
            style={[
              {
                height: theme.imageSize.m * 3,
                width: theme.imageSize.m * 3,
              },
            ]}
          />
        </View>
      )}
      {children}
    </View>
  );
};

export default GameSpin;
