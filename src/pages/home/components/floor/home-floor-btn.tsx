import LinearGradient from '@basicComponents/linear-gradient';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {TouchableOpacityProps} from '@basicComponents/touchable-opacity/touchable-opacity';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {BasicObject} from '@/types';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {Shadow} from 'react-native-shadow-2';

const HomeFloorBtn = (
  prpps: TouchableOpacityProps & {
    linerGradientContainerStyle?: StyleProp<ViewStyle>;
  },
) => {
  const {
    children,
    style,
    disabled,
    linerGradientContainerStyle,
    ...otherProps
  } = prpps;

  const shadow = {
    startColor: 'rgba(148, 157, 183, 0.50)',
    distance: 0,
    offset: [0, 1],
    style: [] as BasicObject[],
  } as BasicObject;

  if (globalStore.isWeb) {
    shadow.distance = 0;
    delete shadow.offset;
    shadow.style.push({
      boxShadow: '0 1px 0px 0px rgba(148, 157, 183, 0.50)',
    });
  }
  const opacity = {
    opacity: 0.5,
  };

  const [pressIn, setPressIn] = React.useState(false);
  return (
    <TouchableOpacity
      disabled={disabled}
      onPressIn={() => setPressIn(true)}
      onPressOut={() => setPressIn(false)}
      style={[theme.position.rel, {padding: theme.paddingSize.xxs / 2}, style]}
      containerStyle={disabled ? opacity : null}
      {...otherProps}>
      <Shadow
        {...shadow}
        style={[shadow.style, theme.borderRadius.xs, theme.overflow.hidden]}>
        <LinearGradient
          style={[linerGradientContainerStyle, theme.flex.center]}
          start={{x: 1, y: 1}}
          end={{x: 1, y: 0}}
          colors={['#DFE3ED', '#F2F6FF']}>
          {children}
        </LinearGradient>
        {pressIn && (
          <LinearGradient
            style={[
              linerGradientContainerStyle,
              theme.fill.fill,
              theme.position.abs,
            ]}
            start={{x: 1, y: 1}}
            end={{x: 1, y: 0}}
            colors={['rgba(0, 0, 0, 0.20)', 'rgba(0, 0, 0, 0.20)']}
          />
        )}
      </Shadow>
    </TouchableOpacity>
  );
};

// border-radius: 4px;
// background: linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), linear-gradient(180deg, #F2F6FF 0%, #DFE3ED 100%);
// box-shadow: 0px 1px 0px 0px #ADB3C8;
export default HomeFloorBtn;
