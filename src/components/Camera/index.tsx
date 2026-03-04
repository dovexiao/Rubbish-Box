import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  StyleProp,
  StyleSheet,
  StatusBar,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  Camera as RNCamera,
  type CodeType,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Popup from '../Popup';
import { useSafeAreaInsets } from '@/libs/safeAreaContext';
import IconFont from '@/iconfont';

/**
 * 扫码结果的统一约定：
 * - ok: true  表示本次扫码处理成功，可继续扫下一次
 * - ok: false 表示本次扫码处理失败，会弹出错误弹窗，并保持锁定直到调用 rescan()
 */
export type CameraScanOk<TData = any> = { ok: true; data?: TData };
export type CameraScanFail<TData = any, TError = any> = {
  ok: false;
  message?: string;
  data?: TData;
  error?: TError;
};
export type CameraScanResult<TData = any, TError = any> =
  | CameraScanOk<TData>
  | CameraScanFail<TData, TError>;

export interface CameraRef {
  /**
   * 解除“已扫码”锁定并清理上一次扫码信息，用于继续扫码
   * @returns void
   */
  rescan: () => void;
  /**
   * 暂停扫码回调（相机预览仍然存在）
   * @returns void
   */
  pauseScan: () => void;
  /**
   * 恢复扫码回调
   * @returns void
   */
  resumeScan: () => void;
  open: () => void;
  close: () => void;
}

export interface CameraProps<TData = any, TError = any> {
  /**
   * 是否激活相机预览
   * @default true
   */
  active?: boolean;
  /**
   * 前/后置摄像头
   * @default 'back'
   */
  devicePosition?: 'front' | 'back';
  /**
   * 需要识别的码类型
   * @default ['qr']
   */
  codeTypes?: CodeType[];
  /**
   * 扫到码后的回调
   * @param value 扫到的二维码/条码原始字符串
   * @returns
   * - 返回 { ok: true }：成功，解除扫码锁定，允许继续扫下一次
   * - 返回 { ok: false }：失败，弹出错误弹窗并保持锁定，直到 rescan()
   * - 抛异常：视为失败，弹出错误弹窗并保持锁定，直到 rescan()
   * - 返回 void：不干预，解除锁定，允许继续扫码
   */
  onScan?: (
    value: string,
  ) =>
    | Promise<CameraScanResult<TData, TError> | void>
    | CameraScanResult<TData, TError>
    | void;
  /**
   * 自定义错误弹窗渲染
   * @param params.visible 当前是否需要展示
   * @param params.value 触发本次弹窗的扫码原始字符串
   * @param params.result onScan 的返回值/异常包装（若有）
   * @param params.close 仅关闭弹窗（不解除扫码锁）
   * @param params.rescan 关闭弹窗并解除扫码锁，允许继续扫码
   */
  renderErrorPopup?: (params: {
    visible: boolean;
    value: string;
    result?: CameraScanResult<TData, TError>;
    close: () => void;
    rescan: () => void;
  }) => React.ReactNode;
  /**
   * 快速构建扫码页的默认 Header（左侧返回 + 中间标题）
   * - 传入 title 时会自动渲染默认 header
   * - 不传 title 时不渲染 header
   */
  title?: string;
  /**
   * 覆盖层：中间/底部自定义渲染
   * - 用于扫描框、引导文案、按钮等
   */
  content?: React.ReactNode;
  footer?: React.ReactNode;
  present?: 'inline' | 'modal';
  mask?: boolean;
  maskClosable?: boolean;
  onClose?: () => void;
  /**
   * 仅在 present="modal" 时生效：控制状态栏字体颜色
   * - light-content: 白色
   * - dark-content: 黑色
   */
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  /**
   * 是否自动为 header 预留顶部安全区
   * @default true
   */
  safeAreaTop?: boolean;
  /**
   * 是否自动为 footer 预留底部安全区
   * @default true
   */
  safeAreaBottom?: boolean;
  style?: StyleProp<ViewStyle>;
  cameraStyle?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
}

function getErrorMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'string') return err;
  if (typeof (err as any)?.message === 'string') return (err as any).message;
  return undefined;
}

function isScanFail(
  result: CameraScanResult<any, any> | undefined,
): result is CameraScanFail<any, any> {
  return !!result && result.ok === false;
}

