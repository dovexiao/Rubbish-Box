import i18n from '@/i18n';

export const walletBackImageIcon = require('@assets/icons/wallet/wallet-background-image.webp');
export const positionIcon = require('@assets/icons/wallet/position.webp');
export const rechargeIcon = require('@assets/icons/me/recharge.webp');
export const transferIcon = require('@assets/icons/common/common.webp');
export const withdrawIcon = require('@assets/icons/me/withdraw.webp');

export const transformIcon = require('@assets/icons/wallet/transform.webp');
export const walletIcon = require('@assets/icons/wallet/wallet.webp');
export const walletBackground = '';
export const notYetWarning: {type: 'warning' | 'success'; message: string} = {
  type: 'warning',
  message: i18n.t('warning.unopen'),
};
