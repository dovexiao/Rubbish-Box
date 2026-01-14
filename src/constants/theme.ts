/**
 * 主题配置
 * 统一管理应用的主题颜色和样式
 */

// 主题颜色
export const theme = {
  // 文本颜色
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    placeholder: '#CCCCCC',
    error: '#ff2b24',
  },
  // 背景颜色
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#F7F7FB',
  },
  // 边框颜色
  border: {
    default: '#E1E1E1',
    error: '#ff2b24',
  },
  // TextInput 相关
  input: {
    cursorColor: '#333333', // 光标颜色
    selectionColor: '#333333', // 选中文本背景色
    underlineColorAndroid: 'transparent', // Android 下划线颜色
  },
  // 按钮颜色
  button: {
    primary: '#333333',
    disabled: '#999999',
  },
} as const;

// 导出类型
export type Theme = typeof theme;
