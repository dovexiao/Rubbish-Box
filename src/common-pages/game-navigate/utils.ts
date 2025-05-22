/* eslint-disable prettier/prettier */
import i18n from '@/i18n';
import globalStore from '@/services/global.state';
import {errorLog, goTo, navigateTo} from '@/utils';
import {
  getSlotegratorGameStart,
  // getKMAuthorize,
  postLiveAuthorize,
  postUserInfo,
  // getWSStart,
  getPGStart,
  getNoahPGStart,
  getYGGStart,
  getJILIStart,
  getCQ9Start,
  getFCStart,
  getT1Start,
  getAWCStart,
} from './service';
import {BasicObject} from '@/types';
import {setRenderHtml} from '@/services/globalState';
import useCollectStore from '@/store/useCollectStore';

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
    globalStore.globalLoading.next(false);
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
    globalStore.globalLoading.next(false);
  }
}

// export async function toKMGame(name: string, gameUrl: string, gcode: string) {
//   globalStore.globalLoading.next(true);
//   try {
//     const tokenResult = await getKMAuthorize(gcode);
//     if (!tokenResult.active) {
//       globalStore.globalWaringTotal(i18n.t('tip.game-not-active'));
//       return;
//     }
//     goTo('WebView', {
//       header: true,
//       hideAmount: true,
//       headerTitle: name,
//       originUrl: `${gameUrl}&gcode=${gcode}&token=${tokenResult.authToken}`,
//     });
//   } finally {
//     globalStore.globalLoading.next(false);
//   }
// }

// export async function toWSGame(name: string, id: string) {
//   globalStore.globalLoading.next(true);
//   try {
//     const url = await getWSStart(id);
//     goTo('WebView', {
//       header: true,
//       hideAmount: true,
//       headerTitle: name,
//       originUrl: url,
//     });
//   } finally {
//     globalStore.globalLoading.next(false);
//   }
// }

export async function toPGGame(
  name: string,
  id: string = '',
  provider: string,
) {
  globalStore.globalLoading.next(true);
  try {
    let html = '';
    if (provider === 'NOAH_PG') {
      html = await getNoahPGStart(id);
    } else {
      html = await getPGStart(id);
    }
    setRenderHtml(html);
    return await goTo('WebView', {
      header: true,
      hideAmount: true,
      headerTitle: name,
      originHtml: html,
      showCollect: true,
    });
  } finally {
    globalStore.globalLoading.next(false);
  }
}

export async function toUrlGame(name: string, id: string, provider: string) {
  globalStore.globalLoading.next(true);
  const openGames: {[key: string]: any} = {
    YGG: getYGGStart,
    Evoplay: getYGGStart,
    JILI: getJILIStart,
    CQ9: getCQ9Start,
    FC: getFCStart,
    T1: getT1Start,
    SEXYBCRT: getAWCStart,
  };
  if (!Object.keys(openGames).includes(provider)) {
    globalStore.globalLoading.next(false);
    globalStore.globalTotal.next({
      type: 'warning',
      message: 'The game is not open',
    });
    return;
  }
  try {
    const url = await openGames[provider](id);
    await goTo('WebView', {
      header: true,
      hideAmount: true,
      headerTitle: name,
      originUrl: url,
      showCollect: true,
    });
  } finally {
    globalStore.globalLoading.next(false);
  }
}

export type LotteryType =
  | 'scratch'
  | 'pick3'
  | 'kerala'
  | 'color'
  | 'matka'
  | 'dice'
  | 'quick3d';

export interface GameParams {
  // 游戏名称
  name?: string;
  // 用于判断跳转的厂商
  source: string;
  // 游戏url，部分厂商需要拼接url进行跳转
  gameUrl?: string;
  // 唯一标识，比如SA的defaulttable和KM的gCode
  tripartiteUniqueness?: string;
  // 游戏id，比如Slotegrator和WS-168需要用id获取跳转地址
  id?: number;
  // 游戏类型，如果不传类型默认是小游戏，传入类型且是lottery系的都是本家游戏，有对应跳转配置，对应的gameUrl就是拼接的参数
  type?: string;

  //传入的其他类型参数
  [key: string]: any;
}

function isLottery(type?: string): type is LotteryType {
  if (!type) {
    return false;
  }
  const lotteryTypes = [
    'scratch',
    'pick3',
    'kerala',
    'color',
    'matka',
    'dice',
    'quick3d',
  ];
  return lotteryTypes.indexOf(type) !== -1;
}

