import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import ProxyRulesHeader from './components/proxy-rules-header';
import theme from '@style';
import {useInnerStyle} from './proxy.hooks';
import {LazyImageBackground} from '@/components/basic/image';
import {
  // ruleBgImage,
  ruleP01Image,
  ruleP02Image,
  ruleP03Image,
  ruleP04Image,
  ruleP05Image,
  ruleP06Image,
  ruleP07Image,
} from './proxy.variable';
import ProxyRulesTitle from './components/proxy-rules-title';
import ProxyRulesParagraph from './components/proxy-rules-paragraph';
import i18n from '@/i18n';
import ProxyRuleParagraphWithTable from './components/proxy-rules-paragraph-withtable';
import ProxyRuleParagraphWithMultiTable from './components/proxy-rules-paragraph-withmultitable';
import ProxyRuleParagraphWithTeamTable from './components/proxy-rules-paragraph-withteamtable';
import {AgentRuleData} from './proxy.type';
import {getAgentRuleData} from './proxy.service';
import globalStore from '@/services/global.state';

const ProxyRules = () => {
  const [ruleData, setRuleData] = useState<AgentRuleData>();
  useEffect(() => {
    getAgentRuleData().then(data => setRuleData(data));
  }, []);
  const {
    rulesStyle,
    size: {ruleBgHeight, screenWidth},
  } = useInnerStyle();

  return (
    <View style={[theme.position.rel, rulesStyle.page, theme.overflow.hidden]}>
      <LazyImageBackground
        width={screenWidth}
        height={ruleBgHeight}
        // imageUrl={ruleBgImage}
        style={[theme.position.abs, rulesStyle.bg]}
      />
      <ProxyRulesHeader />
      <ScrollView style={[theme.flex.flex1]}>
        <ProxyRulesTitle />
        <ProxyRulesParagraph
          titleImage={ruleP01Image}
          paragraphs={[i18n.t('proxy.rules.paragraph1')]}
        />
        <ProxyRulesParagraph
          titleImage={ruleP02Image}
          paragraphs={[i18n.t('proxy.rules.paragraph2')]}
        />
        <ProxyRulesParagraph
          titleImage={ruleP03Image}
          paragraphs={[i18n.t('proxy.rules.paragraph3')]}
        />
        {globalStore.packageId !== 2 && (
          <ProxyRuleParagraphWithTeamTable
            titleImage={ruleP04Image}
            agentLevelList={ruleData?.agentLevelList}
          />
        )}
        {ruleData?.refundList?.length ? (
          <ProxyRuleParagraphWithTable
            titleImage={
              globalStore.packageId !== 2 ? ruleP05Image : ruleP04Image
            }
            list={ruleData?.refundList}
          />
        ) : null}

        {globalStore.packageId !== 2 && (
          <ProxyRuleParagraphWithMultiTable
            titleImage={
              ruleData?.refundList?.length ? ruleP06Image : ruleP05Image
            }
            ruleData={ruleData}
          />
        )}
        <ProxyRulesParagraph
          titleImage={
            globalStore.packageId === 2
              ? ruleP05Image
              : ruleData?.refundList?.length
              ? ruleP07Image
              : ruleP06Image
          }
          paragraphs={[i18n.t('proxy.rules.paragraph7')]}
        />
        <View style={[theme.fill.fillW, rulesStyle.whiteArea]} />
      </ScrollView>
    </View>
  );
};

export default ProxyRules;
