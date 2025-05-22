import React from 'react';
import {ScrollView, View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import theme from '@/style';
import DetailNavTitle from '@/components/business/detail-nav-title';
import i18n from '@/i18n';
import Text from '@/components/basic/text';
import InvitationRuleTable from './invitation-rule-table';
import {goBack} from '@/utils';
import InvitationRuleContent from './invitation-rule-content';
import {LazyImageLGBackground} from '@basicComponents/image';

const InvitationRule = () => {
  const {
    size: {screenHeight},
    whiteSpaceStyle,
  } = useInnerStyle();
  return (
    <LazyImageLGBackground
      style={[{height: screenHeight}, theme.fill.fillW, theme.flex.col]}>
      <DetailNavTitle
        hideAmount
        hideServer
        title={i18n.t('invitation.rule.title')}
        onBack={goBack}
      />
      <ScrollView style={[theme.flex.flex1]}>
        <View style={[theme.flex.col, theme.padding.l, whiteSpaceStyle.bottom]}>
          <View
            style={[
              theme.flex.col,
              theme.padding.l,
              theme.background.mainDark,
              theme.margin.btml,
              theme.borderRadius.m,
            ]}>
            <Text white size="medium">
              {i18n.t('invitation.rule.paragraph.invite')}
            </Text>
            <Text white size="medium" style={[theme.margin.topl]}>
              {i18n.t('invitation.rule.paragraph.after')}
            </Text>
          </View>
          <InvitationRuleTable />
          <InvitationRuleContent />
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default InvitationRule;
