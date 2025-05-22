import {http} from '@/utils';

export interface WalletAmountListItem {
  // 游戏转出金额
  balance: number;
  gamePic: string;
  name: string;
  // wallet图片地址
  otherUrl: string;
}

export interface WalletAmountInfo {
  gamesList: WalletAmountListItem[];
  totalCreditAmount: number;
}

export function getWalletAmountList() {
  return http.get<null, WalletAmountInfo>('app/personalWallet/getGameAmount');
}

export function doTransferWallet() {
  return http.get<null, null>('app/personalWallet/amountBroughtOut');
}
