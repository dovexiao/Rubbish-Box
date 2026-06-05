export const BANK_INFO: Record<string, string> = {
  工商银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-gongshang.png',
  建设银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jianshe.png',
  交通银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-jiaotong.png',
  民生银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-minsheng.png',
  农业银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-nongye.png',
  中国农业银行:
    'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-nongye.png',
  上海浦东发展银行:
    'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-pufa.png',
  通用银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-tongyong.png',
  兴业银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-xingye.png',
  邮政银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-youzheng.png',
  招商银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhaoshang.png',
  中国银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongguo.png',
  中信银行: 'https://g.18qjz.cn/img/boklock/wallet/bankIcon/bank-zhongxin.png',
};

export const STATE_COLOR: Record<number, string> = {
  1: '#FD8E62',
  2: '#37C22A',
  3: '#FF2B24',
  4: '#FD8E62',
};

type WithdrawState = 1 | 2 | 3 | 4;

export const PROGRESS_IMAGE: Record<WithdrawState, string> = {
  1: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_pendding.png',
  2: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_success.png',
  3: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_fail.png',
  4: 'https://g.18qjz.cn/img/boklock/wallet/withdraw_pendding.png',
};
