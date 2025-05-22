import React from 'react';
import Picker from './picker';
import theme from '@/style';
import {View} from 'react-native';
import Text from '../text';

const PickerDemo = () => {
  const mockData = Array(100)
    .fill('')
    .map((_, i) => {
      return {
        label: `第${i + 1}个label`,
        secLabel: `第${i + 1}个secLabel`,
        value: `第${i + 1}个value`,
        secValue: `第${i + 1}个secValue`,
      };
    });
  const [open1, setOpen1] = React.useState(false);
  const [value1, setValue1] = React.useState<string>(null!);
  const [open2, setOpen2] = React.useState(false);
  const [value2, setValue2] = React.useState<string>(null!);
  const [open3, setOpen3] = React.useState(false);
  const [value3, setValue3] = React.useState<string>(null!);
  const itemReander = (item: (typeof mockData)[0]) => {
    return (
      <View>
        <Text>自定义label{item.secLabel}</Text>
      </View>
    );
  };
  return (
    <View style={theme.flex.col}>
      <Text>基础使用:</Text>
      <Picker
        open={open1}
        setOpen={setOpen1}
        value={value1}
        onValueChange={value => setValue1(value)}
        list={mockData}
      />
      <Text style={[theme.margin.leftl]}>value1: {value1}</Text>
      <Text style={[theme.margin.topxxl]}>禁止关闭:</Text>
      <Picker
        open={open2}
        setOpen={setOpen2}
        title="请选择"
        sheetHeaderTitle="请选择"
        value={value2}
        disableUserClose
        onValueChange={value => {
          setValue2(value);
          setOpen2(false);
        }}
        list={mockData}
      />
      <Text style={[theme.margin.leftl]}>value2: {value2}</Text>
      <Text style={[theme.margin.topxxl]}>自定义:</Text>
      <Picker
        open={open3}
        setOpen={setOpen3}
        titleRender={
          <View>
            <Text>自定义title</Text>
          </View>
        }
        sheetHeaderTitleRender={
          <View>
            <Text>自定义header</Text>
          </View>
        }
        itemRender={itemReander}
        value={value3}
        disableUserClose
        onValueChange={value => {
          setValue3(value);
          setOpen3(false);
        }}
        list={mockData}
      />
      <Text style={[theme.margin.leftl]}>value3: {value3}</Text>
    </View>
  );
};

export default PickerDemo;
