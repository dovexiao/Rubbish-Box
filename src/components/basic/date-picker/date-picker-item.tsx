import LazyImage from '@/components/basic/image';
import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import dayjs from 'dayjs';
import Text from '@/components/basic/text';
import theme from '@/style';
import DatePicker from '@/components/basic/date-picker';
const calendar = require('@assets/icons/calendar.webp');
const triangle = require('@/assets/icons/down-primary.webp');
export interface SelectDateType {
  containerStyle?: StyleProp<ViewStyle>;
  value?: Date;
  onChange?: (v: Date) => void;
}

const DatePickerItem = (props: SelectDateType) => {
  const {containerStyle, value, onChange} = props;
  const [showDate, setShowDate] = React.useState(false);
  return (
    <DatePicker
      titleRender={
        <View
          style={[
            theme.flex.row,
            theme.flex.centerByCol,
            theme.background.mainDark,
            theme.borderRadius.m,
            theme.padding.lrl,
            theme.margin.lrl,
            theme.margin.tbm,
            theme.border.primary50,
            theme.flex.between,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: 36,
            },
            containerStyle,
          ]}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <LazyImage
              imageUrl={calendar}
              width={24}
              height={24}
              occupancy="transparent"
            />
            <Text
              blod
              size="medium"
              style={[theme.margin.leftl, theme.font.white]}>
              {dayjs(value).format('YYYY-MM')}
            </Text>
          </View>
          <LazyImage
            imageUrl={triangle}
            width={24}
            height={24}
            occupancy="transparent"
          />
        </View>
      }
      open={showDate}
      setOpen={setShowDate}
      type="month"
      value={value}
      onValueChange={onChange}
    />
  );
};

export default DatePickerItem;
