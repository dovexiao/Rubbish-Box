import {BasicObject} from '@types';

export const removeUndefinedKeys = (obj: BasicObject) => {
  for (let key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
};

/** 递归合并对象 */
export const deepMerge = (target: BasicObject, source: BasicObject) => {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (target.hasOwnProperty(key)) {
        const typeofTarget = typeof target[key];
        const typeofSource = typeof source[key];
        if (typeofTarget === 'string') {
          // 如果前者是字符串,直接后者覆盖前者
          target[key] = source[key];
        } else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
          // 如果都是数组,合并去重
          target[key] = Array.from(new Set([...target[key], ...source[key]]));
        } else if (
          Array.isArray(target[key]) &&
          typeofSource === 'object' &&
          !Array.isArray(source[key])
        ) {
          // 如果后者是对象,前者是数组,对象覆盖数组
          target[key] = source[key];
        } else if (
          typeofTarget === 'object' &&
          typeofSource === 'object' &&
          !Array.isArray(target[key]) &&
          !Array.isArray(source[key])
        ) {
          // 如果两者都是对象，递归深度合并
          target[key] = deepMerge(target[key], source[key]);
        }
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
};
