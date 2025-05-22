/**
 * Storage service
 * @file 本地存储服务
 * @module app/services/storage
 */

/*

 * storage.set(key, value);

   storage.get<string>(key).then((data) => {
      console.log("-----", data);
   });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export enum StorageEnum {
  token = 'userToken',
  user = 'userInfo',
}

export const getStorage = async <T>(key: StorageEnum): Promise<T | null> => {
  let value = null;
  try {
    const result = await AsyncStorage.getItem(key);
    if (result) {
      value = JSON.parse(result);
    }
  } catch (error) {
    console.error(error);
  }
  return value;
};

export const getStringStorage = async (
  key: StorageEnum,
): Promise<string | null> => {
  return await AsyncStorage.getItem(key);
};

export const setStorage = <T>(key: StorageEnum, value: T): void => {
  AsyncStorage.setItem(key, JSON.stringify(value));
};
export const removeStorage = (key: StorageEnum): void => {
  AsyncStorage.removeItem(key);
};
export const clearStorage = () => {
  AsyncStorage.clear();
};
