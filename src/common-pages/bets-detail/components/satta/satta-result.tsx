import theme from '@/style';
import {BasicObject} from '@/types';
import React from 'react';
import {View} from 'react-native';
import Text from '@/components/basic/text';
import {useTranslation} from 'react-i18next';

function getResultNum(
  openResultNum?: string | null,
  closeResultNum?: string | null,
) {
  let openNum, closeNum;
  if (openResultNum) {
    openNum = openResultNum.split('').reduce((s, y) => (s + +y) % 10, 0);
  } else {
    openNum = '*';
  }
  if (closeResultNum) {
    closeNum = closeResultNum.split('').reduce((s, y) => (s + +y) % 10, 0);
  } else {
    closeNum = '*';
  }
  return {openNum, closeNum};
}

const SataResult = ({info}: {info: BasicObject}) => {
  const {i18n} = useTranslation();
  return (
    <View
      style={[
        theme.background.newBgInOne,
        theme.padding.l,
        theme.flex.row,
        theme.flex.centerByCol,
        theme.margin.btml,
      ]}>
      <View>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={theme.fontColor.white} size="medium">
            {info.drawDate}{' '}
          </Text>
          <Text fontFamily="fontInterBold" white size="medium">
            {info.drawTime}
          </Text>
        </View>
        <Text fontFamily="fontInterBold" white size="medium">
          {i18n.t('bets-detail.label.drawRes')}:
        </Text>
      </View>
      <View
        style={[
          theme.flex.flex1,
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.end,
        ]}>
        <Text color={theme.fontColor.white}>
          {i18n.t('bets-detail.label.panel').toUpperCase()}:
        </Text>
        <Text white>
          {info!.matkaResultVo!.openNum || '***'}-
          {
            getResultNum(
              info!.matkaResultVo!.openNum,
              info!.matkaResultVo!.closeNum,
            ).openNum
          }
          {
            getResultNum(
              info!.matkaResultVo!.openNum,
              info!.matkaResultVo!.closeNum,
            ).closeNum
          }
          -{info!.matkaResultVo!.closeNum || '***'}
        </Text>
      </View>
    </View>
  );
};

export default SataResult;
