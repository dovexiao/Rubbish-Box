import { getStorage, setStorage, removeStorage } from './index';
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
  cacheGetSync: <T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ) => Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]>;
  cacheGet: <T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }) => Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]>;
  cacheSetSync: <T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
    value: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined,
  ) => Promise<void>;
  cacheSet: <T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
    data: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined;
  }) => Promise<void>;
  cacheRemoveSync: <T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ) => Promise<void>;
  cacheRemove: <T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }) => Promise<void>;
}

function InnerCache<TRam extends IAnyObject, TLocal extends IAnyObject>(init: {
  ram: TRam;
  loc: TLocal;
}): IMethod<TRam, TLocal> {
  const tempKeys = Object.keys(init.ram) as (keyof TRam)[];
  const localKeys = Object.keys(init.loc) as (keyof TLocal)[];
  const store: any = {};

  async function cacheGetSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ): Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]> {
    if (tempKeys.includes(key as keyof TRam)) {
      return store[key] ?? init.ram[key as keyof TRam];
    } else if (localKeys.includes(key as keyof TLocal)) {
      let value = store[key];
      if (value === undefined || value === null) {
        try {
          const d = await getStorage({
            key: key as string,
          });
          value = d;
          store[key] = value;
        } catch {}
      }

      return value ?? (init.loc[key as keyof TLocal] as any);
    }
    console.error(
      `请先注册该Key：Cache({ ram: { ${String(key)}: '${String(key)}' }, loc: { ${String(
        key,
      )}: '${String(key)}' } })`,
    );
    return undefined as any;
  }

  function cacheGet<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }): Promise<Partial<StateOpt<ICacheOptAll<TRam, TLocal>>>[T]> {
    return new Promise(function (resolve) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        resolve(store[option.key] ?? init.ram[option.key as keyof TRam]);
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        const value = store[option.key];
        if (value === undefined || value === null) {
          getStorage({
            key: option.key as string,
          })
            .then((res: any) => {
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
        console.error(
          `请先注册该Key：Cache({ ram: { ${String(option.key)}: '${String(
            option.key,
          )}' }, loc: { ${String(option.key)}: '${String(option.key)}' } })`,
        );
        resolve(undefined as any);
      }
    });
  }

  async function cacheSetSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
    value: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined,
  ): Promise<void> {
    if (tempKeys.includes(key as keyof TRam)) {
      store[key] = value;
    } else if (localKeys.includes(key as keyof TLocal)) {
      store[key] = value;
      if (value !== undefined && value !== null) {
        try {
          await setStorage({
            key: key as string,
            data: value,
          });
        } catch {}
      }
    } else {
      console.error(
        `请先注册该Key：Cache({ ram: { ${String(key)}: '${String(key)}' }, loc: { ${String(
          key,
        )}: '${String(key)}' } })`,
      );
    }
  }

  function cacheSet<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
    data: Partial<StateOpt<ICacheOptAll<TRam, TLocal>>[T]> | undefined;
  }): Promise<void> {
    return new Promise(function (resolve: (args?: any) => void) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        store[option.key] = option.data;
        resolve();
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        store[option.key] = option.data;
        if (option.data !== undefined && option.data !== null) {
          setStorage({
            key: option.key as string,
            data: option.data,
          })
            .then(() => resolve())
            .catch(() => resolve());
        } else {
          resolve();
        }
      } else {
        console.error(
          `请先注册该Key：Cache({ ram: { ${String(option.key)}: '${String(
            option.key,
          )}' }, loc: { ${String(option.key)}: '${String(option.key)}' } })`,
        );
        resolve();
      }
    });
  }

  async function cacheRemoveSync<T extends ICacheOptAllKey<TRam, TLocal>>(
    key: T,
  ): Promise<void> {
    if (tempKeys.includes(key as keyof TRam)) {
      delete store[key];
    } else if (localKeys.includes(key as keyof TLocal)) {
      delete store[key];
      try {
        await removeStorage({
          key: key as string,
        });
      } catch {}
    } else {
      console.error(
        `请先注册该Key：Cache({ ram: { ${String(key)}: '${String(key)}' }, loc: { ${String(
          key,
        )}: '${String(key)}' } })`,
      );
    }
  }

  function cacheRemove<T extends ICacheOptAllKey<TRam, TLocal>>(option: {
    key: T;
  }): Promise<void> {
    return new Promise(function (resolve: (args?: any) => void) {
      if (tempKeys.includes(option.key as keyof TRam)) {
        delete store[option.key];
        resolve();
      } else if (localKeys.includes(option.key as keyof TLocal)) {
        delete store[option.key];
        removeStorage({
          key: option.key as string,
        })
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        console.error(
          `请先注册该Key：Cache({ ram: { ${String(option.key)}: '${String(
            option.key,
          )}' }, loc: { ${String(option.key)}: '${String(option.key)}' } })`,
        );
        resolve();
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

const { cacheGetSync, cacheGet, cacheSetSync, cacheSet, cacheRemoveSync, cacheRemove } =
  InnerCache({
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
    },
  });

export { cacheGetSync, cacheGet, cacheSetSync, cacheSet, cacheRemoveSync, cacheRemove };
