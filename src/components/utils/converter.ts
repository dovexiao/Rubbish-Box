import {CurrencyMap} from '@/services/currency';
import globalStore from '@/services/global.state';

export function convertImgToObscureUrl(url: string) {
  const lastIndex = url.lastIndexOf('?');
  //
  const obscureParam =
    'x-oss-process=image/resize,m_fill,w_100,limit_0/blur,r_10,s_10/quality,q_10';
  if (lastIndex !== -1 && lastIndex !== url.length - 1) {
    return `${url}&${obscureParam}`;
  }
  return `${url}?${obscureParam}`;
}

export function convertImgToWidthUrl(url: string, width: number) {
  const lastIndex = url.lastIndexOf('?');
  const obscureParam = `x-oss-process=image/resize,w_${width}/quality,q_60`;
  if (lastIndex !== -1 && lastIndex !== url.length - 1) {
    return `${url}&${obscureParam}`;
  }
  return `${url}?${obscureParam}`;
}

export type ToPriceSuffixUnit = 'K' | '';

interface ToPriceOptions {
  thousands?: boolean;
  spacing?: boolean;
  fixed?: number;
  currency?: string;
  needToken?: boolean;
  showCurrency?: boolean;
  // 当suffixUnit存在时，无视保留小数位
  // When SuffixUnit exists, ignore the retention of the decimal position
  suffixUnit?: ToPriceSuffixUnit;
  overPrice?: number;
  // 保留小数位的方式，当suffixUnit存在时，该配置无效，并使用向下取整保留小数
  // The way to retain the decimal position, when Suffixunit exists, the configuration is invalid, and use the downward to retain the decimal decimal
  round?: 'round' | 'floor' | 'ceil';
}

export function toPriceStr(
  price?: number,
  {
    thousands = true,
    spacing = false,
    fixed = 2,
    showCurrency = true,
    currency = globalStore.currency,
    needToken = false,
    suffixUnit = '',
    overPrice = 1000000,
    round = 'round',
  }: ToPriceOptions = {
    thousands: true,
    spacing: false,
    fixed: 2,
    showCurrency: true,
    currency: globalStore.currency,
    needToken: false,
    suffixUnit: '',
    overPrice: 1000000,
    round: 'round',
  },
): string {
  if (needToken && !globalStore.token) {
    return '-';
  }
  const space = spacing ? ' ' : '';
  if (!price) {
    return `${showCurrency ? currency : ''}${space}${(0).toFixed(fixed)}`;
  }

  if (suffixUnit === 'K') {
    if (price >= overPrice) {
      return (
        toPriceStr(Math.floor(price / 1000), {
          thousands: false,
          spacing,
          fixed: 0,
          showCurrency,
          currency,
          needToken,
        }) + 'K'
      );
    }
    return toPriceStr(price, {
      thousands,
      spacing,
      fixed,
      showCurrency,
      currency,
      needToken,
      round,
    });
  }
  let processedPrice = price;
  if (round === 'floor') {
    processedPrice =
      Math.floor(price * Math.pow(10, fixed)) / Math.pow(10, fixed);
  } else if (round === 'ceil') {
    processedPrice =
      Math.ceil(price * Math.pow(10, fixed)) / Math.pow(10, fixed);
  }
  const priceStr = processedPrice.toFixed(fixed);
  if (thousands) {
    if (currency === CurrencyMap.INR) {
      return `${
        showCurrency ? currency : ''
      }${space}${processedPrice.toLocaleString('en-IN', {
        maximumFractionDigits: fixed,
        minimumFractionDigits: fixed,
      })}`;
    }
    return `${
      showCurrency ? currency : ''
    }${space}${processedPrice.toLocaleString('en-US', {
      maximumFractionDigits: fixed,
      minimumFractionDigits: fixed,
    })}`;
  }
  return `${showCurrency ? currency : ''}${space}${priceStr}`;
}
