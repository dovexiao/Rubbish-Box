import globalStore from '@/services/global.state';
import {errorLog, getUrlParams, goTo} from '@utils';
import {SafeAny} from '@types';
import i18n from '@/i18n';
import {getSlotegratorGameStart, postUserInfo} from '@/services/global.service';
import {postLiveAuthorize} from '@/common-pages/game-navigate';
import {Linking} from 'react-native';
declare var window: any;

export function postMessage(data: SafeAny) {
  if (globalStore.isWeb && window.top) {
    window.top.postMessage(
      data,
      getUrlParams(window.location.href).topwindowurl,
    );
  }
}

export function navigateTo(url: string) {
  if (globalStore.isWeb) {
    if (window.top) {
      window.top.location.href = url;
    } else {
      window.location.href = url;
    }
  } else {
    goTo('WebView', {
      nav: false,
      originUrl: url,
    });
  }
}

export function navigateGame(gameName: string, link: string) {
  const homeUrlSpell = globalStore.isWeb
    ? `homeurl=${window.location.origin}/index/casino`
    : '';

  const url = `${link}${
    link.indexOf('?') === link.length - 1
      ? ''
      : link.endsWith('cert=')
      ? ''
      : '&cert='
  }${globalStore.token}&${homeUrlSpell}`;

  goTo('WebView', {
    header: true,
    hideAmount: true,
    headerTitle: gameName,
    originUrl: url,
  });
}

export async function toLiveCasino(
  baseUrl: string,
  table: string,
  name?: string,
) {
  let url = baseUrl;
  if (url.lastIndexOf('?') === -1) {
    url = `${url}?`;
  }
  if (url.lastIndexOf('?') !== url.length - 1) {
    url = `${url}&`;
  }
  try {
    globalStore.globalLoading.next(true);
    const [userInfo, authorize] = await Promise.allSettled([
      postUserInfo(),
      postLiveAuthorize(),
    ]);
    if (userInfo.status === 'fulfilled' && authorize.status === 'fulfilled') {
      const uinfo = userInfo.value;
      const auth = authorize.value;
      url = `${url}token=${auth.authorize}&username=${
        uinfo.userPhone
      }&mobile=true&lobby=A10320&lang=${
        globalStore.lang
      }&options=defaulttable=${table}${
        globalStore.channel !== 'h5' ? ',webview=1' : ''
      }`;
      goTo('WebView', {
        header: true,
        hideAmount: true,
        headerTitle: name || i18n.t('home.live-casino.title'),
        originUrl: url,
      });
    } else {
      errorLog('error', userInfo, authorize);
    }
  } finally {
    setTimeout(() => {
      globalStore.globalLoading.next(false);
    }, 500);
  }
}

export async function toSlotegrator(name: string, id: string) {
  globalStore.globalLoading.next(true);
  try {
    const url = await getSlotegratorGameStart(id);
    goTo('WebView', {
      header: true,
      hideAmount: true,
      headerTitle: name,
      originUrl: url,
    });
  } finally {
    setTimeout(() => {
      globalStore.globalLoading.next(false);
    }, 500);
  }
}

/** 前往客服 */
export const goCS = () => {
  // navigateTo('https://direct.lc.chat/18181035/');
  navigateTo('https://chat.ssrchat.com/service/gcs9nr');
  // goTo('WebView', {
  //   header: true,
  //   headerTitle: 'Official Customer Service',
  //   hideAmount: true,
  //   originUrl: 'https://tawk.to/chat/6783d58baf5bfec1dbea7cf1/1ihdfkb8f',
  // });
};

export const downloadApk = () => {
  const channelId = globalStore.channel;
  if (globalStore.isAndroid) {
    if (channelId === 'supbet') {
      Linking.openURL('https://file.supbet001.com/apk/supbet.apk');
    } else {
      Linking.openURL(`https://file.supbet001.com/apk/supbet_${channelId}.apk
      `);
    }
  }
  if (channelId === 'supbet') {
    location.href = 'https://file.supbet001.com/apk/supbet.apk';
  } else {
    location.href = `https://file.supbet001.com/apk/supbet_${channelId}.apk`;
  }
};
