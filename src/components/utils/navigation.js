import {Platform} from 'react-native';

import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function navGoBack() {
  if (
    Platform.OS === 'web' &&
    navigationRef.current.getState().routes.length < 2
  ) {
    window.history.back();
  } else {
    navigationRef.goBack();
  }
}
