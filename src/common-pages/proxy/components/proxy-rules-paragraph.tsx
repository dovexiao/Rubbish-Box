import LazyImage, {ImageUrlType} from '@basicComponents/image';
import React, {ReactNode} from 'react';
import {View} from 'react-native';
import theme from '@style';
import {useInnerStyle} from '../proxy.hooks';
import Text from '@basicComponents/text';
import BoxShadow from '@/components/basic/shadow';

export interface ProxyRulesTableResult {
  level: string;
  tiers: string[];
}

export interface ProxyRulesParagraphProps {
  titleImage: ImageUrlType;
  paragraphs: string[];
  children?: ReactNode;
}

const ProxyRulesParagraph: React.FC<ProxyRulesParagraphProps> = ({
  titleImage,
  paragraphs,
  children,
}) => {
  const {rulesStyle} = useInnerStyle();
  return (
    <BoxShadow
      style={[theme.margin.btms, rulesStyle.paragraphWrap]}
      shadowStyle={{
        radius: theme.borderRadiusSize.xl,
        out: {x: 0, y: 0, blur: 13, color: '#0000001b'},
      }}
      containerStyle={theme.margin.lrl}>
      <View
        style={[
          theme.flex.col,
          theme.flex.start,
          theme.padding.l,
          rulesStyle.paragraph,
          theme.borderRadius.xl,
        ]}>
        <LazyImage
          occupancy="#0000"
          width={theme.iconSize.xl}
          height={theme.iconSize.xl}
          imageUrl={titleImage}
        />
        <View style={[theme.margin.tops]}>
          {paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={[
                theme.margin.tops,
                rulesStyle.paragraphText,
                index > 0 ? rulesStyle.paragraphMargin : null,
              ]}
              fontSize={theme.fontSize.m}
              second>
              {paragraph}
            </Text>
          ))}
        </View>
        {children}
      </View>
    </BoxShadow>
  );
};

export default ProxyRulesParagraph;
