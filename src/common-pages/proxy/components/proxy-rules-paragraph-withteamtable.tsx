import ProxyRulesParagraph from './proxy-rules-paragraph';
import {useMemo} from 'react';
import ProxyRulesTable from '../basic-components/proxy-rules-table';
import React from 'react';
import i18n from '@/i18n';
import {useInnerStyle} from '../proxy.hooks';
import Level from '../basic-components/level';
import {toPriceStr} from '@/utils';
import theme from '@/style';
import {AgentRuleLevelItem} from '../proxy.type';
import {ImageUrlType} from '@/components/basic/image';
export interface ProxyRuleParagraphWithTeamTableProps {
  agentLevelList?: AgentRuleLevelItem[];
  titleImage: ImageUrlType;
}

const ProxyRuleParagraphWithTeamTable: React.FC<
  ProxyRuleParagraphWithTeamTableProps
> = ({agentLevelList = [], titleImage}) => {
  const tableTitles = [
    i18n.t('proxy.rules.agent-level'),
    i18n.t('proxy.rules.team-member'),
    i18n.t('proxy.rules.team-recharge'),
    i18n.t('proxy.rules.team-betting'),
  ];
  const {rulesStyle} = useInnerStyle();
  const tableColStyles = [
    null,
    rulesStyle.teamMemberCol,
    rulesStyle.teamRechargeCol,
    rulesStyle.teamBettingCol,
  ];
  const tableResults = useMemo(() => {
    return agentLevelList.map(item => [
      <Level level={+item.level} />,
      item.teamMember + '',
      toPriceStr(+item.teamRecharge, {thousands: true, fixed: 0}),
      toPriceStr(+item.teamBetting, {thousands: true, fixed: 0}),
    ]);
  }, [agentLevelList]);
  return (
    <ProxyRulesParagraph
      titleImage={titleImage}
      paragraphs={[i18n.t('proxy.rules.paragraph4')]}>
      <ProxyRulesTable
        titles={tableTitles}
        results={tableResults}
        colStyles={tableColStyles}
        style={[theme.margin.topl]}
      />
    </ProxyRulesParagraph>
  );
};

export default ProxyRuleParagraphWithTeamTable;
