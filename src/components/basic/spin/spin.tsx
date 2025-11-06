import theme from '@/style';
import {Dialog} from '@rneui/themed';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';

const Spin = ({
  loading,
  children,
  style,
  overlayStyle,
}: {
  loading: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
}) => {
  return (
    <View style={[theme.position.rel, style]}>
      {children}
      {loading && (
        <View
          style={[
            theme.fill.fill,
            theme.flex.center,
            theme.position.abs,
            {
              top: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            overlayStyle,
          ]}>
          <Dialog.Loading loadingProps={{color: '#F49E2D'}} />
        </View>
      )}
    </View>
  );
};

export default Spin;
