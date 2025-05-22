import theme from '@/style';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import Text, {TextProps} from '../../basic/text';
import globalStore from '@/services/global.state';
import {toPriceStr} from '@/utils';

export interface PriceProps {
  style?: StyleProp<ViewStyle>;
  // 价格，如果传入空值则默认 - 且无价格符号，如果传入非空值则使用默认价格符号并展示对应价格
  price?: number;
  // 保留小数位
  fixed?: number;
  // 是否限制超出一定值时使用K
  suffixUnit?: 'K' | '';
  // 超出一定值使用K，但必须suffixUnit为K才会生效
  overPrice?: number;
  // 货币符号特有的文本属性
  currencyTextProps?: TextProps;
  // 其他的文本属性
  textProps?: TextProps;
  // 默认使用千分位，除非明确使用false
  thousands?: boolean;
  // 价格前面是否带一个空格
  spacing?: boolean;
  // 如果传入空值的默认值，默认-
  defaultContent?: string;
  // 前缀
  prefix?: string;
  // 后缀
  suffix?: string;
  // 保留小数位的方式，当suffixUnit存在时，该配置无效，并使用向下取整保留小数
  // The way to retain the decimal position, when Suffixunit exists, the configuration is invalid, and use the downward to retain the decimal decimal
  round?: 'round' | 'floor' | 'ceil';
}

const Price: React.FC<PriceProps> = ({
  style,
  price,
  fixed,
  suffixUnit,
  overPrice = 1000000,
  round,
  thousands = true,
  spacing,
  textProps = {},
  defaultContent = '-',
  prefix = '',
  suffix = '',
  currencyTextProps = {},
}) => {
  const {fontFamily, ...otherTextProps} = textProps;
  return (
    <View style={[theme.flex.row, theme.flex.centerByCol, style]}>
      {price != null && (
        <Text
          fontFamily="fontInter"
          blod
          {...otherTextProps}
          {...currencyTextProps}>
          {prefix}
          {globalStore.currency}
        </Text>
      )}
      <Text fontFamily={fontFamily || 'fontDin'} blod {...otherTextProps}>
        {price == null
          ? defaultContent
          : toPriceStr(price, {
              showCurrency: false,
              fixed,
              suffixUnit,
              overPrice,
              round,
              thousands,
              spacing,
            })}
        {suffix}
      </Text>
    </View>
  );
};

export default Price;
