module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src/',
          '@style': './src/style/',
          '@types': './src/types/',
          '@utils': './src/utils/',
          '@i18n': './src/i18n/',
          '@components': './src/components/',
          '@basicComponents': './src/components/basic/',
          '@businessComponents': './src/components/business/',
          '@assets': './src/assets/',
          '@services': './src/services/',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
