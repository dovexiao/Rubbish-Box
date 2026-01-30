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
  Edge,
} from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import IconFont from '@/iconfont';
import StatusError from './StatusError';
import StatusLogin from './StatusLogin';
import { LOGIN } from '@/constants';

/**
 * 页面导航栏配置类型
 */
interface PageNavProps {
  /** 导航栏标题 */
  text?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 导航栏背景色 */
  background?: string;
  /** 右侧额外节点（弃用，建议用 rightContent） */
  extraNode?: React.ReactNode;
  /** 左侧自定义内容 */
  leftContent?: React.ReactNode;
  /** 右侧自定义内容 */
  rightContent?: React.ReactNode;
  /** 自定义返回点击事件 */
  onBackPress?: () => void;
  /** 标题颜色 */
  titleColor?: string;
}

/**
 * 页面容器组件属性类型
 */
interface PageContainerProps {
  /** 页面内容 */
  children: React.ReactNode;

  // --- 样式相关 ---
  /** 背景颜色，默认白色 */
  backgroundColor?: string;
  /** 背景图片，设置后会自动处理沉浸式状态栏 */
  backgroundImage?: ImageSourcePropType;
  /** 容器样式 */
  style?: ViewStyle;
  /** 内容容器样式（仅 scrollable=true 时生效） */
  contentContainerStyle?: ViewStyle;

  // --- 布局与安全区 ---
  /** 统一内边距 */
  padding?: number;
  /** 水平内边距 */
  paddingHorizontal?: number;
  /** 垂直内边距 */
  paddingVertical?: number;
  /** 安全区边界配置，默认 ['top', 'bottom'] */
  safeAreaEdges?: Edge[];
  /** 是否启用 ScrollView */
  scrollable?: boolean;
  /** 键盘交互模式 */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  /** 是否启用键盘避让视图 (暂未实装，预留接口) */
  keyboardAvoidingView?: boolean;

  // --- 状态栏 ---
  /** 是否显示状态栏 */
  showStatusBar?: boolean;
  /** 状态栏样式 */
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  /** 状态栏背景色 */
  statusBarBackgroundColor?: string;

  // --- 头部与底部 ---
  /** 自定义头部组件 */
  header?: React.ReactNode;
  /** 自定义底部组件 */
  footer?: React.ReactNode;
  /** 简易导航栏配置（优先级高于 header） */
  pageNavProps?: PageNavProps;

  // --- 状态展示 ---
  /** 是否处于加载中 */
  loading?: boolean;
  /** 加载中遮罩样式 */
  loadingStyle?: ViewStyle;
  /** 加载指示器颜色 */
  loadingIndicatorColor?: string;
  /** 加载遮罩背景色 */
  loadingBackgroundColor?: string;

  /** 错误信息对象 */
  error?: {
    code?: string | number;
    message?: string;
  } | null;
  /** 是否全屏展示错误（覆盖整个页面内容） */
  fullScreenError?: boolean;
  /** 错误重试回调 */
  onRetry?: () => void;
}

