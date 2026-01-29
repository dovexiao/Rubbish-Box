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
  },
};
