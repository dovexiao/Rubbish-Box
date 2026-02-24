module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // TS 项目用这条（黄色警告）
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // 允许使用内联样式
    'react-native/no-inline-styles': 'off',
    // React Hooks 依赖数组完整性校验
    'react-hooks/exhaustive-deps': 'warn',
  },
};
