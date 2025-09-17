import React from 'react';
import {Platform} from 'react-native';
import VipClubListWeb from './VipClubListWeb'; // 你现有的那份代码
import VipClubListAndroid from './VipClubListAndroid';
import {IVipConfigItem, IVipItem} from '@/services/global.service';
import {VipProgressInfo, VipRenderType} from '@/components/business/vip';

// 定义组件 props 类型，兼容两个平台的所有 props
interface VipClubListProps {
  vipConfigList: IVipConfigItem[];
  // VIP Card List props (from Web)
  rechargeAmount?: number;
  vipInfoList?: VipProgressInfo[];
  cards?: VipRenderType[];
  vipList?: IVipItem[];
  onRecharge?: () => void;
  onRefresh?: () => void;
  currentLevel?: number;
  checkIndex?: number;
  // Android specific props
  renderVipCardItem?: (item: IVipConfigItem, index: number) => React.ReactNode;
}

const VipClubList: React.FC<VipClubListProps> = props => {
  if (Platform.OS === 'web') {
    return <VipClubListWeb {...props} />;
  }
  if (Platform.OS === 'android') {
    // 为 Android 组件提供默认的 renderVipCardItem 函数
    const androidProps = {
      ...props,
      renderVipCardItem:
        props.renderVipCardItem ||
        ((_item: IVipConfigItem, _index: number) => {
          // 提供一个默认的卡片渲染函数
          return null; // 或者提供一个简单的默认渲染
        }),
    };
    return <VipClubListAndroid {...androidProps} />;
  }
  // iOS 可以沿用 Web 方案或类似 Android
  return <VipClubListWeb {...props} />;
};

export default VipClubList;
