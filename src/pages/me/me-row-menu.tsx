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
        <View style={styles.iconWrap}>
          <LazyImage
            occupancy="transparent"
            imageUrl={url}
            width={30}
            height={30}
          />
        </View>
        <Text
          fontSize={theme.fontSize.s}
          fontWeight="700"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.menuText}>
          {title}
        </Text>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {renderItem({
        url: require('@assets/icons/me/recharge.webp'),
        title: i18n.t('me.bottom.deposit'),
        onPress: toRecharge,
        bgColor: basicColor.newBgInOne,
      })}
      {renderItem({
        url: require('@assets/icons/me/withdraw.webp'),
        title: i18n.t('me.bottom.withdraw'),
        onPress: toWithdraw,
        bgColor: basicColor.newBgInOne,
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
    paddingHorizontal: 10,
    height: 60,
    borderWidth: 1,
    borderColor: '#FEB705',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    // 可选阴影
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  menuItem: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: '#fff',
    maxWidth: 80,
  },
});

export default MeRowMenu;
