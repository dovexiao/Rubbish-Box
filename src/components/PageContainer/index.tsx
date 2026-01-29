import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  StatusBar,
  View,
  ViewStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import IconFont from '@/iconfont';
import StatusError from './StatusError';
import StatusLogin from './StatusLogin';
import { LOGIN } from '@/constants';

interface PageNavProps {
  text?: string;
  showBack?: boolean;
  background?: string;
  extraNode?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  onBackPress?: () => void;
  titleColor?: string;
}

interface PageContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  backgroundImage?: ImageSourcePropType;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  showStatusBar?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  keyboardAvoidingView?: boolean;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
  loading?: boolean;
  loadingStyle?: ViewStyle;
  loadingIndicatorColor?: string;
  loadingBackgroundColor?: string;
  style?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  pageNavProps?: PageNavProps;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  // 业务错误展示（参考 bok Container 的 Error 行为，做 RN 化封装）
  error?: {
    code?: string | number;
    message?: string;
  } | null;
  /** 是否以整页形式展示错误，而不是仅覆盖局部内容 */
  fullScreenError?: boolean;
  /** 错误态下的重试回调 */
  onRetry?: () => void;
}

// 计算 padding 样式
const getPaddingStyle = (
  padding: number,
  paddingHorizontal?: number,
  paddingVertical?: number,
): ViewStyle => ({
  padding,
  paddingHorizontal: paddingHorizontal ?? padding,
  paddingVertical: paddingVertical ?? padding,
});

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  backgroundColor = '#FFFFFF',
  backgroundImage,
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = 'transparent',
  showStatusBar = true,
  safeAreaEdges = ['top', 'bottom'],
  keyboardAvoidingView = false,
  scrollable = false,
  contentContainerStyle,
  loading = false,
  loadingStyle,
  loadingIndicatorColor = '#333333',
  loadingBackgroundColor = 'rgba(0,0,0,0.3)',
  style,
  header,
  footer,
  padding = 0,
  paddingHorizontal = 0,
  paddingVertical = 0,
  pageNavProps,
  keyboardShouldPersistTaps = 'handled',
  error,
  fullScreenError = false,
  onRetry,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 默认状态栏样式
  const defaultStatusBarStyle = statusBarStyle;

  // 生成导航头部
  const renderNavHeader = useMemo(() => {
    if (pageNavProps) {
      const {
        text,
        showBack = true,
        background,
        extraNode,
        leftContent,
        rightContent,
        onBackPress,
        titleColor = '#333333',
      } = pageNavProps;

      // 构建右侧内容
      const navRightContent = extraNode || rightContent;

      // 简单的导航头部实现（可以后续替换为 Header 组件）
      return (
        <View
          style={[
            styles.navHeader,
            {
              backgroundColor: backgroundImage
                ? 'transparent'
                : background || 'transparent',
            },
          ]}
        >
          <View style={styles.navHeaderLeft}>
            {leftContent}
            {showBack && (
              <TouchableOpacity
                style={styles.navHeaderBack}
                onPress={() => {
                  onBackPress ? onBackPress() : navigation.goBack();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.backButtonText, { color: titleColor }]}>
                  <IconFont name="back" size={24} color={titleColor} />
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {text && (
            <View style={styles.navHeaderCenter}>
              <Text
                style={[styles.navHeaderTitle, { color: titleColor }]}
                numberOfLines={1}
              >
                {text}
              </Text>
            </View>
          )}
          <View style={styles.navHeaderRight}>{navRightContent}</View>
        </View>
      );
    }
    return header;
  }, [pageNavProps, header, backgroundImage]);

  // 默认背景色
  const defaultBackgroundColor = backgroundColor;

  // 内容样式
  const contentStyle: ViewStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: defaultBackgroundColor,
      ...getPaddingStyle(padding, paddingHorizontal, paddingVertical),
      ...style,
    }),
    [
      defaultBackgroundColor,
      padding,
      paddingHorizontal,
      paddingVertical,
      style,
    ],
  );

  // 渲染内容
  const renderContent = useMemo(() => {
    // 若需要整页错误展示，则用统一错误视图替代具体内容
    if (error && fullScreenError) {
      const codeStr =
        error.code !== undefined && error.code !== null && error.code !== ''
          ? String(error.code)
          : undefined;

      if (codeStr && codeStr === String(LOGIN)) {
        return <StatusLogin />;
      }

      return <StatusError error={error} onRetry={onRetry} />;
    }

    if (scrollable) {
      const scrollContentStyle = [
        styles.scrollContent,
        getPaddingStyle(padding, paddingHorizontal, paddingVertical),
        contentContainerStyle,
      ];

      return (
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bottomOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {children}
        </KeyboardAwareScrollView>
      );
    }

    return <View style={contentStyle}>{children}</View>;
  }, [
    scrollable,
    children,
    padding,
    paddingHorizontal,
    paddingVertical,
    contentContainerStyle,
    contentStyle,
    error,
    fullScreenError,
    onRetry,
  ]);

  return (
    <>
      {/* 状态栏 */}
      {showStatusBar && (
        <StatusBar
          barStyle={defaultStatusBarStyle}
          backgroundColor={
            statusBarBackgroundColor ||
            (Platform.OS === 'android' ? defaultBackgroundColor : undefined)
          }
          showHideTransition={'none'}
          translucent={Platform.OS === 'android'}
        />
      )}
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode={'stretch'}
      >
        <SafeAreaView
          style={[
            styles.container,
            {
              backgroundColor: backgroundImage
                ? 'transparent'
                : defaultBackgroundColor,
            },
          ]}
          edges={safeAreaEdges}
        >
          {loading && (
            <View
              style={[
                styles.loadingOverlay,
                {
                  backgroundColor: loadingBackgroundColor,
                },
                loadingStyle,
              ]}
              pointerEvents="auto"
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={loadingIndicatorColor} />
              </View>
            </View>
          )}
          <View style={styles.pageContainer}>
            {/* 头部 */}
            {(header || pageNavProps) && (
              <View style={styles.headerContainer}>{renderNavHeader}</View>
            )}

            {/* 主要内容 */}
            {renderContent}

            {/* 底部 */}
            {footer && (
              <View
                style={[
                  styles.footerContainer,
                  Platform.OS === 'android' && {
                    paddingBottom: insets.bottom + 20,
                  },
                ]}
              >
                {footer}
              </View>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
};

export default PageContainer;