export async function toGame({
  source,
  name,
  gameUrl,
  id,
  tripartiteUniqueness,
  gameType,
  provider,
}: GameParams) {
  if (name === 'Quick Race' && gameUrl?.includes('&tag=bh')) {
    gameUrl = gameUrl?.split('&tag=bh').join('&tag=sn');
  }
  const _type = gameType?.toLowerCase();
  if (isLottery(_type)) {
    // lottery类型的游戏单独处理链接
    if (_type === 'scratch') {
      goTo('Scratch', {hideInnerTitle: '1', path: gameUrl});
      return;
    }
    const gameWebviewTypeHandler: Record<
      Exclude<LotteryType, 'scratch'>,
      string
    > = {
      pick3: 'digit',
      kerala: 'kerala',
      color: 'color',
      dice: 'dice',
      matka: 'matka',
      quick3d: 'quick3d',
    };
    goTo('GameWebView', {
      type: gameWebviewTypeHandler[_type],
      params: gameUrl,
      name,
    });
    return;
  }
  if (!globalStore.token) {
    goTo('Login');
    return;
  }
  console.log(11111, name, _type, source, provider);

  const gameHandler: Record<string, () => void> = {
    'SKY GAME': () => navigateGame(name || 'Casino', gameUrl || ''),
    SA: () =>
      toLiveCasino(gameUrl || '', tripartiteUniqueness || '', name || 'Live'),
    PG: () => toPGGame(name || 'PG', id + '', provider || 'PG'),

    // Slotegrator: () => toSlotegrator(name || 'Slotegrator', id + ''),
  };
  if (source === 'SEAG' && provider === 'PG') {
    source = 'PG';
  }
  if ((source === 'SEAG' || source === 'NOAH_PG') && provider === 'NOAH_PG') {
    source = 'PG';
  }

  useCollectStore.setState({openGameId: id});
  useCollectStore.getState().openGameReport();
  if (source === 'SEAG') {
    toUrlGame(name || source, id + '', provider);
    return;
  }
  gameHandler[source]?.();
}

/**
 * 通用地址跳转
 * @param url
 *  直接使用http/https的地址直接外部跳转；
    使用route:开头的情况，后面需要直接使用json字符串进行配置。比如route:{"routeName": "Home","routeParams": {"key": "value"}}这种
    route参数：
    type: "uniapp" | "reacth5" | "rn" 对应平台，默认"rn"；
    needLogin 是否进行登录，如果是一个非空字符串就需要判断登录
    path uniapp或者reacth5平台特有参数，指定的可带参路径
    routeName rn平台特有参数，指定路由名称
    routeParams rn平台特有参数，指定路由所需参数
    noTitle 默认false，如果是true代表不需要头部
    serviceRight 右侧使用客服
    游戏页相关跳转
    route:{"routeName": "WebView", "routeParams": {"hideAmount": true, "originUrl": "游戏url"}}
    使用游戏开头的情况
    SA:{"url": "url", "table": "100"},Slotegrator:{"id": 10000},SKY:{"url": "url"}


 * @param title 外部页面如果有标题就带上顶部标题，没有就算了
 * @returns
 */
export async function goToUrl(url: string, title?: string) {
  if (url.startsWith('http')) {
    // goTo('WebView', {
    //   header: !!title,
    //   hideAmount: true,
    //   headerTitle: title || '',
    //   originUrl: url,
    // });
    navigateTo(url);
    return;
  }
  if (url.startsWith('route:')) {
    try {
      const jsonResult = JSON.parse(url.substring('route:'.length));
      jsonResult.type = jsonResult.type || 'rn';
      jsonResult.needLogin = jsonResult.needLogin || false;
      jsonResult.noTitle = jsonResult.noTitle || false;
      if (jsonResult.needLogin && !globalStore.token) {
        goTo('Login');
        return;
      }
      if (jsonResult.type === 'uniapp' || jsonResult.type === 'reacth5') {
        goTo('WebView', {
          header: !!title && !jsonResult.noTitle,
          hideAmount: false,
          headerTitle: jsonResult.noTitle ? '' : title || '',
          isReactH5: jsonResult.type === 'uniapp' ? '0' : '1',
          serverRight: jsonResult.serverRight || '',
          path: jsonResult.path,
        });
        return;
      }
      if (jsonResult.type === 'rn') {
        goTo(
          jsonResult.routeName,
          Object.assign(
            {},
            jsonResult.routeParams || {},
            !!title && !jsonResult.noTitle
              ? {
                  header: true,
                  headerTitle: title || '',
                }
              : {},
          ),
        );
        return;
      }
    } catch (e) {
      errorLog('jsonresult', e);
      globalStore.globalWaringTotal(i18n.t('invalid-url'));
    }
    return;
  }
  const gamesOptions = [
    {
      prefix: 'SA:',
      toGame: (jsonResult: BasicObject) =>
        toLiveCasino(jsonResult.url, jsonResult.table, title),
    },
    {
      prefix: 'Slotegrator:',
      toGame: (jsonResult: BasicObject) =>
        toSlotegrator(title || jsonResult.title || 'Casino', jsonResult.id),
    },
    {
      prefix: 'SKY:',
      toGame: (jsonResult: BasicObject) =>
        navigateGame(title || jsonResult.title || 'Casino', jsonResult.url),
    },
    {
      prefix: 'WS168:',
      toGame: () => {
        // toWSGame(title || jsonResult.title || 'Live', jsonResult.id),
      },
    },
    {
      prefix: 'KM:',
      toGame: () => {
        // toKMGame(
        //   title || jsonResult.title || 'Casino',
        //   jsonResult.url,
        //   jsonResult.gcode,
        // ),
      },
    },
  ];
  const gameOption = gamesOptions.find(game => url.startsWith(game.prefix));
  if (!gameOption) {
    return;
  }
  try {
    const jsonResult = JSON.parse(url.substring(gameOption.prefix.length));
    toGame(jsonResult);
  } catch (e) {
    errorLog('jsonresult', e);
    globalStore.globalWaringTotal(i18n.t('invalid-url'));
  }
}
