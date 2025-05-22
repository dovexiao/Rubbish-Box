import {postUserInfo} from '@/services/global.service';
import globalStore from '@/services/global.state';
import {errorLog, goTo} from '@utils';
import i18n from '@/i18n';
import {postLiveAuthorize} from '@/common-pages/game-navigate';

export async function toLiveCasino(baseUrl: string, table: string) {
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
        headerTitle: i18n.t('home.live-casino.title'),
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
