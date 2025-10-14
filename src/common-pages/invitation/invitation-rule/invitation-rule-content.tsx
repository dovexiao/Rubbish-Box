import theme from '@/style';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {RuleHeaderIcon, RulePointIcon} from '../svg.variables';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
import {useInnerStyle} from '../invitation.style.hooks';

const InvitationRuleContent = () => {
  const {t} = useTranslation();
  const ruleContentList = useMemo(() => {
    return Array(4)
      .fill(0)
      .map((_, i) => t(`invitation.rule.detail.paragraph${i + 1}`));
  }, [t]);
  const {ruleStyle} = useInnerStyle();
  return (
    <View
      style={[
        theme.flex.col,
        theme.padding.lrl,
        theme.padding.btml,
        ruleStyle.contentWrap,
        theme.borderRadius.m,
        theme.background.newFirst,
      ]}>
      <View style={[theme.flex.center]}>
        <RuleHeaderIcon width={218} height={32} />
        <Text
          color={theme.fontColor.white}
          fontSize={theme.fontSize.l}
          blod
          style={[theme.position.abs]}>
          {t('invitation.rule.detail.title')}
        </Text>
      </View>
      <View style={[theme.padding.btmxxl, theme.flex.col]}>
        {ruleContentList.map((item, i) => (
          <View
            key={i}
            style={[theme.flex.row, theme.flex.between, theme.margin.topl]}>
            <RulePointIcon
              width={8}
              height={8}
              fill={theme.basicColor.primary}
            />
            <Text
              white
              fontSize={theme.fontSize.m}
              style={[theme.margin.leftxxs, ruleStyle.contentItem]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default InvitationRuleContent;
