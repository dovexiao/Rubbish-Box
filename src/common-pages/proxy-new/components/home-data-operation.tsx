import React from 'react';
import {View, StyleSheet} from 'react-native';
import Button from '@/components/basic/button';
import {goTo, toAgentApply} from '@/utils';
import theme from '@style';
import i18n from '@i18n';
import {AgentInfo} from '@/common-pages/proxy-new/types';

interface HomeDataOperationProps {
  info?: AgentInfo;
}

const HomeDataOperation: React.FC<HomeDataOperationProps> = () => {
  const pressLeft = () => {
    goTo('NewProxyMyRatio');
  };
  const pressRight = () => {
    // goTo('NewProxyInvitationRule');
    // goTo('Referral')
    toAgentApply();
  };
  return (
    <View
      style={[
        theme.padding.l,
        theme.background.mainDark,
        theme.flex.flex,
        theme.flex.row,
        theme.flex.centerByRow,
        theme.flex.around,
        styles.btnView,
      ]}>
      <Button
        size="middle"
        type="linear-primary"
        title={i18n.t('newProxy.child.leftText')}
        onPress={pressLeft}
      />
      <Button
        size="middle"
        type="linear-primary"
        title={i18n.t('newProxy.child.rightText')}
        onPress={pressRight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  btnView: {
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  btn1: {
    width: 130,
    height: 30,
  },
  btn2: {
    width: 130,
    height: 30,
    marginLeft: 30,
  },
});

export default HomeDataOperation;
