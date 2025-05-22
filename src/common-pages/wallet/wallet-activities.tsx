import LazyImage from '@/components/basic/image';
import React from 'react';
import {ScrollView, View} from 'react-native';
import theme from '@/style';
import Text from '@basicComponents/text';
import globalStore from '@/services/global.state';
import {useTranslation} from 'react-i18next';

interface WalletActivitiesProps {}

const WalletActivities: React.FC<WalletActivitiesProps> = () => {
  const {i18n} = useTranslation();
  return (
    <ScrollView>
      <Text style={[theme.margin.topl]}>{i18n.t('wallet.activities')}</Text>
      <View style={[theme.borderRadius.l, theme.margin.topl]}>
        <LazyImage
          imageUrl={'xxx'}
          width={globalStore.screenWidth - theme.paddingSize.l * 2}
          height={140}
          occupancy="transparent"
          radius={theme.borderRadiusSize.l}
        />
      </View>
      <View style={[theme.borderRadius.l, theme.margin.topl]}>
        <LazyImage
          imageUrl={'xxx'}
          width={globalStore.screenWidth - theme.paddingSize.l * 2}
          height={140}
          occupancy="transparent"
          radius={theme.borderRadiusSize.l}
        />
      </View>
    </ScrollView>
  );
};

export default WalletActivities;
