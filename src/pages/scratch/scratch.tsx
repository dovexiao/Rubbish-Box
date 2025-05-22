import {FadeInView} from '@/components/basic/animations';
import React from 'react';
import CommonScratch from '@/common-pages/scratch';
import {NavigatorScreenProps} from '@/types';
import {View} from 'react-native';
import theme from '@/style';

const Scratch = (props: NavigatorScreenProps) => {
  return (
    <FadeInView>
      <View style={[theme.flex.flex1]}>
        <CommonScratch {...props} />
      </View>
    </FadeInView>
  );
};

export default Scratch;
