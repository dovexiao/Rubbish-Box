module.exports = function (api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      // 生产环境移除所有console.*调用（除了console.error和console.warn）
      isProduction && [
        'transform-remove-console',
        {
          exclude: ['error', 'warn']
        }
      ],
      'react-native-reanimated/plugin',
    ].filter(Boolean), // 过滤掉false值
  };
};
