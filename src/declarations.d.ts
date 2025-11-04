declare module '*.svg' {
  import React from 'react';
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
  export {ReactComponent};
}

declare global {
  interface Window {
    // SaleSmartly SDK 全局对象
    ssq: {
      push: (...args: any[]) => void;
    };
    // License 或其他全局配置
    __ssc?: {
      license?: string;
    };
    // TODO: 类型声明了，但是不生效
    opera?: any;
    MSStream?: any;
  }
}
