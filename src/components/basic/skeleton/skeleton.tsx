import React from 'react';
import {StyleProp, View, ViewProps, ViewStyle} from 'react-native';
import {
  Skeleton as RNESkelenton,
  SkeletonProps as RNESkeletonProps,
} from '@rneui/themed';
import theme from '@/style';

/** 集成了ViewProps和RNESkeletonProps, 会忽略RNESkeletonProps的width和height, 会自动填充满 */
interface SkeletonProps extends ViewProps, RNESkeletonProps {
  loading: boolean;
  /** 内容容器的style */
  containerStyle?: StyleProp<ViewStyle>;
}

const Skeleton = (props: SkeletonProps) => {
  const {
    children,
    loading,
    style,
    containerStyle,
    LinearGradientComponent,
    animation,
    circle,
    skeletonStyle,
  } = props;
  const disStyle: StyleProp<ViewStyle> = {
    opacity: 0,
    pointerEvents: 'none',
  };
  return (
    <View style={[theme.position.rel, style]}>
      {loading && (
        <RNESkelenton
          style={[
            theme.position.abs,
            theme.fill.fill,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              top: 0,
              left: 0,
              backgroundColor: theme.backgroundColor.grey + '8',
            },
          ]}
          LinearGradientComponent={LinearGradientComponent}
          animation={animation || 'pulse'}
          circle={circle}
          skeletonStyle={[theme.background.grey, skeletonStyle]}
        />
      )}
      <View style={[containerStyle, loading ? disStyle : null]}>
        {children}
      </View>
    </View>
  );
};

export default Skeleton;
