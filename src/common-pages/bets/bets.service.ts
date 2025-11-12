import {BasicObject, SafeAny} from '@/types';
import {errorLog, http, indusWinHttp, sportsHttp} from '@/utils';
import {Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
export interface NormalType {
  orderStatus: string | '0' | '1' | '2' | '3';
  pageNo: number;
  pageSize: number;
  yearMonth?: string;
}

export interface ResType {
  totalPages: number;
  totalSize: number;
  content: SafeAny[];
}

export const getKerala = (data: NormalType & {lotteryType: 'KERALA'}) => {
  return http.post<null, SafeAny[]>('app/order/pay/list', data);
};

export const get3D = (data: NormalType) => {
  return http.post<null, SafeAny[]>('app/pick/order/list', data);
};

export const getColor = (data: NormalType) => {
  return http.post<null, ResType>('app/redGreen/order/orderList', data);
};

export const getDice = (data: NormalType) => {
  return http.post<null, ResType>('app/diceThree/orderList', data);
};

export const getSatta = (data: NormalType) => {
  return http.post<null, SafeAny[]>('app/matka/order/list', data);
};

export const getScratchAndCasino = (
  data: {
    orderStatus: string | '0' | '1' | '2' | '3';
    pageNo: number;
    pageSize: number;
    endTime: string;
    startTime: string;
  } & {
    gameType: number;
  },
) => {
  return indusWinHttp.post<null, SafeAny[]>(
    'iGaming/igaming/getOrderList',
    data,
  );
};

export const getCasinoData = (data: {
  orderStatus: string | '0' | '1' | '2' | '3';
  pageNo: number;
  pageSize: number;
  gameType: number;
  queryDate: string;
}) => {
  return http.post<null, SafeAny[]>('app/casion/getOrderList', data);
};

export const getSports = (data: {
  orderStatus: string | '0' | '1' | '2' | '3';
  pageNo: number;
  pageSize: number;
  endTime: string;
  startTime: string;
}) => {
  return sportsHttp.post<null, {content: SafeAny[]}>('orderList', data);
};

export const shareToChat = (data: BasicObject) => {
  return http.post('app/share/shareGameToIm', data);
};

export const shareToThird = (
  platform: string,
  info: BasicObject,
  shareToIM: (i: BasicObject) => void,
) => {
  if (platform === 'Chatroom') {
    shareToIM(info);
  } else {
    const link =
      'https://megadream-test.pages.dev/bets-shard?' +
      dtoToQueryString(info?.shareGameDto);
    Clipboard.setString(link);
    switch (platform) {
      case 'Facebook':
        Linking.openURL('fb://messaging').catch(e => errorLog(e));
        break;
      case 'Telegram':
        Linking.openURL(`tg://msg_url?url=${encodeURIComponent(link)}`).catch(
          e => errorLog(e),
        );
        break;
      case 'Whatsapp':
        Linking.openURL('https://wa.me?text=' + link).catch(e => errorLog(e));
        break;
      case 'Instagram':
        Linking.openURL('instagram://media').catch(e => errorLog(e));
        break;
    }
  }
};

export const dtoToQueryString = (obj: BasicObject) => {
  const keyValuePairs = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      keyValuePairs.push(
        encodeURIComponent(key) + '=' + encodeURIComponent(value),
      );
    }
  }
  return keyValuePairs.join('&');
};
