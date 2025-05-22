import React from 'react';
import theme from '@/style';
import {View, Text, StyleSheet} from 'react-native';
// import LinearGradient from '@/components/basic/linear-gradient';

interface RatioCardProps {
  title?: String;
  total?: Number;
  list?: Array<any>;
  originalList?: Array<any>;
  type?: Number;
}
const RatioCard: React.FC<RatioCardProps> = props => {
  const {title, list, type, originalList} = props;

  return (
    <View
      style={[
        theme.flex.flex,
        theme.flex.centerByCol,
        theme.flex.row,
        type === 1 ? styles.bg1 : styles.bg2,
      ]}>
      <View
        style={[
          styles.tierLine,
          styles.contentMinHeight,
          {
            minWidth: 80,
            height: '100%',
          },
        ]}>
        <Text
          numberOfLines={1}
          style={[
            styles.tierStyle,
            styles.tierType,
            theme.flex.flex,
            theme.flex.centerByCol,
            theme.flex.centerByRow,
          ]}>
          {title || ''}
        </Text>
      </View>
      <View
        style={[
          theme.flex.flex,
          theme.flex.centerByCol,
          theme.flex.centerByRow,
          theme.flex.row,
          theme.flex.flex1,
        ]}>
        {list &&
          list.length > 0 &&
          list.map((item, index) => (
            <View
              style={[
                theme.flex.flex1,
                styles.tierLine,
                styles.contentMinHeight,
              ]}>
              <Text
                numberOfLines={1}
                key={index}
                style={[
                  styles.tierStyle,
                  type === 2 ? styles.colorRed : null,
                  theme.flex.centerByRow,
                  theme.flex.flex,
                  theme.flex.centerByCol,
                  theme.flex.row,
                  {
                    fontSize: 12,
                  },
                ]}>
                {item || ''}
              </Text>
              {type === 2 ? (
                <Text key={index} style={[styles.tierStyle1]}>
                  {originalList ? originalList[index] || '' : ''}
                </Text>
              ) : null}
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tierType: {
    minWidth: 80,
    maxWidth: 80,
  },
  tierStyle: {
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  colorRed: {
    color: '#F3E751',
  },
  contentMinHeight: {
    minHeight: 30,
  },
  tierStyle1: {
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 11,
    lineHeight: 11 * 1.3,
    textDecorationLine: 'line-through',
  },
  tierLine: {
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    borderRightWidth: 0.5,
    borderRightColor: '#eee',
  },
  bg1: {
    backgroundColor: 'rgba(4, 204, 155, 0.25)',
  },
  bg2: {
    // backgroundColor: '#201156',
    backgroundColor: 'rgba(4, 204, 155, 0.15)',
  },
  emptyStyle: {
    opacity: 0,
  },
});

export default RatioCard;
