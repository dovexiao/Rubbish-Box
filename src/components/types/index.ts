import {
  NavigationProp,
  ParamListBase,
  RouteProp,
} from '@react-navigation/native';
import {WebViewMessageEvent, WebViewNavigation} from 'react-native-webview';
import {SetStateAction} from 'react';

export type SafeAny = any;

export type BasicObject = {
  [k: string]: SafeAny;
};

/** 使传入的类型里所有属性可选 */
export type MakePropertiesOptional<T> = {
  [P in keyof T]?: MakePropertiesOptional<T[P]>;
};

export interface Offset {
  x: number;
  y: number;
}

export type ColorTheme = 'main' | 'second' | 'accent' | 'secAccent';

export type FontFamily =
  | 'fontDin'
  | 'fontAnybody'
  | 'fontInter'
  | 'fontInterBold';

export type Size = 'large' | 'default' | 'medium' | 'small';

export interface PageParams {
  pageNo?: number;
  pageSize?: number;
}

export interface PageResponse<T> {
  totalPages: number;
  totalSize: number;
  content: T[];
}
export interface PageResponseProxyNew<T> extends PageResponse<T> {
  totalPages: number;
  totalSize: number;
  content: T[];
  todayCommissionRecharge?: SetStateAction<number>;
  todayCommissionInvite?: SetStateAction<number>;
  todayCommissionBet?: SetStateAction<number>;
  todayCommissionDetail?: never[];
}

// TODO 定义params的类型为基础对象
export interface NavigatorScreenProps {
  navigation: NavigationProp<ReactNavigation.RootParamList>;
  route: RouteProp<ParamListBase>;
}

export interface PageParams {
  pageNo?: number;
  pageSize?: number;
}

export interface PageResponse<T> {
  totalPages: number;
  totalSize: number;
  content: T[];
}

export interface SVGProps {
  color?: string;
  width?: number;
  height?: number;
}

export enum ViewType {
  'default',
  'webview',
}
export interface ReuseWebViewProp {
  title?: string;
  rightNode?: React.JSX.Element | null;
  url?: string;
  clear?: boolean;
}

export type ReuseWebViewEvents =
  | {
      type: 'onBack';
    }
  | {
      type: 'onLoadEnd';
      value: 'failed' | 'success';
    }
  | {
      type: 'onMessage';
      value: WebViewMessageEvent | MessageEvent;
    }
  | {
      type: 'onNavigationStateChange';
      value: WebViewNavigation;
    };
