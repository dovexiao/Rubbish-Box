import LazyImage from '@/components/basic/image';
import React from 'react';
import {View} from 'react-native';
import {useInnerStyle} from './wallet.hooks';
import theme from '@/style';
import Text from '@basicComponents/text';
import {toPriceStr} from '@/utils';
import {positionIcon} from './wallet.variable';
import {WalletAmountListItem} from './wallet.service';

interface WalletListProps {
  walletList: WalletAmountListItem[];
}

const WalletList: React.FC<WalletListProps> = ({walletList}) => {
  const {
    listStyle,
    size: {walletIconSize},
  } = useInnerStyle();
  return (
    <View
      style={[
        theme.flex.row,
        theme.flex.wrap,
        {columnGap: theme.paddingSize.xs},
      ]}>
      {walletList.map((item, index) => (
        <View
          key={index}
          style={[
            listStyle.wallet,
            theme.position.rel,
            theme.flex.col,
            theme.flex.center,
            item.balance > 0
              ? theme.background.primary
              : theme.background.white,
            theme.borderRadius.m,
            theme.margin.btms,
          ]}>
          <LazyImage
            width={walletIconSize}
            height={walletIconSize}
            occupancy="#0000"
            imageUrl={item.otherUrl}
          />
          <Text blod fontSize={theme.fontSize.s} main>
            {item.name}
          </Text>
          <Text fontSize={theme.fontSize.m} main>
            {toPriceStr(item.balance, {
              fixed: 2,
              spacing: true,
            })}
          </Text>
          {item.balance > 0 && (
            <LazyImage
              occupancy="#0000"
              imageUrl={positionIcon}
              width={14}
              height={14}
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default WalletList;
