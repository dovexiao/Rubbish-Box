import theme from '@/style';
import React, {useState} from 'react';
import {Image, View} from 'react-native';
import Text from '../text';
import {NativeTouchableOpacity} from '../touchable-opacity';
import {BottomSheet} from '@rneui/themed';
import DatePickerList from './date-picker-list';
import Button from '../button';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';

export interface DatePickerProps {
  titleRender?: React.JSX.Element;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** 默认当天/当月 */
  value?: Date;
  /** 类型,默认精确到天 */
  type?: 'month' | 'day';
  onValueChange?: (value: Date) => void;
}

const DatePicker = ({
  open,
  setOpen,
  titleRender,
  value,
  type = 'day',
  onValueChange,
}: DatePickerProps) => {
  const {i18n} = useTranslation();
  const currentDate = value ? new Date(value) : new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const years = Array(new Date().getFullYear() - 2020)
    .fill('')
    .map((v, i) => 2020 + i + 1);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  // 修复外部值变动，内部状态不同步问题
  React.useEffect(() => {
    const current = value ? new Date(value) : new Date();
    setMonth(current.getMonth() + 1);
    setYear(current.getFullYear());
  }, [value]);

  const getMonth = (y = year) => {
    const today = new Date();
    let len = 12;
    if (y === today.getFullYear()) {
      len = today.getMonth() + 1;
    }
    return Array(len)
      .fill('')
      .map((v, i) => i + 1);
  };
  const [months, setMonths] = useState(getMonth());
  const [day, setDay] = useState(type === 'day' ? currentDate.getDate() : 1);
  const getDays = (y = year, m = month) => {
    if (type === 'month') {
      return [];
    }
    const nextMonth = m === 12 ? 1 : m + 1;
    const currentTime = new Date(`${y} ${nextMonth}`);
    currentTime.setDate(0);
    return Array(currentTime.getDate())
      .fill('')
      .map((v, i) => i + 1);
  };
  const [days, setDays] = useState<number[]>(
    getDays(year, currentDate.getMonth() + 1),
  );
  React.useEffect(() => {
    if (type === 'month') {
      return;
    }
    const _days = getDays(year, month);
    setDays(_days);
    if (day > _days.length - 1) {
      setDay(_days.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);
  React.useEffect(() => {
    const _months = getMonth(year);
    setMonths(_months);
    if (month > _months.length - 1) {
      setMonth(_months.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return (
    <NativeTouchableOpacity
      style={theme.flex.col}
      onPress={() => setOpen(true)}>
      {titleRender ? (
        titleRender
      ) : (
        <View style={[theme.padding.l]}>
          <Text main>{currentDate.toLocaleDateString()}</Text>
        </View>
      )}
      <BottomSheet
        modalProps={{animationType: 'fade'}}
        onBackdropPress={() => setOpen(false)}
        isVisible={open}>
        <View
          style={[
            theme.background.mainDark,
            theme.flex.col,
            theme.borderRadius.m,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
              padding: theme.paddingSize.l * 2,
            },
          ]}>
          <View style={[theme.flex.row, theme.flex.between]}>
            <Text white blod size="medium">
              {i18n.t('datePicker.label.select')}
            </Text>
            <NativeTouchableOpacity onPress={() => setOpen(false)}>
              <Image
                style={[theme.icon.m]}
                source={require('@components/assets/icons/close.webp')}
              />
            </NativeTouchableOpacity>
          </View>
          <View
            style={[
              theme.flex.row,
              theme.flex.around,
              theme.margin.topl,
              theme.margin.btmxxl,
              theme.padding.tbl,
              {
                height: 45 * 3 + 24, // 3个元素+上下边距
              },
            ]}>
            <DatePickerList
              value={year}
              style={[
                // eslint-disable-next-line react-native/no-inline-styles
                {width: '33%'},
              ]}
              list={years}
              setValue={setYear}
            />
            <DatePickerList
              value={month}
              style={[
                theme.margin.lrxxl,
                // eslint-disable-next-line react-native/no-inline-styles
                {width: '33%'},
              ]}
              list={months}
              setValue={setMonth}
            />
            {type === 'day' && (
              <DatePickerList
                value={day}
                style={[
                  // eslint-disable-next-line react-native/no-inline-styles
                  {width: '33%'},
                ]}
                list={days}
                setValue={setDay}
              />
            )}
          </View>
          <Button
            title={i18n.t('label.confirm')}
            titleBold
            buttonStyle={[theme.padding.tbl, {height: theme.paddingSize.l * 4}]}
            onPress={() => {
              if (type === 'day') {
                onValueChange?.(
                  dayjs(`${year}${month}${day}`, 'YYYYMMDD').toDate(),
                );
              } else {
                onValueChange?.(dayjs(`${year}${month}`, 'YYYYMM').toDate());
              }
              setOpen(false);
            }}
          />
        </View>
      </BottomSheet>
    </NativeTouchableOpacity>
  );
};

export default DatePicker;
