import React from 'react';
import {StyleSheet, View, ImageRequireSource, ColorValue} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
import {useTranslation} from 'react-i18next';
import Text from '@basicComponents/text';
import {goToWithLogin} from '@utils';
import theme from '@style';

const {basicColor} = theme;

export interface MeRowMenuProps {}

const MeRowMenu: React.FC<MeRowMenuProps> = () => {
  const {i18n} = useTranslation();

  const toRecharge = () => goToWithLogin(i18n.t('home.tab.deposit'));
  const toWithdraw = () => goToWithLogin('Withdraw');

  const renderItem = ({
    url,
    title,
    onPress,
    bgColor,
  }: {
    url: ImageRequireSource | string;
    title: string;
    onPress?: () => void;
    bgColor?: ColorValue;
  }) => {
    return (
      <NativeTouchableOpacity
        style={[styles.menuItem, {backgroundColor: bgColor}]}
        onPress={onPress}>
        <Text
          fontSize={theme.fontSize.s}
          fontWeight="700"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.menuText}>
          {title}
        </Text>
        <View style={styles.iconWrap}>
          <LazyImage
            occupancy="transparent"
            imageUrl={url}
            width={35}
            height={35}
          />
        </View>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderItem({
        url: require('@assets/icons/me/recharge.webp'),
        title: i18n.t('me.bottom.deposit'),
        onPress: toRecharge,
        bgColor: basicColor.newBgThree,
      })}
      {renderItem({
        url: require('@assets/icons/me/withdraw.webp'),
        title: i18n.t('me.bottom.withdraw'),
        onPress: toWithdraw,
        bgColor: basicColor.newBgThree,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
    height: 60,
    gap: 10,
  },

  menuItem: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 60,
  },
  iconWrap: {
    width: 30,
    height: 30,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: '#fff',
    maxWidth: 80,
  },
});

export default MeRowMenu;
