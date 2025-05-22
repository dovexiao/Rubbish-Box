import globalStore from '@/services/global.state';

export const defaultHeader = require('@components/assets/icons/header.webp');
export const smallWinnerIcon = require('./assets/small-win.webp');
export const homeUrlSpell = globalStore.isWeb
  ? `homeurl=${window.location.origin}/index/casino`
  : '';
