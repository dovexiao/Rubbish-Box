import AsyncStorage from '@react-native-async-storage/async-storage';
import {BehaviorSubject, Subject} from 'rxjs';
import {CurrencyMap} from './currency';
import {BasicObject, ReuseWebViewEvents, ReuseWebViewProp} from '@types';
import {Dimensions, Platform} from 'react-native';
import type {MessageCountInfo} from './global.service';
import {ReactElement} from 'react';
export enum ViewType {
  'default',
  'webview',
}

class GlobalStore {
  homePage = 'Index';
  /** 是否禁用号码国际化,为true的话会禁止选择区号,且不会传区号到后端 */
  disabledPhoneCode = true;
  sendPhoneCode = false;
  defaultPhoneCode = '91';
  fullScreen = false;
  globalLoadingGameCategory = new BehaviorSubject<string>('');
  globalLoading = new BehaviorSubject<boolean>(false);
  globalTotal = new Subject<{
    type: 'success' | 'warning';
    message: string;
    tip?: string | ReactElement;
    backgroundColor?: string;
  }>();
  globalSucessTotal = (
    message: string,
    tip?: string | ReactElement,
    backgroundColor?: string,
  ) => {
    this.globalTotal.next({
      type: 'success',
      message,
      tip,
      backgroundColor: backgroundColor,
    });
  };
  globalWaringTotal = (message: string, tip?: string | ReactElement) => {
    this.globalTotal.next({
      type: 'warning',
      message,
      tip,
    });
  };
  doNotices = new Subject<void>();
  /** 浏览器 */
  isWeb = Platform.OS === 'web';
  /** 移动端浏览器 */
  isH5 =
    Platform.OS === 'web' &&
    !!navigator.userAgent.match(
      /(iPhone|iPod|Android|ios|iOS|iPad|WebOS|Symbian|Windows Phone|Phone)/i,
    );
  /** android */
  isAndroid = Platform.OS === 'android';
  /** 渠道 */
  private _channel: string = null!;
  get channel() {
    return this._channel;
  }
  set channel(c: string) {
    this._channel = c;
    this.asyncSetItem('channel', c);
  }
  isIOS = Platform.OS === 'ios';
  asyncGetItem = (key: string) => {
    return AsyncStorage.getItem(key);
  };
  asyncRemoveItem = (key: string) => {
    AsyncStorage.removeItem(key);
  };
  asyncSetItem = (key: string, value: string) => {
    AsyncStorage.setItem(key, value);
  };
  private _token: string | null = null!;
  get token() {
    return this._token;
  }
  set token(token: string | null) {
    if (token) {
      this._token = token;
      this.tokenSubject.next(token);
      this.asyncSetItem('token', token);
    } else {
      this.clearToken();
    }
  }
  clearToken = () => {
    this._token = null;
    this.asyncRemoveItem('token');
    this.tokenSubject.next(null);
  };
  tokenSubject = new BehaviorSubject<string | null>(this._token);

  /** 用户信息 */
  private _userInfo: BasicObject | null = null;
  get userInfo() {
    return this._userInfo;
  }

  set userInfo(user: BasicObject | null) {
    if (user) {
      this._userInfo = user;
      this.userSubject.next(user);
      this.asyncSetItem('user', JSON.stringify(user));
    } else {
      this._userInfo = null;
      this.asyncRemoveItem('user');
    }
  }
  userSubject = new BehaviorSubject<BasicObject | null>(this._userInfo);

  private _topwindowurl: string | null = null;
  get topwindowurl() {
    return this._topwindowurl;
  }
  set topwindowurl(topwindowurl: string | null) {
    this._topwindowurl = topwindowurl;
  }

  private _visitor: string | null = null!;
  /** 唯一标识 */
  get visitor() {
    return this._visitor;
  }
  set visitor(visitor: string | null) {
    this._visitor = visitor;
    if (visitor) {
      this.asyncSetItem('visitor', visitor);
    } else {
      this.asyncRemoveItem('visitor');
    }
  }

  private _lang: string = 'en_US';
  /** 语言 */
  get lang() {
    return this._lang;
  }
  set lang(lang: string) {
    this._lang = lang;
    this.langSubject.next(lang);
    if (lang) {
      this.asyncSetItem('language', lang);
    } else {
      this.asyncRemoveItem('language');
    }
  }
  /** 语言 */
  langSubject = new BehaviorSubject<string>(this._lang);

  private _currency: string = CurrencyMap.default;
  /** 当前币种 */
  get currency() {
    return this._currency;
  }
  set currency(currency: string) {
    this._currency = currency;
    this.langSubject.next(currency);
    if (currency) {
      this.asyncSetItem('currency', currency);
    } else {
      this.asyncRemoveItem('currency');
    }
  }

