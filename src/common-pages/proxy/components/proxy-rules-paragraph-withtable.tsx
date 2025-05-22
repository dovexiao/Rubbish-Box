import ProxyRulesParagraph from './proxy-rules-paragraph';
import {useMemo} from 'react';
import ProxyRulesTable from '../basic-components/proxy-rules-table';
import React from 'react';
import i18n from '@/i18n';
import theme from '@/style';
import {CommissionItem} from '../proxy.type';
import {ImageUrlType} from '@/components/basic/image';
export interface ProxyRuleParagraphWithTableProps {
  list?: CommissionItem[];
  titleImage: ImageUrlType;
}

function rangeStr(min: string, max: string, defaultVal?: string) {
  if (+(min || 0) === 0 || +(max || 0) === 0) {
    return `${(+(defaultVal || 0) * 100).toFixed(2)}%`;
  }
  if (+(min || 0) === +(max || 0)) {
    return `${(+(min || 0) * 100).toFixed(2)}%`;
  }
  return `${(+(min || 0) * 100).toFixed(2)}%\n~${(+(max || 0) * 100).toFixed(
    2,
  )}%`;
}

const ProxyRuleParagraphWithTable: React.FC<
  ProxyRuleParagraphWithTableProps
> = ({list, titleImage}) => {
  const tableTitles = [
    i18n.t('proxy.rules.agent-level'),
    i18n.t('proxy.tier', {number: 1}),
    i18n.t('proxy.tier', {number: 2}),
    i18n.t('proxy.tier', {number: 3}),
    i18n.t('proxy.tier', {number: 4}),
  ];
  const tableResults = useMemo(() => {
    return (
      list?.map(item => [
        item.commissionLevel + '',
        rangeStr(item.tier1Min, item.tier1Max, item.tier1),
        rangeStr(item.tier2Min, item.tier2Max, item.tier2),
        rangeStr(item.tier3Min, item.tier3Max, item.tier3),
        rangeStr(item.tier4Min, item.tier4Max, item.tier4),
      ]) || []
    );
  }, [list]);
  return (
    <ProxyRulesParagraph
      titleImage={titleImage}
      paragraphs={[i18n.t('proxy.rules.paragraph5')]}>
      <ProxyRulesTable
        titles={tableTitles}
        results={tableResults}
        style={[theme.margin.topl]}
      />
    </ProxyRulesParagraph>
  );
};

export default ProxyRuleParagraphWithTable;
