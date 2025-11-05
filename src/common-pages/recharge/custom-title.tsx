import {View, StyleSheet} from 'react-native';
import React from 'react';

import Text from '@basicComponents/text';
import theme from '@/style';

export interface CustomTitleProps {
  name: string;
}

const CustomTitle = ({name}: CustomTitleProps) => {
  return (
    <View style={styles.title}>
      <View style={styles.titleIcon} />
      <Text style={styles.titleText}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    width: 4,
    height: 15,
    backgroundColor: theme.basicColor.newButtonYellow,
    borderRadius: 2,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.basicColor.newFontWhite,
    fontFamily: 'Arial, Arial-Bold',
  },
});

export default CustomTitle;
