import theme from '@style';
import React from 'react';
import {
  View,
  ViewProps,
  Image,
  StyleProp,
  ViewStyle,
  StatusBar,
  TextStyle,
} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Text from '@basicComponents/text';
import {Shadow, ShadowProps} from 'react-native-shadow-2';
import globalStore from '@/services/global.state';
import DownloadProgress from '@/components/business/detail-nav-title/progress';
import {BackIcon} from '@/common-pages/invitation/svg.variables';

export type NavTitleProps = ViewProps &
  ShadowProps & {
    /** title,如果传入了children,不会显示title */
    title?: string;
    /** titleColor,title颜色 */
    titleColor?: TextStyle['color'] | null;
    /** 关闭按钮回调,如果不传入,不会显示关闭按钮 */
    onClose?: () => void;
    /** 返回按钮回调,如果不传入,不会显示返回按钮 */
    onBack?: () => void;
    /** 是否需要在右侧自定义内容,会显示在close(如果有)的左侧 */
    rightNode?: React.ReactNode;
    /** 是否需要在左侧自定义内容,会显示在back(如果有)的右侧 */
    leftNode?: React.ReactNode;
    /** 设置返回按钮颜色*/
    iconColor?: 'white' | 'black';
    containerStyle?: StyleProp<ViewStyle>;
    fullScreen?: boolean;
    showProgress?: boolean;
    rate?: number;
  };

const NavTitle = (props: NavTitleProps) => {
  const {
    style,
    rightNode,
    leftNode,
    children,
    containerStyle,
    title,
    titleColor = theme.fontColor.white,
    showProgress = false,
    rate = 0,
    fullScreen = globalStore.fullScreen,
    iconColor = 'white',
    onClose,
    onBack,
    ...otherProps
  } = props;
  const zIndex = {
    zIndex: 1,
  };

  return (
    <View style={[theme.position.rel, theme.fill.fillW, zIndex, style]}>
      <Shadow
        {...theme.shadow.noShadow}
        style={[
          theme.fill.fillW,
          theme.flex.center,
          theme.position.rel,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: (fullScreen ? StatusBar.currentHeight || 0 : 0) + 52,
            paddingTop: fullScreen ? StatusBar.currentHeight : 0,
          },
          theme.padding.lrl,
          theme.flex.row,
          theme.shadow.noShadow.style,
          containerStyle,
        ]}
        disabled={true}
        {...otherProps}>
        {onBack && (
          <NativeTouchableOpacity
            style={[
              theme.icon.l,
              theme.position.abs,
              theme.fill.fillH,
              theme.flex.center,
              zIndex,
              {
                left: theme.paddingSize.l,
              },
            ]}
            onPress={onBack}>
            {iconColor === 'white' ? (
              <BackIcon
                width={theme.iconSize.s}
                height={theme.iconSize.s}
                stroke={theme.basicColor.white}
              />
            ) : (
              <Image
                style={theme.icon.l}
                source={require('@components/assets/icons/back.webp')}
              />
            )}
          </NativeTouchableOpacity>
        )}
        {leftNode && (
          <View
            style={[
              theme.position.abs,
              theme.fill.fillH,
              theme.flex.center,
              zIndex,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                left:
                  (onBack ? theme.iconSize.l + theme.paddingSize.l : 0) +
                  theme.paddingSize.l,
                zIndex: 1,
              },
            ]}>
            {leftNode}
          </View>
        )}
        {children ? (
          children
        ) : (
          <Text
            fontSize={theme.fontSize.l}
            fontFamily="fontInterBold"
            color={titleColor}>
            {title}
          </Text>
        )}
        {rightNode && (
          <View
            style={[
              theme.position.abs,
              theme.flex.center,
              zIndex,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                right:
                  (onClose ? theme.iconSize.l + theme.paddingSize.l : 0) +
                  theme.paddingSize.l,
                height: 52,
                bottom: 0,
              },
            ]}>
            {rightNode}
          </View>
        )}
        {onClose && (
          <NativeTouchableOpacity
            style={[
              theme.icon.l,
              theme.position.abs,
              theme.flex.center,
              zIndex,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                right: theme.paddingSize.l,
                height: 52,
                bottom: 0,
              },
            ]}
            onPress={onClose}>
            {
              <Image
                style={theme.icon.l}
                source={require('@components/assets/icons/close.webp')}
              />
            }
          </NativeTouchableOpacity>
        )}
      </Shadow>
      {showProgress && globalStore.isAndroid && rate > 0 && (
        <DownloadProgress rate={rate} />
      )}
    </View>
  );
};

export default NavTitle;
