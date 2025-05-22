import theme from '@/style';
import React, {ReactNode, useMemo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useInnerStyle} from '../proxy.hooks';
import Text from '@basicComponents/text';

export interface ProxyRulesTableProps {
  titles: string[];
  results: (string | ReactNode)[][];
  colStyles?: StyleProp<ViewStyle>[];
  style?: StyleProp<ViewStyle>;
}

const ProxyRulesTable: React.FC<ProxyRulesTableProps> = props => {
  const {rulesStyle} = useInnerStyle();
  const {titles, results, colStyles, style} = props;
  const resultColStyles = useMemo(() => {
    if (!colStyles) {
      return Array(titles.length)
        .fill(0)
        .map(() => null);
    }
    return colStyles;
  }, [colStyles, titles.length]);
  return (
    <View style={[theme.flex.col, style]}>
      <View
        style={[
          rulesStyle.tableHead,
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
          theme.padding.lrl,
        ]}>
        {titles.map((title, index) => (
          <View
            key={index}
            style={[
              index === 0 ? rulesStyle.firstCol : rulesStyle.otherCol,
              theme.flex.center,
              resultColStyles[index],
            ]}>
            <Text main fontSize={theme.fontSize.s} style={[theme.font.center]}>
              {title}
            </Text>
          </View>
        ))}
      </View>
      {results.map((result, index) => (
        <View
          key={index}
          style={[
            rulesStyle.tableItem,
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            theme.padding.lrl,
            index % 2 === 1 ? rulesStyle.tableItemLight : null,
          ]}>
          {result.map((col, innerIndex) => (
            <View
              key={innerIndex}
              style={[
                innerIndex === 0 ? rulesStyle.firstCol : rulesStyle.otherCol,
                theme.flex.center,
                resultColStyles[innerIndex],
              ]}>
              {typeof col === 'string' ? (
                <Text
                  second
                  fontSize={theme.fontSize.s}
                  style={[
                    theme.font.center,
                    innerIndex === 0
                      ? rulesStyle.firstCol
                      : rulesStyle.otherCol,
                  ]}>
                  {col}
                </Text>
              ) : (
                col
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ProxyRulesTable;
