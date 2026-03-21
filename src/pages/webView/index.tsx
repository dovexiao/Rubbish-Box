import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import PageContainer from '@/components/PageContainer';

// 定义路由参数类型
const WebViewScreen: React.FC = () => {
  const route = useRoute<any>();
  const { url, title = '网页浏览' } = (route.params || {}) as {
    url?: string;
    title?: string;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 处理加载状态
  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError('页面加载失败，请检查网络连接');
    setLoading(false);
    console.error('WebView error:', nativeEvent);
  };

  // 确定WebView的source
  const getWebViewSource = () => {
    if (url) {
      return { uri: url };
    }
    // 默认显示一个提示页面
    return {
      html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
                color: #333;
              }
              .container {
                text-align: center;
                padding: 20px;
              }
              .icon {
                font-size: 48px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">🌐</div>
              <h2>请提供有效的网页地址</h2>
              <p>请在导航时传递 url</p>
            </div>
          </body>
        </html>
      `,
    };
  };

  return (
    <PageContainer
      backgroundColor={'#F5F5F5'}
      paddingHorizontal={0}
      scrollable={false}
      pageNavProps={{ text: title, showBack: true }}
    >
      <View style={{ flex: 1 }}>
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <ActivityIndicator size="large" color="#1B9666" />
            <Text style={{ marginTop: 10, color: '#666' }}>加载中...</Text>
          </View>
        )}

        {error ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 20 }}>⚠️</Text>
            <Text
              style={{
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              {error}
            </Text>
            <Text
              style={{
                color: '#333',
                fontSize: 16,
                textDecorationLine: 'underline',
              }}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}
            >
              重新加载
            </Text>
          </View>
        ) : (
          <WebView
            source={getWebViewSource()}
            style={{ flex: 1 }}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            mixedContentMode="compatibility"
            onHttpError={syntheticEvent => {
              // 鸿蒙/安卓可能会抛出子资源（如 favicon、打点等）的 404 错误
              // 我们这里只对主文档 url 的 404 进行拦截，确保已成功渲染的网页不会被覆盖
              if (Platform.OS === 'harmony') {
                // 彻底忽略鸿蒙上的 HttpError 误杀：
                // 鸿蒙原生 WebView 的 bug 会将即使是单纯由于 favicon.ico 的 404
                // 也通报为整个当前页面的 404 导致误杀渲染好的主页面。
                return;
              }
              const { nativeEvent } = syntheticEvent;
              const failingUrl = nativeEvent.url || '';
              if (
                nativeEvent.statusCode >= 400 &&
                (failingUrl === url || failingUrl === `${url}/`)
              ) {
                setError(`加载失败 (${nativeEvent.statusCode})`);
                setLoading(false);
              }
            }}
          />
        )}
      </View>
    </PageContainer>
  );
};

export default WebViewScreen;
