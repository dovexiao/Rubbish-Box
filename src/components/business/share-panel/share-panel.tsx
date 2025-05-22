import React from 'react';
import {View, Image, StyleSheet, ScrollView} from 'react-native';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import ChatRoomSvg from '@/components/svgs/basic/chatroom';
import {toPriceStr} from '@/utils';
import {useTranslation} from 'react-i18next';
const closeIcon = require('@assets/icons/close.webp');

const SHARES = [
  {
    label: 'Chatroom',
    icon: () => (
      <ChatRoomSvg width={theme.imageSize.s} height={theme.imageSize.s} />
    ),
  },
  {
    label: 'Facebook',
    icon: () => (
      <Image
        style={[styles.itemIcon]}
        source={require('@components/assets/icons/facebook.webp')}
      />
    ),
  },
  {
    label: 'Telegram',
    icon: () => (
      <Image
        style={[styles.itemIcon]}
        source={require('@components/assets/icons/tg.webp')}
      />
    ),
  },
  {
    label: 'Whatsapp',
    icon: () => (
      <Image
        style={[styles.itemIcon]}
        source={require('@components/assets/icons/whatsapp.webp')}
      />
    ),
  },
  {
    label: 'Instagram',
    icon: () => (
      <Image
        style={[styles.itemIcon]}
        source={require('@components/assets/icons/insgram.webp')}
      />
    ),
  },
];

const SharePanel = ({
  hasReward = false,
  onItemPress = () => {},
  onClose = () => {},
}: {
  onItemPress: (platform: string) => void;
  onClose: () => void;
  hasReward: boolean;
}) => {
  const {i18n} = useTranslation();
  return (
    <View style={[theme.background.white, styles.container]}>
      <View style={[theme.flex.center, styles.header]}>
        <Text fontSize={18} fontFamily="fontInterBold">
          {i18n.t('bets-share.label.share')}
        </Text>
        <NativeTouchableOpacity style={styles.close} onPress={onClose}>
          <Image source={closeIcon} style={[styles.closeIcon]} />
        </NativeTouchableOpacity>
      </View>
      <ScrollView horizontal contentContainerStyle={[styles.listContainer]}>
        {SHARES.map((item, index) => (
          <NativeTouchableOpacity
            onPress={() => onItemPress(item.label)}
            style={styles.item}
            key={index}>
            {item.icon()}
            <Text style={[theme.margin.topxxs]}>{item.label}</Text>
            <Text
              color={theme.backgroundColor.second}
              fontFamily="fontInterBold"
              size="medium">
              {index === 0 && hasReward ? '+ ' : ''}
              {index === 0 && hasReward
                ? toPriceStr(1, {
                    fixed: 2,
                    showCurrency: true,
                    thousands: true,
                  })
                : ''}
            </Text>
          </NativeTouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    height: 58,
  },
  close: {
    top: 19,
    position: 'absolute',
    left: 16,
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  item: {
    alignItems: 'center',
    marginLeft: 24,
  },
  itemIcon: {
    width: 48,
    height: 48,
  },
  listContainer: {
    paddingVertical: 24,
    marginRight: 24,
  },
});

export default SharePanel;
