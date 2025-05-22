import globalStore from '@/services/global.state';
// import i18n from '@/i18n';
import {Linking} from 'react-native';
import {goCS, goTo} from '@/utils';
// import {getProxyHomeRichText} from '@/common-pages/proxy/proxy.service';
// import {setRenderHtml} from '@/services/globalState';

export async function toAgentApply() {
  // globalStore.globalLoading.next(true);
  // goTo('NewProxyInvitationRule');
  goTo('ArticleDetail', {
    id: 1,
  });
  return;
  // try {
  //   const res = await getProxyHomeRichText();
  //   setRenderHtml(
  //     `<div>
  //     <img src='https://mega-dream.oss-ap-southeast-1.aliyuncs.com/manager/6ab6cd6e7ce14a9293330ae395e112f7.webp' alt=""></div>`.replace(
  //       new RegExp('<img', 'g'),
  //       '<img\nstyle="width:100vw;"',
  //     ) || '',
  //   );
  //   goTo('WebView', {
  //     header: true,
  //     hideAmount: true,
  //     headerTitle: i18n.t('label.agent-rule'),
  //     originHtml: true,
  //     showBottomBtn: true,
  //     link: res?.activityUrl,
  //   });
  // } finally {
  //   globalStore.globalLoading.next(false);
  // }

  // if (globalStore.packageId === 5) {
  //   goTo('WebView', {
  //     originUrl: 'https://99lotto.club/',
  //     header: true,
  //     headerTitle: i18n.t('label.agent-rule'),
  //     hideAmount: true,
  //   });
  //   return;
  // }
  // const pathByLangHandler: Record<string, Record<string, string>> = {
  //   MEGADREAM: {
  //     en_US: '/english-page',
  //     ta_IN: '/tamil-page',
  //     hi_IN: '/hindi-page',
  //     ml_IN: '/malyalam-page',
  //     te_IN: '/telugu',
  //   },
  // };
  // const nameHandler: Record<number, string> = {
  //   // 注释的是还没有的,配置了就解开注释
  //   // 1: 'anna',
  //   2: 'bhau',
  //   3: 'megadream',
  //   5: 'dailylotto',
  //   // 6: 'singam',
  // };
  // const name = nameHandler[globalStore.packageId];
  // if (!name) {
  //   goTo('ProxyRules');
  //   return;
  // }
  // const pathmap = pathByLangHandler[name];
  // const path = pathmap?.[globalStore.lang] ? pathmap[globalStore.lang] : '';
  // console.log(path);
  // goTo('WebView', {
  //   // originUrl: `https://agent-${name}.pages.dev${path}?topwindowurl=${
  //   //   globalStore.isWeb ? location.href : 'android'
  //   // }`,
  //   originUrl: `https://agent-singam.pages.dev/english-page?topwindowurl=https://singamlottery.com/proxy-home`,
  //   header: true,
  //   headerTitle: i18n.t('label.agent-rule'),
  //   hideAmount: true,
  // });
}

export const goAgentService = () => {
  const linkMap: Record<number, string> = {
    3: 'https://nimble.li/v9a88qqd',
  };
  const whatsAppLink = linkMap[globalStore.packageId];
  if (whatsAppLink) {
    Linking.openURL(whatsAppLink);
  } else {
    goCS();
  }
};

export function goWhatsAppChat(userPhone?: string, message?: string) {
  if (!userPhone) {
    return;
  }
  Linking.openURL(
    `https://wa.me/${
      (globalStore.sendPhoneCode ? '' : globalStore.defaultPhoneCode) +
      userPhone
    }${message ? `?text=${encodeURIComponent(message)}` : ''}`,
  );
}
