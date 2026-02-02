import { storageUtil } from './storage';
type IAnyObject = Record<string, any>;

type ICacheOptAll<TRam extends IAnyObject, TLocal extends IAnyObject> = {
  [K in keyof TLocal]: TLocal[K];
} & { [K in keyof TRam]: TRam[K] };

type ICacheOptAllKey<TRam extends IAnyObject, TLocal extends IAnyObject> =
  | keyof TRam
  | keyof TLocal;

type StateOpt<T> = {
  [K in keyof T]: T[K] extends null | undefined
    ? any
    : T[K] extends IAnyObject
    ? T[K] & IAnyObject
    : T[K];
};

interface IMethod<TRam extends IAnyObject, TLocal extends IAnyObject> {
  cacheGetSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ): Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]>;
  cacheGetSync<T = any>(key: string): Promise<T | null | undefined>;

  cacheGet<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }): Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]>;
  cacheGet<T = any>(option: { key: string }): Promise<T | null | undefined>;

  cacheSetSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
    value: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined,
  ): Promise<void>;
  cacheSetSync<T = any>(key: string, value: T | undefined): Promise<void>;

  cacheSet<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
    data: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined;
  }): Promise<void>;
  cacheSet<T = any>(option: {
    key: string;
    data: T | undefined;
  }): Promise<void>;

  cacheRemoveSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ): Promise<void>;
  cacheRemoveSync(key: string): Promise<void>;

  cacheRemove<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }): Promise<void>;
  cacheRemove(option: { key: string }): Promise<void>;
}

function InnerCache<TRam extends IAnyObject, TLocal extends IAnyObject>(init: {
  ram: TRam;
  loc: TLocal;
}): IMethod<TRam, TLocal> {
  const tempKeys = Object.keys(init.ram) as (keyof TRam)[];
  const localKeys = Object.keys(init.loc) as (keyof TLocal)[];
  const store: any = {};

  async function cacheGetSync(key: any): Promise<any> {
    if (tempKeys.includes(key as keyof TRam)) {
      return store[key] ?? init.ram[key as keyof TRam];
    } else if (localKeys.includes(key as keyof TLocal)) {
      let value = store[key];
      if (value === undefined || value === null) {
        try {
          value = await storageUtil.getItem<any>(key as string);
          store[key] = value;
        } catch {}
      }

      return value ?? (init.loc[key as keyof TLocal] as any);
    }
    let value = store[key];
    if (value === undefined) {
      value = await storageUtil.getItem<any>(String(key)).catch(() => null);
      store[key] = value;
    }
    return value;
  }

  function cacheGet(option: { key: any }): Promise<any> {
    return new Promise(function (resolve) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        resolve(store[option.key] ?? init.ram[option.key as keyof TRam]);
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        const value = store[option.key];
        if (value === undefined || value === null) {
          storageUtil
            .getItem<any>(option.key as string)
            .then(res => {
              store[option.key] = res;
              resolve(res ?? (init.loc[option.key as keyof TLocal] as any));
            })
            .catch(() => {
              resolve(value ?? (init.loc[option.key as keyof TLocal] as any));
            });
        } else {
          resolve(value);
        }
      } else {
        const value = store[option.key];
        if (value === undefined) {
          storageUtil
            .getItem<any>(String(option.key))
            .then(res => {
              store[option.key] = res;
              resolve(res);
            })
            .catch(() => resolve(null));
        } else {
          resolve(value);
        }
      }
    });
  }

  async function cacheSetSync(key: any, value: any): Promise<void> {
    if (tempKeys.includes(key as keyof TRam)) {
      store[key] = value;
    } else if (localKeys.includes(key as keyof TLocal)) {
      store[key] = value;
      if (value !== undefined && value !== null) {
        try {
          await storageUtil.setItem(key as string, value);
        } catch {}
      }
    } else {
      store[key] = value;
      if (value === undefined) {
        await storageUtil.removeItem(String(key)).catch(() => undefined);
      } else {
        await storageUtil.setItem(String(key), value).catch(() => undefined);
      }
    }
  }

  function cacheSet(option: { key: any; data: any }): Promise<void> {
    return new Promise(function (resolve: (args?: any) => void) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        store[option.key] = option.data;
        resolve();
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        store[option.key] = option.data;
        if (option.data !== undefined && option.data !== null) {
          storageUtil
            .setItem(option.key as string, option.data)
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          resolve();
        }
      } else {
        store[option.key] = option.data;
        if (option.data === undefined) {
          storageUtil
            .removeItem(String(option.key))
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          storageUtil
            .setItem(String(option.key), option.data)
            .then(() => resolve())
            .catch(() => resolve());
        }
      }
    });
  }

  async function cacheRemoveSync(key: any): Promise<void> {
    if (tempKeys.includes(key as keyof TRam)) {
      delete store[key];
    } else if (localKeys.includes(key as keyof TLocal)) {
      delete store[key];
      try {
        await storageUtil.removeItem(key as string);
      } catch {}
    } else {
      delete store[key];
      await storageUtil.removeItem(String(key)).catch(() => undefined);
    }
  }

  function cacheRemove(option: { key: any }): Promise<void> {
    return new Promise(function (resolve: (args?: any) => void) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        delete store[option.key];
        resolve();
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        delete store[option.key];
        storageUtil
          .removeItem(option.key as string)
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        delete store[option.key];
        storageUtil
          .removeItem(String(option.key))
          .then(() => resolve())
          .catch(() => resolve());
      }
    });
  }

  return {
    cacheGetSync,
    cacheGet,
    cacheSetSync,
    cacheSet,
    cacheRemoveSync,
    cacheRemove,
  };
}

const {
  cacheGetSync,
  cacheGet,
  cacheSetSync,
  cacheSet,
  cacheRemoveSync,
  cacheRemove,
} = InnerCache({
  ram: {
    siscrt: '',
  },
  loc: {
    // 首次进入APP弹窗提示开启权限
    popNoticeOnce: false,
    token: undefined,
    code: '',
    userId: '',
    domain: '',
    sysInfo: undefined,
    agreePrivacy: false,
    deviceInfo: undefined,
    // 访客模式：用户选择"暂不登录"后为 true，用于抑制静默登录
    guestMode: false,
    // 从协议/隐私 Web 页面返回后，是否需要重开隐私弹窗
    reopenPrivacyAfterWeb: false,
    themeType: 'dark' as 'dark' | 'light',
  },
});

export {
  cacheGetSync,
  cacheGet,
  cacheSetSync,
  cacheSet,
  cacheRemoveSync,
  cacheRemove,
};
