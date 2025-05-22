// import ShareButton from '@/components/business/bets/share-btn';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import Text from '@components/basic/text';
import theme from '@/style';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient/linear-gradient.web';

const TableTitle = ({
  title = '',
}: // hasShare = false,
// onShare = () => {},
{
  title?: string;
  hasShare?: boolean;
  onShare?: () => void;
}) => {
  const {i18n} = useTranslation();
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      colors={['#00000000', '#00000000']}>
      <View
        style={[
          theme.flex.row,
          theme.padding.l,
          theme.flex.centerByCol,
          theme.flex.between,
          styles.container,
        ]}>
        <Text white size="medium" blod>
          {title || i18n.t('me.bottom.myBets')}
        </Text>
        {/* {hasShare && <ShareButton onShare={onShare} />} */}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingLeft: 24,
  },
});

export default TableTitle;
