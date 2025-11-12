import {AppRegistry, Platform, UIManager} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import serviceWorkerRegistration from './src/service-worker-registration';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  const rootTag =
    document.getElementById('root') || document.createElement('div');
  if (!document.getElementById('root')) document.body.appendChild(rootTag);

  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag,
  });

  // ✅ 确保 DOM 加载后再注册 SW
  window.addEventListener('load', () => {
    console.log('========== register service worker =========');
    serviceWorkerRegistration.register();
  });
}
