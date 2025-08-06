import React from 'react';
import theme from '@style';
import i18n from '@i18n';
import {
  teamReportImage,
  commissionDetailImage,
  // customerServiceImage,
} from '../proxy.variable';
import {View} from 'react-native';
import {SubItem} from '../basic-components';
import {goTo, toAgentApply} from '@/utils';
// import {goAgentService, goTo, toAgentApply} from '@/utils';

export interface SubEntryProps {
  userId?: number;
  agentLevel?: number;
}

const SubEntry: React.FC<SubEntryProps> = ({userId, agentLevel}) => {
  const list = [
    {icon: teamReportImage, title: i18n.t('proxy.home.team-report')},
    {
      icon: commissionDetailImage,
      title: i18n.t('proxy.home.commission-detail'),
    },
    // {icon: invitationRulesImage, title: i18n.t('proxy.home.invitation-rules')},
    // {icon: commissionIcon, title: i18n.t('invitation.home.title')},
    // {
    //   icon: customerServiceImage,
    //   title: i18n.t('proxy.home.agent-line-customer-service'),
    // },
  ];
  const onPress = (index: number) => {
    const handler = [
      () => goTo('ProxyTeamReport'),
      () => {
        if (userId != null) {
          goTo('ProxyCommissionDetail', {userId, agentLevel});
        }
      },
      () => {
        toAgentApply();
      },
      () => goTo('Referral'),
      // () => goAgentService(),
    ];
    handler[index]?.();
  };
  return (
    <View
      style={[
        theme.background.mainDark,
        theme.margin.lrl,
        theme.padding.lrl,
        {
          marginTop: theme.paddingSize.l,
          borderRadius: theme.borderRadiusSize.s,
        },
      ]}>
      {list.map((item, index) => {
        return <SubItem {...item} key={index} onPress={() => onPress(index)} />;
      })}
    </View>
  );
};

export default SubEntry;
