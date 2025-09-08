const {alias} = require('react-app-rewire-alias');
const {babelInclude} = require('customize-cra');
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = function override(config, env) {
  alias({
    '@': 'src',
    '@style': 'src/style',
    '@types': 'src/types',
    '@utils': 'src/utils',
    '@i18n': 'src/i18n',
    '@components': 'src/components',
    '@basicComponents': 'src/components/basic',
    '@businessComponents': 'src/components/business',
    '@assets': 'src/assets',
    '@services': 'src/services',
  })(config);
  babelInclude([
    path.resolve('src'),
    path.resolve('node_modules/react-native-shadow-2'),
    path.resolve('node_modules/@rneui/base'),
    path.resolve('node_modules/@rneui/themed'),
    path.resolve('node_modules/react-native-ratings'),
    path.resolve('node_modules/react-native-countdown-component'),
    path.resolve('node_modules/react-native-webview'),
    path.resolve('node_modules/rxjs'),
    path.resolve('node_modules/react-native-vector-icons'),
  ])(config);
  // 查看包体大小
  // const BundleAnalyzerPlugin =
  //   require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  // const WebpackStatsViewerPlugin =
  //   require('webpack-stats-viewer-plugin').WebpackStatsViewerPlugin;
  // config.plugins.push(new BundleAnalyzerPlugin());
  // config.plugins.push(
  //   new WebpackStatsViewerPlugin({
  //     open: true,
  //   }),
  // );

  config.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: process.env.mode !== 'production',
    }),
    // 排除列表
    ...[
      // lottie动画相关
      /src\/wallet\.tsx$/, // 钱包
      /lottie-react-native/, // lottie库
      // lottie动画相关
      /react-native-image-picker/, //图片相机库
      /react-native-code-push/, // 热更新
      /react-native-firebase/, // firebase
      /react-native-moengage/, // 客服相关
      /react-native-fs/, // 文件上传
      /react-native-adjust/, // 文件上传
      // /react-native-pager-view/, // Adjust SDK
    ].map(resourceRegExp => new webpack.IgnorePlugin({resourceRegExp})),
    new Dotenv(),
  );

  if (process.env.NODE_ENV === 'production') {
    const SplitChunksPlugin = require('webpack').optimize.SplitChunksPlugin;
    config.plugins.push(
      new SplitChunksPlugin({
        minChunks: 2,
        excludeFromChunkNames: [
          'react',
          'react-native',
          'react-native-web',
          'react-dom',
        ],
        chunks: 'all',
        maxSize: 200000,
        minSize: 20000,
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
        },
      }),
    );
    config.optimization.runtimeChunk = 'single';
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    };
  }

  // config.resolve.fallback = {
  //   path: require.resolve('path-browserify'),
  //   os: require.resolve('os-browserify/browser'),
  // };

  return config;
};
