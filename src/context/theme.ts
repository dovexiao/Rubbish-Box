/**
 * 主题配置
 * 统一管理应用的主题颜色和样式
 */

// 基础颜色调色板
const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E1E1E1',
  gray300: '#CCCCCC',
  gray600: '#999999',
  gray800: '#666666',
  gray900: '#333333',
  red: '#ff2b24',
  color333: '#333333',
  transparent: 'transparent',
};

// 浅色主题
export const lightTheme = {
  type: 'light',
  colors: {
    text: {
      primary: palette.gray900,
      secondary: palette.gray800,
      tertiary: palette.gray600,
      placeholder: palette.gray300,
      error: palette.red,
      inverse: palette.white,
      color333: palette.color333,
    },
    background: {
      primary: palette.white,
      secondary: palette.gray100,
      tertiary: '#F7F7FB',
    },
    border: {
      default: palette.gray200,
      error: palette.red,
    },
    statusBar: {
      barStyle: 'dark-content' as 'dark-content' | 'light-content',
      backgroundColor: palette.transparent,
    },
  },
};

// 深色主题
export const darkTheme = {
  type: 'dark',
  colors: {
    text: {
      primary: palette.white,
      secondary: palette.gray300,
      tertiary: palette.gray600,
      placeholder: palette.gray800,
      error: palette.red,
      inverse: palette.gray900,
      color333: palette.color333,
    },
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
      tertiary: '#000000',
    },
    border: {
      default: '#333333',
      error: palette.red,
    },
    statusBar: {
      barStyle: 'light-content' as 'dark-content' | 'light-content',
      backgroundColor: palette.transparent,
    },
  },
};

export type Theme = typeof lightTheme;
export type ThemeType = 'light' | 'dark';

// 默认主题配置（供不使用 ThemeContext 的组件引用）
export const theme = {
  input: {
    cursorColor: lightTheme.colors.text.primary,
    selectionColor: lightTheme.colors.text.primary,
    underlineColorAndroid: 'transparent',
  },
};
