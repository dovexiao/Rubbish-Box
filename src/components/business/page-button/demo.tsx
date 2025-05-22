import React from 'react';
import PageButton from '.';
import theme from '@style';
import {View} from 'react-native';

const PageButtonDemo = () => {
  return (
    <View
      style={[
        theme.background.white,
        theme.padding.lrm,
        theme.padding.tbl,
        theme.flex.row,
      ]}>
      <PageButton type="all" />
      <PageButton type="left" />
      <PageButton type="right" />
      <PageButton type="all" disabled />
      <PageButton type="left" disabled />
      <PageButton type="right" disabled />
    </View>
  );
};

export default PageButtonDemo;
