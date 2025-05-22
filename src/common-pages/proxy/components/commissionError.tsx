/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, ScrollView} from 'react-native';
import theme from '@/style';
import {flex, fontColor, fontSize, margin, padding} from '@/components/style';
import Text from '@basicComponents/text';
import i18n from '@/i18n';
// import {SafeAny} from '@/types';
// import Spin from '@/components/basic/spin';
import ErrorInvitePage from '../basic-components/error-user-page';
const tableLeft = {
  width: 130,
  height: 32,
  backgroundColor: '#D8E2E7',
  marginRight: 2,
};
const tableLeftTwo = {
  height: 32,
  width: 64,
  backgroundColor: '#D8E2E7',
  marginRight: 2,
  ...margin.lefts,
};
const TextStyle = {
  color: fontColor.second,
  fontSize: fontSize.s,
};

const Table = () => {
  return (
    <View style={[{paddingLeft: 20, paddingRight: 20}]}>
      <View
        style={[
          theme.background.mainDark,
          flex.flex,
          flex.row,
          flex.alignStart,
        ]}>
        <View>
          <View style={[tableLeft, theme.flex.flex, theme.flex.center]}>
            <Text style={[TextStyle]}>
              {i18n.t('proxy.commission-base.commissionType')}
            </Text>
          </View>
        </View>
        <ScrollView horizontal={true}>
          <View
            style={[
              padding.lrl,
              flex.row,
              flex.centerByCol,
              {backgroundColor: '#D8E2E7'},
            ]}>
            <View style={[tableLeftTwo, theme.flex.flex, theme.flex.center]}>
              <Text style={[TextStyle]}>
                {i18n.t('proxy.commission-base.commissionTier1')}
              </Text>
            </View>
            <View style={[tableLeftTwo, theme.flex.flex, theme.flex.center]}>
              <Text style={[TextStyle]}>
                {i18n.t('proxy.commission-base.commissionTier2')}
              </Text>
            </View>
            <View style={[tableLeftTwo, theme.flex.flex, theme.flex.center]}>
              <Text style={[TextStyle]}>
                {i18n.t('proxy.commission-base.commissionTier3')}
              </Text>
            </View>
            <View style={[tableLeftTwo, theme.flex.flex, theme.flex.center]}>
              <Text style={[TextStyle]}>
                {i18n.t('proxy.commission-base.commissionTier4')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      <View>
        <ErrorInvitePage content={i18n.t('proxy.team-report.no-data')} />
      </View>
    </View>
  );
};
export default Table;
