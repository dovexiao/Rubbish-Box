import React, {useMemo} from 'react';
import {View} from 'react-native';
import {proxyColor, sort1Icon, sort2Icon, sort3Icon} from '../proxy.variable';
import LazyImage from '@/components/basic/image';
import theme from '@/style';
import Text from '@/components/basic/text';

export interface EarnTopProps {
  top: number;
}
const topImages = [sort1Icon, sort2Icon, sort3Icon];
const EarnTop: React.FC<EarnTopProps> = ({top}) => {
  const resultTop = useMemo(() => {
    return Math.max(1, top);
  }, [top]);
  return resultTop <= 3 ? (
    <LazyImage
      width={theme.iconSize.m}
      height={theme.iconSize.m}
      imageUrl={topImages[resultTop - 1] || topImages[0]}
      occupancy="#0000"
    />
  ) : resultTop <= 99 ? (
    <View
      style={[
        theme.icon.m,
        theme.borderRadius.xs,
        theme.flex.center,
        {backgroundColor: proxyColor.topGrey},
      ]}>
      <Text blod main>
        {resultTop}
      </Text>
    </View>
  ) : (
    <Text main blod size="medium" fontFamily="fontDin">
      99+
    </Text>
  );
};

export default EarnTop;
