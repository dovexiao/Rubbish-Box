import globalStore from '@/services/global.state';
import {errorLog, getUrlParams, goTo} from '@utils';
import {SafeAny} from '@types';
import i18n from '@/i18n';
import {getSlotegratorGameStart, postUserInfo} from '@/services/global.service';
import {postLiveAuthorize} from '@/common-pages/game-navigate';
// import {Linking} from 'react-native';
// import envConfig from '@/utils/env.config';
import {NativeModules} from 'react-native';

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

const {NativeActionManager} = NativeModules;

// 调用方法示例
export async function callNativeAction(user: SafeAny) {
  // 调用 showToast
  // NativeActionManager.performNativeAction('showToast', {});
  const userInfo = user || {};
  // 调用 openSaleSmarty
  NativeActionManager.performNativeAction('openSaleSmarty', userInfo);

  // 调用 claseSaleSmarty (注意拼写，原生代码中是 claseSaleSmarty)
  // NativeActionManager.performNativeAction('claseSaleSmarty', {});

  // 调用 uploadUserMessage
  // NativeActionManager.performNativeAction('uploadUserMessage', {
  // //   可以传递参数
  //   userId: '123123',
  //   userName: 'testUser',
  // });
}
/** 前往客服 */
export const goCS = () => {
  // navigateTo('https://direct.lc.chat/18181035/');
  // navigateTo('https://chat.ssrchat.com/service/gtjx8p');
  const selfInfo = globalStore.userInfo || {};
  const orderUserInfo = globalStore.currentOrderInfo || {};
  const userInfo = {
    userId: selfInfo.userName + '',
    username: selfInfo.userId ? selfInfo.userId + '' : '',
    language: globalStore.lang + '',
    // phone: selfInfo.userPhone + '',
    // email: 'No Email',
    phone: orderUserInfo.phone || selfInfo.userPhone || '',
    email: `packageId@${orderUserInfo.packageId || selfInfo.packageId || ''}`,
    desc: globalStore.currentOrder || 'iphone user',
  };
  if (userInfo.username) {
    callNativeAction(userInfo);
  } else {
    const defaultUserInfo = {
      userId: 'player_000000',
      username: 'tourist_player_0000000',
      language: 'en',
      phone: 'No Phone',
      email: 'No Email',
      desc: 'iphone user',
    };
    callNativeAction(defaultUserInfo);
  }
  // callNativeAction(envConfig.getCustomServiceUrl || '');
  // goTo('WebView', {
  //   header: true,
  //   headerTitle: 'Official Customer Service',
  //   hideAmount: true,
  //   originUrl: 'https://tawk.to/chat/6783d58baf5bfec1dbea7cf1/1ihdfkb8f',
  // });
};

export const downloadApk = () => {
  const channelId = globalStore.channel;
  // const channelId = envConfig.getChannelId || globalStore.channel;
  // if (globalStore.isAndroid) {
  //   if (channelId === 'supbet') {
  //     Linking.openURL('https://www.staticimg007.com.com/apk/supbet.apk');
  //   } else {
  //     Linking.openURL(`https://www.staticimg007.com.com/apk/supbet_${channelId}.apk
  //     `);
  //   }
  // }
  if (channelId === 'supbet001') {
    // location.href = envConfig.downloadUrl || '';
    location.href = 'https://www.staticimg007.com/apk/supbet001.apk';
  } else {
    // location.href = envConfig.downloadChannelUrl || '';

    location.href = `https://www.staticimg007.com/apk/supbet001_${channelId}.apk`;
  }
};
