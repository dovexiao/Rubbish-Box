import {AppRegistry, Platform, UIManager} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
// import 'react-native-gesture-handler';
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
AppRegistry.registerComponent(appName, () => App);
