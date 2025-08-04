import globalStore from '@/services/global.state';
import {BasicObject, SafeAny} from '../types';

export const getUUID = () => {
  var s = [];
  var hexDigits = '0123456789abcdef';
  for (var i = 0; i < 36; i++) {
    const index = Math.floor(Math.random() * 0x10);
    s[i] = hexDigits.substring(index, index + 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  const index = (s[19] && 0x3) || 0x8;
  s[19] = hexDigits.substring(index, index + 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23];
  return s.join('');
};

export const getUrlParams = (search?: string) => {
  if (!globalStore.isWeb) {
    return {};
  }
  if (!search) {
    search = location?.href.split('?')[1];
  }
  const params: BasicObject = {};
  const searchParams = new URLSearchParams(search).entries();
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
};

export const parseCookie = (cookieString?: string) => {
  if (!globalStore.isWeb) {
    return {};
  }
  if (!cookieString) {
    cookieString = document.cookie;
  }
  const cookieArray = cookieString.split(';');
  const cookieObject: BasicObject = {};
  cookieArray.forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    cookieObject[key] = decodeURIComponent(value);
  });
  return cookieObject;
};

export const objectToUrlParams = (obj: BasicObject) => {
  const params = new URLSearchParams();
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const serializedValue =
        typeof value === 'object' ? JSON.stringify(value) : value;
      params.append(key, serializedValue);
    }
  }
  return params.toString();
};

/** 基础节流 */
export function throttle<T extends any[]>(
  fn: (...args: T) => void,
  delay: number = 200,
): (this: any, ...args: T) => void {
  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout>;

  return function (this: any, ...args: T) {
    const currentTime = Date.now();

    if (currentTime - lastTime < delay) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = currentTime;
      }, delay);
    } else {
      fn.apply(this, args);
      lastTime = currentTime;
    }
  };
}

/** 基础防抖 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 200,
): (...args: Parameters<T>) => void {
  let timerId: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    timerId && clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/** 会直接触发一次,然后再防抖 */
export function debounceWithImmediate<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 200,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let isFirstExecution = true;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId!);

    if (isFirstExecution) {
      isFirstExecution = false;
      func.apply(this, args);
    }

    timeoutId = setTimeout(() => {
      isFirstExecution = true;
    }, delay);
  };
}

export const getDate = (date: Date | string | number) => {
  if (!(date instanceof Date)) {
    if (typeof date === 'number' && (date + '').length < 11) {
      date = date * 1000;
    }
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
  }
  return date;
};

/**
 * 基础的时间格式化方法
 * @param date 需要格式化的时间,可以是字符串或者数字,如果是数字,会自动*1000
 * @param format 会将字符串中的yyyy/MM/dd/hh/mm/ss替换为具体的值
 * @returns
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'yyyy-MM-dd hh:mm:ss',
): string {
  const _date = getDate(date);
  if (_date === 'Invalid Date') {
    return _date;
  }
  const year = _date.getFullYear().toString();
  const month = (_date.getMonth() + 1).toString().padStart(2, '0');
  const day = _date.getDate().toString().padStart(2, '0');
  const hours = _date.getHours();
  const isPM = hours > 11;
  const ishh = format.indexOf('hh') > -1;
  const hours_12 = isPM ? hours - 12 : hours;
  const minutes = _date.getMinutes().toString().padStart(2, '0');
  const seconds = _date.getSeconds().toString().padStart(2, '0');
  return (
    format
      .replace('yyyy', year)
      .replace('yy', year.toString().substring(2))
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('hh', hours_12.toString().padStart(2, '0'))
      .replace('mm', minutes)
      .replace('ss', seconds) + (ishh ? (isPM ? ' PM' : ' AM') : '')
  );
}

/**
 * 根据天数获取时间范围
 * @param days 前几天
 * @param date 基准时间,默认今天
 */
export function getRangeDateByDays(
  days: number,
  date: Date | string | number = new Date(),
): [Date, Date] {
  const _date = getDate(date);
  if (_date === 'Invalid Date') {
    return [new Date(_date), new Date(_date)];
  }
  const endDate = new Date(_date);
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(_date);
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);
  return [startDate, endDate];
}

/** 根据日期返回当前月的最后一日 */
export function getDaysByDate(date: string | number | Date): Date {
  if (!(date instanceof Date)) {
    date = new Date(date);
    if (isNaN(date.getTime())) {
      return new Date('Invalid Date');
    }
  }
  const currentMonth = date.getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const newDate = new Date();
  newDate.setFullYear(date.getFullYear());
  newDate.setMonth(nextMonth - 1);
  newDate.setDate(0);
  return newDate;
}

/**
 * 将列表转换为分组列表
 * @param list 源列表
 * @param groupCount 一组有多少个
 */
export function getSeperateList<T>(list: T[], groupCount: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < list.length; i += groupCount) {
    result.push(list.slice(i, i + groupCount));
  }
  return result;
}

/**
 * 在使用Promise.allSettled后,对useState进行赋值
 * @param setFun set方法
 * @param result promise返回的result
 * @param nullData 无值时的填充,默认为[],可按需传入其他数据
 */
export const setDataForSettled = <T, D>(
  setFun: React.Dispatch<React.SetStateAction<T | D>>,
  result: PromiseSettledResult<T>,
  nullData: D = [] as D,
) => {
  setFun(result.status === 'fulfilled' ? result.value || nullData : nullData);
};

export const formatSettledData = <T, D>(
  result: PromiseSettledResult<T>,
  nullData: D = [] as D,
) => {
  return result.status === 'fulfilled' ? result.value || nullData : nullData;
};
/**
 * 字符串加密
 * @param inputString 字符串
 * @returns 返回加密字符，只显示最后一段
 */
export const formatNumberGroup = (inputString?: string | '') => {
  if (inputString) {
    const length = inputString.length;
    if (length <= 4) {
      // 长度不足4位时不做掩码
      return inputString;
    }
    const firstTwo = inputString.slice(0, 2);
    const lastTwo = inputString.slice(-2);
    const middle = '*'.repeat(length - 4);

    return `${firstTwo} ${middle} ${lastTwo}`;
  }
  return '';
};

/**
 *  英文转为首字母大写
 * @param inputString
 * @returns
 */
export const capitalizeWords = (inputString: string) => {
  const words = inputString.split(' ');
  const capitalizedWords = words.map(word => {
    // 将单词的首字母转换为大写，其余字母转换为小写
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  const resultString = capitalizedWords.join(' ');
  return resultString;
};

export const errorLog = (...args: SafeAny[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(args);
  }
};
