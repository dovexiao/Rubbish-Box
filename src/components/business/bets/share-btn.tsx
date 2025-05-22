import {StyleSheet, Image} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import React from 'react';
import {useTranslation} from 'react-i18next';
import Text from '@components/basic/text';
const coinIcon = require('@components/assets/icons/bets/coin.webp');

const ShareButton = ({
  onShare = () => {},
  hasAward = false,
}: {
  onShare?: () => void;
  hasAward: boolean;
}) => {
  const {i18n} = useTranslation();
  return (
    <NativeTouchableOpacity
      onPress={onShare}
      style={[theme.flex.row, theme.flex.centerByCol, styles.shareBtn]}>
      {hasAward && (
        <Image source={coinIcon} style={[theme.margin.rightxxs, styles.icon]} />
      )}
      <Text fontFamily="fontInterBold" color={theme.basicColor.white}>
        {hasAward
          ? i18n.t('bets-page.label.shareAwards')
          : i18n.t('bets-share.label.share')}
      </Text>
    </NativeTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  shareBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    ...theme.background.primary,
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default ShareButton;
