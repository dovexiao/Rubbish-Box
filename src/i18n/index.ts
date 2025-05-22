import i18nJSON from '@components/i18n';
import {deepMerge} from '@components/utils/object';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en_US from './en_US';
import hi_IN from './hi_IN';
import ml_IN from './ml_IN';
import ta_IN from './ta_IN';
import te_IN from './te_IN';
import {BasicObject} from '@/types';

const toResources = (translations: BasicObject) => {
  const resources: BasicObject = {};
  for (let key in translations) {
    const currentValue = translations[key];
    resources[key] = {
      translation: currentValue,
    };
  }
  return resources;
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3', // 对安卓进行兼容
  resources: toResources(
    deepMerge(i18nJSON, {en_US, hi_IN, ml_IN, ta_IN, te_IN}),
  ),
  fallbackLng: 'en_US',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const languagesMap: {[k: string]: string} = {
  en_US: 'English',
  hi_IN: 'हिंदी',
  ml_IN: 'മലയാളം',
  ta_IN: 'தமிழ்',
  te_IN: 'తెలుగు',
  //   Hindi -हिंदी
  // Malayalam - മലയാളം
  // Tamil - தமிழ்
  // Telugu - తెలుగు
};
