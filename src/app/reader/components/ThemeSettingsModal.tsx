import React, { useEffect } from 'react';
import {View, TouchableOpacity, Text, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useReaderThemeStore, type ReaderTheme} from '../store/useReaderTheme';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';

export interface ThemeSettingsModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
}

/**
 * 主题设置弹窗组件
 * 提供字体大小调节和主题切换功能
 */
const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  // 使用 useReaderTheme hook 获取主题相关功能
  const {
    themes,
    currentThemeIndex,
    changeTheme,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
  } = useReaderThemeStore();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 点击背景关闭 */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* 设置卡片主体 */}
        <View style={styles.settingsCard}>
          {/* 标题栏 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>主题与设置</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="close-circle" size={rpx(24)} color="#B0B0B0" />
            </TouchableOpacity>
          </View>

          {/* 字体大小调节栏 */}
          <View style={styles.fontSizeControlBar}>
            <TouchableOpacity
              style={styles.fontSizeBtnLeft}
              onPress={decreaseFontSize}
              activeOpacity={0.7}
            >
              <Text style={styles.fontSizeBtnText}>小</Text>
            </TouchableOpacity>
            <View style={styles.fontSizeDivider} />
            <TouchableOpacity
              style={styles.fontSizeBtnRight}
              onPress={increaseFontSize}
              activeOpacity={0.8}
            >
              <Text style={styles.fontSizeBtnText}>大</Text>
            </TouchableOpacity>
          </View>

          {/* 亮度调节 (已注释) */}
          {/* <View style={styles.brightnessControlRow}>
            <Ionicons name="sunny-outline" size={18} color="#8E8E93" />
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: '40%' }]} />
              <View style={styles.sliderThumb} />
            </View>
            <Ionicons name="sunny" size={22} color="#8E8E93" />
          </View> */}

          {/* 分割线 */}
          <View style={styles.sectionDivider} />

          {/* 主题选择网格 */}
          <View style={styles.themeGrid}>
            {themes.map((themeOption: ReaderTheme, index: number) => {
              const isSelected = currentThemeIndex === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeItem,
                    {backgroundColor: themeOption.bgColor},
                    isSelected && styles.themeItemActive,
                  ]}
                  onPress={() => changeTheme(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.themePreviewTextContainer}>
                    <Text
                      style={[
                        styles.themePreviewBig,
                        {color: themeOption.textColor},
                      ]}>
                      大
                    </Text>
                    <Text
                      style={[
                        styles.themePreviewSmall,
                        {color: themeOption.textColor},
                      ]}>
                      小
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.themeNameText,
                      {color: themeOption.textColor, opacity: 0.8},
                    ]}>
                    {themeOption.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = createStyles({
  overlay: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明黑色背景
  },
  // 核心卡片样式
  settingsCard: {
    width: 301.5625, // 772 * 750 / 1920
    backgroundColor: '#F2F2F6', // iOS 风格浅灰底色
    borderRadius: 11.71875, // 30 * 750 / 1920
    paddingVertical: 17.1875, // 44 * 750 / 1920
    paddingHorizontal: 24.21875, // 62 * 750 / 1920
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3.90625}, // 10 * 750 / 1920
    shadowOpacity: 0.25,
    shadowRadius: 7.8125, // 20 * 750 / 1920
    elevation: 3.90625, // 10 * 750 / 1920
  },
  // 顶部标题栏
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 17.1875, // 44 * 750 / 1920
  },
  cardTitle: {
    fontSize: 11.71875, // 30 * 750 / 1920
    fontWeight: '600' as const,
    color: '#000',
    marginLeft: 1.5625, // 4 * 750 / 1920
  },
  closeButton: {
    padding: 0,
  },
  // 字体大小控制条（灰色大圆角矩形）
  fontSizeControlBar: {
    flexDirection: 'row' as const,
    height: 46.875, // 120 * 750 / 1920
    backgroundColor: '#DCDCDC', // 稍深一点的灰色
    borderRadius: 4.6875, // 12 * 750 / 1920
    marginBottom: 17.1875, // 44 * 750 / 1920
    alignItems: 'center' as const,
  },
  fontSizeBtnLeft: {
    flex: 1,
    height: '100%' as any,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fontSizeBtnRight: {
    flex: 1,
    height: '100%' as any,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  fontSizeBtnText: {
    fontSize: 11.71875, // 30 * 750 / 1920
    fontWeight: '500' as const,
    color: '#000',
  },
  fontSizeDivider: {
    width: 1.171875, // 3 * 750 / 1920
    height: 34.765625, // 89 * 750 / 1920
    backgroundColor: '#BEBEBE', // 分割线颜色
  },
  // 亮度调节行（已注释）
  // brightnessControlRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginBottom: 20,
  //   paddingHorizontal: 4,
  // },
  // sliderTrack: {
  //   flex: 1,
  //   height: 6,
  //   backgroundColor: '#E5E5EA',
  //   borderRadius: 3,
  //   marginHorizontal: 12,
  //   position: 'relative',
  //   overflow: 'visible',
  // },
  // sliderFill: {
  //   height: '100%',
  //   backgroundColor: '#5D5D5D', // 深灰色进度条
  //   borderRadius: 3,
  // },
  // sliderThumb: {
  //   position: 'absolute',
  //   right: '60%', // 对应 width: 40%
  //   top: -8, // (22 - 6) / 2 * -1 让滑块垂直居中
  //   width: 22,
  //   height: 22,
  //   borderRadius: 11,
  //   backgroundColor: '#FFFFFF',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 3,
  //   elevation: 3,
  // },
  // 分割细线
  sectionDivider: {
    height: 1.171875, // 3 * 750 / 1920
    backgroundColor: '#DEDEDF',
    marginBottom: 17.1875, // 44 * 750 / 1920
  },
  // 主题网格
  themeGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 12.5,
  },
  themeItem: {
    flex: 1,
    // width: '30%' as any,
    aspectRatio: 1.3, // 宽长方形
    borderRadius: 5.859375, // 15 * 750 / 1920
    padding: 3.90625, // 10 * 750 / 1920
    alignItems: 'center' as const,
    justifyContent: 'space-evenly' as const,
    borderWidth: 1.5625, // 4 * 750 / 1920
    borderColor: 'transparent', // 默认无边框
    marginBottom: 4.6875, // 12 * 750 / 1920
    // 阴影让卡片浮起来
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.390625}, // 1 * 750 / 1920
    shadowOpacity: 0.05,
    shadowRadius: 0.78125, // 2 * 750 / 1920
    elevation: 0.390625, // 1 * 750 / 1920
  },
  themeItemActive: {
    borderColor: '#1E1E1ECC', // 选中时深色边框
  },
  themePreviewTextContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    marginTop: 1.5625, // 4 * 750 / 1920
  },
  themePreviewBig: {
    fontSize: 12.5, // 32 * 750 / 1920
    fontWeight: 'bold' as const,
    marginRight: 1.5625, // 4 * 750 / 1920
    lineHeight: 12.5, // 32 * 750 / 1920
  },
  themePreviewSmall: {
    fontSize: 10.15625, // 26 * 750 / 1920
    lineHeight: 10.15625, // 26 * 750 / 1920
  },
  themeNameText: {
    fontSize: 9.375, // 24 * 750 / 1920
    fontWeight: '400' as const,
  },
});

export default ThemeSettingsModal;

