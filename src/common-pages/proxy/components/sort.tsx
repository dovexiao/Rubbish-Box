import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {View, Text} from 'react-native';
import theme from '@/style';
import {flex, fontColor, fontSize, margin} from '@/components/style';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {SafeAny} from '@/types';
import {HomeUp, HomeDown} from '../svg.variable';
const tableright = {
  height: 28,
};
const TextStyle = {
  color: fontColor.white,
  fontSize: fontSize.s,
};
const Sort = forwardRef(
  (
    props: {
      title: string;
      handleClick?: SafeAny;
    },
    ref: any,
  ) => {
    const [num, setNum] = useState(0);
    useImperativeHandle(ref, () => ({
      num: () => {
        if (num === 0) {
          return 1;
        }
        if (num === 1) {
          return 2;
        }
        if (num === 2) {
          return 0;
        }
      },
      handelSetNum: (n: number) => {
        setNum(n);
      },
    }));
    return (
      <NativeTouchableOpacity
        onPress={() => {
          setNum(num + 1);
          if (num >= 2) {
            setNum(0);
          }
          props?.handleClick();
        }}
        style={[
          tableright,
          // theme.background.mainDark,
          theme.flex.flex,
          theme.flex.center,
          flex.row,
        ]}>
        <Text style={[TextStyle]}>{props.title}</Text>
        <View style={[margin.lrxxs]}>
          <View>
            {num === 0 && <HomeUp width={8} height={6} fill={'#9F9F9F'} />}
            {num === 1 && <HomeUp width={8} height={6} fill={'#F11402'} />}
            {num === 2 && <HomeUp width={8} height={6} fill={'#9F9F9F'} />}
          </View>
          <View>
            {num === 0 && <HomeDown width={8} height={6} fill={'#9F9F9F'} />}
            {num === 1 && <HomeDown width={8} height={6} fill={'#9F9F9F'} />}
            {num === 2 && <HomeDown width={8} height={6} fill={'#F11402'} />}
          </View>
        </View>
      </NativeTouchableOpacity>
    );
  },
);
export default Sort;
