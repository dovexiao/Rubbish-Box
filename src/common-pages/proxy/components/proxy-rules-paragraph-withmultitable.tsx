import {View} from 'react-native';
import ProxyRulesParagraph from './proxy-rules-paragraph';
import {Fragment, useMemo} from 'react';
import ProxyRulesTable from '../basic-components/proxy-rules-table';
import React from 'react';
import theme from '@/style';
import {useInnerStyle} from '../proxy.hooks';
import Text from '@basicComponents/text';
import i18n from '@/i18n';
// import {ruleTitleImage} from '../proxy.variable';
import {ImageUrlType, LazyImageBackground} from '@/components/basic/image';
import {AgentRuleData, CommissionItem} from '../proxy.type';
export interface ProxyRuleParagraphWithMultiTableProps {
  ruleData?: AgentRuleData;
  titleImage: ImageUrlType;
}

// function processPercent(text?: string) {
//   if (!text) {
//     return '0%';
//   }
//   if (text.indexOf('~') === -1 && text.indexOf('%') === -1) {
//     return `${text}%`;
//   }
//   if (text.indexOf('~') >= 0) {
//     const [first, last] = text.split('~');
//     return `${first}\n~${last}`;
//   }
// }

function rangeStr(min: string, max: string) {
  if (+(min || 0) === +(max || 0)) {
    return `${(+(min || 0) * 100).toFixed(2)}%`;
  }
  return `${(+(min || 0) * 100).toFixed(2)}%\n~${(+(max || 0) * 100).toFixed(
    2,
  )}%`;
}

const itemMap = (item: CommissionItem) => [
  item.commissionLevel + '',
  rangeStr(item.tier1Min, item.tier1Max),
  rangeStr(item.tier2Min, item.tier2Max),
  rangeStr(item.tier3Min, item.tier3Max),
  rangeStr(item.tier4Min, item.tier4Max),
];

const ProxyRuleParagraphWithMultiTable: React.FC<
  ProxyRuleParagraphWithMultiTableProps
> = ({ruleData, titleImage}) => {
  const {rulesStyle} = useInnerStyle();
  const tableInfos = useMemo(() => {
    return [
      {
        title: i18n.t('proxy.rules.lottery'),
        result: ruleData?.lotteryCommissionList.map(itemMap) || [],
      },
      {
        title: i18n.t('proxy.rules.scratch'),
        result: ruleData?.scratchCommissionList.map(itemMap) || [],
      },
      {
        title: i18n.t('proxy.rules.casino'),
        result: ruleData?.casinoCommissionList.map(itemMap) || [],
      },
      {
        title: i18n.t('proxy.rules.sports'),
        result: ruleData?.sportCommissionList.map(itemMap) || [],
      },
    ];
  }, [ruleData]);

  const tableTitles = [
    i18n.t('proxy.rules.commission-level'),
    i18n.t('proxy.tier', {number: 1}),
    i18n.t('proxy.tier', {number: 2}),
    i18n.t('proxy.tier', {number: 3}),
    i18n.t('proxy.tier', {number: 4}),
  ];

  return (
    <ProxyRulesParagraph
      titleImage={titleImage}
      paragraphs={[
        i18n.t('proxy.rules.paragraph6-1'),
        i18n.t('proxy.rules.paragraph6-2'),
      ]}>
      {tableInfos.map(
        (item, index) =>
          item.result?.length > 0 && (
            <Fragment key={index}>
              <View style={[theme.margin.topxxl, theme.flex.center]}>
                <LazyImageBackground
                  occupancy="#0000"
                  // imageUrl={ruleTitleImage}
                  width={259}
                  height={52}
                  style={[
                    theme.padding.xxs,
                    theme.flex.center,
                    theme.margin.btml,
                  ]}>
                  <Text
                    blod
                    fontSize={theme.fontSize.m}
                    color={theme.basicColor.white}
                    style={[rulesStyle.tableTitleText, theme.font.center]}>
                    {item.title}
                  </Text>
                </LazyImageBackground>
              </View>

              <ProxyRulesTable titles={tableTitles} results={item.result} />
            </Fragment>
          ),
      )}
    </ProxyRulesParagraph>
  );
};

export default ProxyRuleParagraphWithMultiTable;