/**
 * Camera 组件（基于 react-native-vision-camera）
 *
 * 主要能力：
 * - 支持扫码（二维码/条码）并做“单次触发锁”，避免连续回调
 * - 支持 title/content/footer 覆盖层，方便做扫描框/提示文案/按钮
 * - 扫码后可在 onScan 中请求接口，失败时可用 renderErrorPopup 自定义弹窗
 */
const Camera = forwardRef<CameraRef, CameraProps>(function Camera(
  {
    active = true,
    devicePosition = 'back',
    codeTypes = ['qr'],
    onScan,
    renderErrorPopup,
    title,
    content,
    footer,
    present = 'inline',
    mask = true,
    maskClosable = true,
    onClose,
    statusBarStyle = 'light-content',
    safeAreaTop = true,
    safeAreaBottom = true,
    style,
    cameraStyle = {
      width: '100%',
      height: '100%',
    },
    overlayStyle,
  },
  ref,
) {
  // 权限与设备选择均来自 vision-camera 的 hooks
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(devicePosition);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const isModal = present === 'modal';

  // errorPopupVisible/lastValue/lastResult 用于控制“扫码失败弹窗”的展示与内容
  const [errorPopupVisible, setErrorPopupVisible] = useState(false);
  const [lastValue, setLastValue] = useState('');
  const [lastResult, setLastResult] = useState<CameraScanResult | undefined>(
    undefined,
  );

  // present="modal" 时通过 modalVisible 控制 Modal 是否挂载，slideAnim 控制进场/退场动画
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 触发一次扫码后会锁定，避免连续回调；需要继续扫码时调用 rescan() 解除
  const scanLockedRef = useRef(false);
  // scanEnabled 允许上层暂停/恢复扫码回调（相机预览仍然存在）
  const [scanEnabled, setScanEnabled] = useState(true);

  const rescan = useCallback(() => {
    // 清理锁与上次扫码结果，允许继续扫码
    scanLockedRef.current = false;
    setErrorPopupVisible(false);
    setLastResult(undefined);
    setLastValue('');
  }, []);

  const open = useCallback(() => {
    if (!isModal) return;
    // 打开弹层时默认重置扫码状态，避免带着上一次的锁进入
    rescan();
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isModal, rescan, slideAnim]);

  const close = useCallback(() => {
    if (!isModal) return;
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      setModalVisible(false);
      // close 完成后触发 onClose，交给页面恢复状态栏等副作用
      onClose?.();
    });
  }, [isModal, onClose, slideAnim]);

  // 向外暴露 imperative API（open/close/rescan/pauseScan/resumeScan）
  useImperativeHandle(
    ref,
    () => ({
      rescan,
      pauseScan: () => setScanEnabled(false),
      resumeScan: () => setScanEnabled(true),
      open,
      close,
    }),
    [close, open, rescan],
  );

  useEffect(() => {
    // 组件挂载后主动触发一次权限请求（避免页面首次打开无提示）
    void requestPermission();
  }, [requestPermission]);

  const handleScanned = useCallback(
    async (value: string) => {
      // pauseScan/resumeScan：仅控制回调，不影响相机预览
      if (!scanEnabled) return;
      // 单次触发锁：同一个二维码在短时间内可能会触发多次，这里做兜底
      if (scanLockedRef.current) return;
      scanLockedRef.current = true;

      setLastValue(value);

      try {
        const result = await onScan?.(value);
        if (result && typeof result === 'object' && 'ok' in result) {
          // 返回了约定结构：由上层决定“成功放行”或“失败锁定 + 弹窗”
          if (result.ok) {
            scanLockedRef.current = false;
          } else {
            setLastResult(result);
            setErrorPopupVisible(true);
          }
          return;
        }
        // 未返回约定结构：默认视为“已处理”，放行继续扫码
        scanLockedRef.current = false;
      } catch (err) {
        // 捕获异常：统一转成失败结构并弹窗，同时保持锁定
        setLastResult({
          ok: false,
          message: getErrorMessage(err) ?? '请求失败',
          error: err as any,
        });
        setErrorPopupVisible(true);
      }
    },
    [onScan, scanEnabled],
  );

  const onCodeScanned = useCallback(
    (codes: any) => {
      // vision-camera 的 codes 是数组；这里取第一个码的 value 即可
      const value = codes?.[0]?.value;
      if (value) {
        void handleScanned(value);
      }
    },
    [handleScanned],
  );

  // 交给 vision-camera 的扫码器
  const codeScanner = useCodeScanner({
    codeTypes,
    onCodeScanned,
  });

  const fallbackErrorPopup = useMemo(() => {
    // renderErrorPopup：允许业务自行接管错误弹窗 UI
    if (!errorPopupVisible) return null;
    if (renderErrorPopup) {
      return renderErrorPopup({
        visible: errorPopupVisible,
        value: lastValue,
        result: lastResult,
        close: () => setErrorPopupVisible(false),
        rescan,
      });
    }

    // 默认错误弹窗：展示 message，并提供“我知道了”来关闭弹窗 + rescan
    const rawMessage = isScanFail(lastResult) ? lastResult.message : undefined;
    const message = rawMessage == null ? '请求失败' : rawMessage;

    return (
      <Popup
        visible={errorPopupVisible}
        onClose={() => setErrorPopupVisible(false)}
        title="提示"
        minHeight={150}
        footer={
          <View style={styles.popupFooter}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.popupBtn}
              onPress={() => {
                setErrorPopupVisible(false);
                rescan();
              }}
            >
              <Text style={styles.popupBtnText}>我知道了</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.popupBody}>
          <Text style={styles.popupText}>{message}</Text>
        </View>
      </Popup>
    );
  }, [errorPopupVisible, lastResult, lastValue, renderErrorPopup, rescan]);

  const cameraNode = (() => {
    // 默认 header：只有 title 存在时才渲染（用于扫码页统一的“返回 + 标题”样式）
    const headerNode = title ? (
      <View style={styles.defaultHeader}>
        <TouchableOpacity
          style={styles.defaultHeaderBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (isModal) close();
            else onClose?.();
          }}
        >
          <IconFont name="back" color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.defaultHeaderTitle}>{title}</Text>
        <View style={styles.defaultHeaderRightPlaceholder} />
      </View>
    ) : null;

    if (!hasPermission) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.center}>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.tipText}>正在请求相机权限...</Text>
          </View>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={[styles.container, style]}>
          <View style={styles.center}>
            <Text style={styles.tipText}>无法访问相机设备</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        {/* 相机预览层：始终铺满 */}
        <RNCamera
          style={[StyleSheet.absoluteFill, cameraStyle]}
          device={device}
          isActive={isModal ? active && modalVisible : active}
          codeScanner={codeScanner}
        />
        {/* 覆盖层：承载 header/content/footer（扫描框与提示 UI） */}
        <View style={[styles.overlay, overlayStyle]} pointerEvents="box-none">
          {headerNode ? (
            <View
              style={[styles.header, safeAreaTop && { paddingTop: insets.top }]}
              pointerEvents="box-none"
            >
              {headerNode}
            </View>
          ) : null}

          {content ? (
            <View style={styles.content} pointerEvents="box-none">
              {content}
            </View>
          ) : (
            // content 不传时仍占位，保证 footer 在底部
            <View style={styles.content} pointerEvents="none" />
          )}

          {footer ? (
            <View
              style={[
                styles.footer,
                safeAreaBottom && { paddingBottom: insets.bottom },
              ]}
              pointerEvents="box-none"
            >
              {footer}
            </View>
          ) : null}
        </View>
        {fallbackErrorPopup}
      </View>
    );
  })();

  // present="inline"：直接渲染 cameraNode，不涉及 Modal
  if (!isModal) return cameraNode;
  // present="modal"：未打开时不渲染（避免相机预览后台占用资源）
  if (!modalVisible) return null;

  // 弹层进场：从底部滑入
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        if (maskClosable) close();
      }}
    >
      <View style={styles.modalRoot}>
        {/* 使用透明状态栏 + overFullScreen：让相机画面覆盖到顶部安全区 */}
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={statusBarStyle}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            if (maskClosable) close();
          }}
        >
          {/* Mask：支持可选遮罩与点击关闭 */}
          <Animated.View
            style={[
              styles.modalMask,
              {
                opacity: slideAnim,
                backgroundColor: mask ? 'rgba(0,0,0,0.5)' : 'transparent',
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.modalContent, { transform: [{ translateY }] }]}
          pointerEvents="box-none"
        >
          {cameraNode}
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    width: '100%',
  },
  defaultHeader: {
    height: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  defaultHeaderBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultHeaderRightPlaceholder: {
    width: 24,
    height: 24,
  },
  defaultHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    marginTop: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  popupBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  popupText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  popupFooter: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  popupBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalRoot: {
    flex: 1,
  },
  modalMask: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});

export default Camera;
