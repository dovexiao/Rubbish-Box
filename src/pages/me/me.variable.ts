import i18n from '@/i18n';
import {goTo} from '@/utils';

export const notYetWarning: {type: 'warning' | 'success'; message: string} = {
  type: 'warning',
  message: i18n.t('warning.unopen'),
};

export function toLogin() {
  goTo('Login');
}

export const headerSize = 40;
export const smallHeaderSize = 32;
export const rightIconSize = 14;

export const topBackground = '';
export const moneyBackground = '';
// 头像之后可能会用组件里面的头像图片
export const emptyHeaderImg = require('@components/assets/icons/default-header.webp');
export const defaultHeaderImg = require('@components/assets/icons/default-header.webp');
export const rightIcon = require('@assets/icons/me/right.webp');
export const whiteRightIcon = require('@/assets/icons/chevron_right.webp');