  /** 热更新 下载进度 */
  private _rate: number = 0;
  get rate() {
    return this._rate;
  }
  set rate(rate: number) {
    this._rate = rate;
    this.rateSubject.next(rate);
  }
  rateSubject = new BehaviorSubject<number | 0>(this._rate);

  /** 当前币种 */
  currencySubject = new BehaviorSubject<string>(this._currency);

  private _userAmount: number = 0;
  private _userLastAmount: number | null = null;
  /** 用户当前金额 */
  get userAmount() {
    return this._userAmount;
  }

  private _packageId = 3;
  get packageId() {
    return this._packageId;
  }

  private _packageInfo = 'com.sambad.anslot';
  get packageInfo() {
    return this._packageInfo;
  }

  /** 金额带出 app.tsx中处理,其他地方应该避免订阅 */
  amountCheckOut = new Subject<void>();
  /** 金额更新 app.tsx中处理,其他地方应该避免订阅 */
  updateAmount = new Subject<void>();
  private _amountChanged = new BehaviorSubject<{
    last: number | null;
    current: number;
  }>({
    last: null,
    current: 0,
  });
  /** app.tsx中统一触发,会有200ms的节流,避免频繁触发 */
  get amountChanged() {
    return this._amountChanged.asObservable();
  }
  /** 通过updateAmount在app.tsx中统一触发,其他地方应该避免订阅 */
  setAmount(amount: number) {
    this._amountChanged.next({
      last: this._userLastAmount,
      current: amount,
    });
    this._userLastAmount = this._userAmount = amount;
  }

  /** 消息数量相关触发 */
  private _notificationSubject = new BehaviorSubject<MessageCountInfo>({
    messageTotalCount: 0,
    sysMessageCount: 0,
    sysUserMessageCount: 0,
  });

  get notificationSubject() {
    return this._notificationSubject;
  }

  /** 消息更新 app.tsx中处理，其他地方避免订阅 */
  refreshNotification = new Subject<void>();

  /** 读取消息
   * @param messageType 1 系统消息 2 用户消息
   */
  readNotification = new Subject<{messageId: number; messageType: 1 | 2}>();

  /** 杂项数据存取 */
  private dataMap: BasicObject = {};
  getItem = (key: string): string | BasicObject | null => {
    if (
      this.dataMap[key] ||
      this.dataMap[key] === 0 ||
      this.dataMap[key] === '' ||
      this.dataMap[key] === null
    ) {
      return this.dataMap[key];
    }
    return null;
  };
  setItem = (
    key: string,
    value: string | number | BasicObject | any[],
    saveToStorage = false,
  ) => {
    if (value || value === 0 || value === '' || value === null) {
      this.dataMap[key] = value;
      if (saveToStorage) {
        const _value =
          typeof value === 'string' ? value : JSON.stringify(value);
        this.asyncSetItem(key, _value);
      }
    }
  };
  removeItem = (key: string) => {
    delete this.dataMap[key];
    this.asyncRemoveItem(key);
  };

  /** 展示逻辑,如果是webview,会隐藏下载栏 */
  viewType: ViewType = 0;
  appDistory = new Subject<boolean>();
  private _screenWidth =
    Dimensions.get('window').width > 500 ? 500 : Dimensions.get('window').width;
  get screenWidth() {
    return this._screenWidth;
  }
  private _screenHeight = Dimensions.get('window').height;
  get screenHeight() {
    return this._screenHeight;
  }
  updateDimensions = () => {
    requestAnimationFrame(() => {
      const {height, width} = Dimensions.get('window');
      this._screenHeight = height;
      this._screenWidth = width > 500 ? 500 : width;
      this.resizeSubject.next({
        width: this._screenWidth,
        height: this._screenHeight,
      });
    });
  };

  readonly resizeSubject = new BehaviorSubject<{width: number; height: number}>(
    {
      width: this._screenWidth,
      height: this._screenHeight,
    },
  );

  readonly setReuseWebViewSub = new Subject<
    ReuseWebViewProp & {
      title: string;
      url: string;
    }
  >();
  readonly updateReuseWebViewSub = new Subject<ReuseWebViewProp>();
  readonly reuseWebViewCbSub = new Subject<ReuseWebViewEvents>();
  readonly triggleReuseWebViewCbSub = new Subject<boolean>();
  readonly showReuseWebViewLoadingPage = new Subject<{
    show: boolean;
    type: string;
  }>();
  readonly startLoadingStatus = new BehaviorSubject<boolean>(true);
}

/** 基础组件中尽量避免依赖GlobalStore */
const globalStore = new GlobalStore();

export default globalStore;
