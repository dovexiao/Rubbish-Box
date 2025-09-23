import {AppRegistry} from 'react-native';
import App from './App';

if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
  console.dir = () => {};
  console.table = () => {};
  console.group = () => {};
}
window.ssq = window.ssq || [];
AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
