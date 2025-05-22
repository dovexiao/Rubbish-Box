/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View} from 'react-native';
import theme from '@/style';
import {flex} from '@/components/style';
// import {SafeAny} from '@/types';
// import Spin from '@/components/basic/spin';
// import LinearGradient from '@basicComponents/linear-gradient';
import ErrorInvitePage from '../basic-components/error-user-page';
import {SafeAny} from '@/types';

const Table = ({content}: SafeAny) => {
  return (
    <View style={[]}>
      <View
        style={[theme.background.white, flex.flex, flex.row, flex.alignStart]}>
        {/* <View>
          <View style={[tableLeft, theme.flex.flex, theme.flex.center]}>
            <Text style={[TextStyle]}>
              {i18n.t('proxy.team-report.user-id')}
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
            <View style={[padding.rights]}>
              <Sort
                title={i18n.t('proxy.team-report.user')}
                handleClick={() => {}}
              />
            </View>
            <View style={[padding.rights]}>
              <Sort
                title={i18n.t('proxy.team-report.recharge')}
                handleClick={() => {}}
              />
            </View>
            <View style={[padding.rights]}>
              <Sort
                title={i18n.t('proxy.team-report.betting')}
                handleClick={() => {}}
              />
            </View>
            <View style={[padding.rights]}>
              <Sort
                title={i18n.t('proxy.team-report.commission')}
                handleClick={() => {}}
              />
            </View>
            <View>
              <Sort
                title={i18n.t('proxy.team-report.won-loss')}
                handleClick={() => {}}
              />
            </View>
          </View>
        </ScrollView> */}
        {/* <View style={[position.abs, {right: 0, height: '100%'}]}>
          <LinearGradient
            style={[{width: 32, height: '100%'}, flex.center]}
            colors={['#fff', 'rgba(255, 255, 255, 0.00)']}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 1}}
          />
        </View> */}
      </View>
      <View style={[{marginTop: 0, height: 210}]}>
        <ErrorInvitePage content={content} />
      </View>
    </View>
  );
};
export default Table;
