import React from 'react';
import theme from '@/style';
import {View, Text, StyleSheet} from 'react-native';
// import LinearGradient from '@/components/basic/linear-gradient';

interface RatioCardProps {
  title?: String;
  total?: Number;
  list?: Array<any>;
  type?: Number;
}
// interface TextLinearProps {
//   text?: string;
// }
// const TextLinear: React.FC<TextLinearProps> = props => {
//   const {text} = props;
//   return (
//     <LinearGradient
//       start={{x: 0, y: 0}}
//       end={{x: 0, y: 1}}
//       colors={['#FFDDAA', '#fff']}
//       style={[theme.fill.fill]}>
//       <Text>{text || ''}</Text>
//     </LinearGradient>
//   );
// };
const RatioCard: React.FC<RatioCardProps> = props => {
  const {title, list, type} = props;

  return (
    <View
      style={[
        theme.flex.flex,
        // theme.flex.centerByCol,
        theme.flex.row,
        type === 1 ? styles.bg1 : styles.bg2,
      ]}>
      {/* <Text style={[type == 1 ? styles.tierStyle : styles.tierContentStyle, styles.tierLine, styles.tierType]}>{
        type == 1 ? (title || '') : <TextLinear text={`${title}`} />
      }</Text>
      {
        list && list.length > 0 && list.map((item, index) => (
          <Text key={index} style={[type == 1 ? styles.tierStyle : styles.tierContentStyle, styles.tierLine]}>{
            type == 1 ? (item || '') : <TextLinear text={`${item || '-'}`} />
          }</Text>
        ))
      } */}
      <Text
        style={[
          type === 1 ? styles.tierStyle : styles.tierContentStyle,
          styles.tierLine,
          styles.tierType,
        ]}>
        {title || ''}
      </Text>
      {list &&
        list.length > 0 &&
        list.map((item, index) => (
          <Text
            key={index}
            style={[
              type === 1 ? styles.tierStyle : styles.tierContentStyle1,
              styles.tierLine,
            ]}>
            {item || ''}
          </Text>
        ))}
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
    lineHeight: 15 * 2,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tierContentStyle: {
    color: '#fff',
    lineHeight: 15 * 2,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierContentStyle1: {
    color: '#F3E751',
    lineHeight: 15 * 2,
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tierLine: {
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
    borderRightWidth: 0.5,
    borderRightColor: '#eee',
  },
  bg1: {
    // backgroundColor: '#5b3bc5',
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