/**
 * 计算内边距样式
 */
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
  // 样式默认值
  backgroundColor = '#FFFFFF',
  backgroundImage,
  style,
  contentContainerStyle,
  // 布局默认值
  padding = 0,
  paddingHorizontal = 0,
  paddingVertical = 0,
  safeAreaEdges = ['top', 'bottom'],
  scrollable = false,
  keyboardShouldPersistTaps = 'handled',
  // 状态栏默认值
  statusBarStyle = 'dark-content',
  statusBarBackgroundColor = 'transparent',
  showStatusBar = true,
  // 头部底部
  header,
  footer,
  pageNavProps,
  // 状态展示
  loading = false,
  loadingStyle,
  loadingIndicatorColor = '#333333',
  loadingBackgroundColor = 'rgba(0,0,0,0.3)',
  error,
  fullScreenError = false,
  onRetry,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // 1. 导航栏处理 (Navigation Header)
  const renderNavHeader = useMemo(() => {
    // 优先渲染 pageNavProps 配置的导航栏
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

      const navRightContent = extraNode || rightContent;

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
    // 否则渲染传入的 header 组件
    return header;
  }, [pageNavProps, header, backgroundImage, navigation]);

  // 2. 内容区域处理 (Content)

  // 计算内容容器的基础样式
  const contentStyle: ViewStyle = useMemo(
    () => ({
      flex: 1,
      // 如果有背景图，内容背景需透明
      backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
      ...getPaddingStyle(padding, paddingHorizontal, paddingVertical),
      ...style,
    }),
    [
      backgroundColor,
      backgroundImage,
      padding,
      paddingHorizontal,
      paddingVertical,
      style,
    ],
  );

  const renderContent = useMemo(() => {
    // A. 全屏错误展示
    if (error && fullScreenError) {
      const codeStr =
        error.code !== undefined && error.code !== null && error.code !== ''
          ? String(error.code)
          : undefined;

      if (codeStr === String(LOGIN)) {
        return <StatusLogin />;
      }
      return <StatusError error={error} onRetry={onRetry} />;
    }

    // B. 可滚动内容 (ScrollView)
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
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          bottomOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {children}
        </KeyboardAwareScrollView>
      );
    }

    // C. 普通视图
    return <View style={contentStyle}>{children}</View>;
  }, [
    error,
    fullScreenError,
    scrollable,
    children,
    padding,
    paddingHorizontal,
    paddingVertical,
    contentContainerStyle,
    contentStyle,
    keyboardShouldPersistTaps,
    onRetry,
  ]);

  // 3. 安全区与背景图适配 (Safe Area & Background)

  /**
   * 核心逻辑：背景图沉浸式适配
   *
   * 当存在 backgroundImage 时：
   * 1. SafeAreaView 的 top/bottom edges 被禁用，使其延伸到屏幕边缘（覆盖状态栏）。
   * 2. 我们通过 manualPaddingStyle 手动给内容容器添加 padding，确保内容不被状态栏遮挡。
   *
   * 这样做的目的是让 ImageBackground 作为最外层父容器铺满全屏，而内容依然在安全区内。
   */

  // 计算 SafeAreaView 的 edges
  const finalEdges = useMemo(() => {
    if (backgroundImage) {
      return safeAreaEdges.filter(e => e !== 'top' && e !== 'bottom');
    }
    return safeAreaEdges;
  }, [backgroundImage, safeAreaEdges]);

  // 计算手动补充的 padding
  const manualPaddingStyle = useMemo(() => {
    if (!backgroundImage) return {};
    const style: ViewStyle = {};
    if (safeAreaEdges.includes('top')) {
      style.paddingTop = insets.top;
    }
    if (safeAreaEdges.includes('bottom')) {
      style.paddingBottom = insets.bottom;
    }
    return style;
  }, [backgroundImage, safeAreaEdges, insets]);

  // 4. Loading 遮罩
  const renderLoading = () => {
    if (!loading) return null;
    return (
      <View
        style={[
          styles.loadingOverlay,
          { backgroundColor: loadingBackgroundColor },
          loadingStyle,
        ]}
        pointerEvents="auto"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={loadingIndicatorColor} />
        </View>
      </View>
    );
  };

  // 5. Main Render
  return (
    <>
      {/* 状态栏配置 */}
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={statusBarBackgroundColor}
          showHideTransition={'none'}
          translucent
        />
      )}

      {/* 背景容器 */}
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode={'cover'}
      >
        <SafeAreaView
          style={[
            styles.container,
            {
              // 无背景图时使用 backgroundColor，有背景图时透明以便透出 ImageBackground
              backgroundColor: backgroundImage
                ? 'transparent'
                : backgroundColor,
            },
          ]}
          edges={finalEdges}
        >
          {/* 全局 Loading */}
          {renderLoading()}

          {/* 页面主结构 */}
          <View style={[styles.pageContainer, manualPaddingStyle]}>
            {/* 头部区域 */}
            {(header || pageNavProps) && (
              <View style={styles.headerContainer}>{renderNavHeader}</View>
            )}

            {/* 内容区域 */}
            {renderContent}

            {/* 底部区域 */}
            {footer && (
              <View
                style={[
                  styles.footerContainer,
                  // Android 底部额外 padding 适配
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
