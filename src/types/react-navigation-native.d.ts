declare module '@react-navigation/native' {
  import * as React from 'react';

  // 这里是对模块的补充声明，只为消除 TS 报错，不追求完整类型

  // 顶层组件/对象（按 any 处理，避免 TS 报错）
  export const NavigationContainer: React.ComponentType<any>;
  export const ServerContainer: React.ComponentType<any>;
  export const Link: React.ComponentType<any>;
  export const LinkingContext: React.Context<any>;
  export const DarkTheme: any;
  export const DefaultTheme: any;
  export const ThemeProvider: React.ComponentType<any>;

  // hooks（全部按 any 返回，避免对 ref 上的方法做类型检查）
  export function useNavigationContainerRef<T = any>(): any;
  export function useNavigation<T = any>(): T;
  export function useRoute<T = any>(): T;
  export function useTheme(): any;
  export function useLinkBuilder(): any;
  export function useLinkProps(options: any): any;
  export function useLinkTo(): (path: string) => void;
  export function useScrollToTop(ref: any): void;

  // 其它从 @react-navigation/core re-export 出来的东西全部按 any 处理
  export const CommonActions: any;
  export const StackActions: any;
  export const TabActions: any;
  export const DrawerActions: any;
}
