module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-native/recommended'],
  plugins: ['react', 'react-native'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 允许使用内联样式
    'react-native/no-inline-styles': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
