import theme from '@/style';
import React, {useState, useEffect} from 'react';
import {Image, View} from 'react-native';
import Text from '../text';
import {NativeTouchableOpacity} from '../touchable-opacity';
import {BottomSheet} from '@rneui/themed';
import DatePickerList from './date-picker-list';
import Button from '../button';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import globalStore from '@/services/global.state';

export interface DatePickerProps {
  titleRender?: React.JSX.Element;
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: Date;
  type?: 'month' | 'day';
  onValueChange?: (value: Date) => void;
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
  /** 可选择的最大天数范围，包含了当天（例如，7 表示最多选择过去7天的日期） */
  maxSelectableDaysAgo?: number;
}

const DatePicker = ({
  open,
  setOpen,
  titleRender,
  value,
  type = 'day',
  onValueChange,
  maxSelectableDaysAgo = 0,
  minDate,
  maxDate,
}: DatePickerProps) => {
  const {i18n} = useTranslation();
  const currentDate = value ? dayjs(value) : dayjs();
  const [year, setYear] = useState(currentDate.year());
  const [month, setMonth] = useState(currentDate.month() + 1); // month is 0-indexed in dayjs
  const [day, setDay] = useState(type === 'day' ? currentDate.date() : 1);

  // 修复外部值变动，内部状态不同步问题
  useEffect(() => {
    const current = value ? dayjs(value) : dayjs();
    setYear(current.year());
    setMonth(current.month() + 1); // month is 0-indexed in dayjs
    if (type === 'day') {
      setDay(current.date());
    }
  }, [value]);

  // 获取可选年份范围
  const getYearRange = () => {
    let startYear = 2020;
    let endYear = dayjs().year();

    if (minDate && dayjs(minDate).year() > startYear) {
      startYear = dayjs(minDate).year();
    }
    if (maxDate && dayjs(maxDate).year() < endYear) {
      endYear = dayjs(maxDate).year();
    }

    return Array(endYear - startYear + 1)
      .fill('')
      .map((v, i) => startYear + i);
  };

  const [yearsList, setYearsList] = useState(getYearRange());

  // 获取可选月份范围
  const getMonth = (y = year) => {
    let months = [];
    const today = dayjs();

    if (minDate && y === dayjs(minDate).year()) {
      // 如果年份是最小年份，月份限制为minDate之后的月份
      months = Array.from(
        {length: 12 - dayjs(minDate).month()},
        (_, i) => dayjs(minDate).month() + i + 1,
      );
    } else if (maxDate && y === dayjs(maxDate).year()) {
      // 如果年份是最大年份，月份限制为maxDate之前的月份
      months = Array.from(
        {length: dayjs(maxDate).month() + 1},
        (_, i) => i + 1,
      );
    } else {
      // 否则所有月份都可选
      months = Array.from({length: 12}, (_, i) => i + 1);
    }

    return months;
  };

  const [months, setMonths] = useState(getMonth(year));

  // 获取可选天数范围
  const getDays = (y = year, m = month) => {
    if (type === 'month') {
      return [];
    }

    const currentTime = dayjs(`${y}-${m}`).endOf('month');
    let maxDays = currentTime.date(); // 默认最大天数为该月最大天数

    // 处理minDate和maxDate对天数的限制
    if (
      minDate &&
      y === dayjs(minDate).year() &&
      m === dayjs(minDate).month() + 1
    ) {
      maxDays = Math.max(dayjs(minDate).date(), maxDays); // minDate限制
    }
    if (
      maxDate &&
      y === dayjs(maxDate).year() &&
      m === dayjs(maxDate).month() + 1
    ) {
      maxDays = Math.min(dayjs(maxDate).date(), maxDays); // maxDate限制
    }

    return Array.from({length: maxDays}, (_, i) => i + 1); // 返回该月实际可选的天数
  };

  const [days, setDays] = useState<number[]>(getDays(year, month));

  // 更新天数范围，保证天数有效
  useEffect(() => {
    if (type === 'month') return;

    const _days = getDays(year, month);
    setDays(_days);
    if (day > _days.length) {
      setDay(_days.length); // 保证选中的天数在有效范围内
    }
  }, [month, year]);

  // 更新月份范围
  useEffect(() => {
    const _months = getMonth(year);
    setMonths(_months);
    if (month > _months.length) {
      setMonth(_months.length); // 保证选中的月数在有效范围内
    }
  }, [year]);

  const handlePress = () => {
    const selectedDate =
      type === 'day'
        ? dayjs(`${year}-${month}-${day}`, 'YYYY-MM-DD')
        : dayjs(`${year}-${month}`, 'YYYY-MM');

    // NOTE:暂时先这么处理，后面再优化
    // 如果设置了最大选择天数限制，验证当前选择的日期
    if (
      type === 'day' &&
      maxSelectableDaysAgo &&
      selectedDate.isBefore(
        dayjs().subtract(maxSelectableDaysAgo, 'day'),
        'day',
      )
    ) {
      // 如果选择的日期超过了最大允许的天数，提示用户，并直接返回
      globalStore.globalTotal.next({
        type: 'warning',
        message: i18n.t('warning.selectDateInLastDays', {
          days: maxSelectableDaysAgo + 1,
        }),
      });
      return;
    }

    onValueChange?.(selectedDate.toDate());
    setOpen(false);
  };

  return (
    <NativeTouchableOpacity
      style={theme.flex.col}
      onPress={() => setOpen(true)}>
      {titleRender ? (
        titleRender
      ) : (
        <View style={[theme.padding.l]}>
          <Text main>{currentDate.format('YYYY-MM-DD')}</Text>
        </View>
      )}
      <BottomSheet
        modalProps={{animationType: 'fade'}}
        onBackdropPress={() => setOpen(false)}
        isVisible={open}>
        <View
          style={[
            theme.background.newBgPop,
            theme.flex.col,
            theme.borderRadius.m,
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
              style={{width: '33%'}}
              list={yearsList}
              setValue={setYear}
            />
            <DatePickerList
              value={month}
              style={[theme.margin.lrxxl, {width: '33%'}]}
              list={months}
              setValue={setMonth}
            />
            {type === 'day' && (
              <DatePickerList
                value={day}
                style={{width: '33%'}}
                list={days}
                setValue={setDay}
              />
            )}
          </View>
          <Button
            title={i18n.t('label.confirm')}
            titleBold
            buttonStyle={[
              theme.padding.tbl,
              {
                height: theme.paddingSize.l * 4,
                backgroundColor: theme.basicColor.newButtonYellow,
              },
            ]}
            onPress={handlePress}
          />
        </View>
      </BottomSheet>
    </NativeTouchableOpacity>
  );
};

export default DatePicker;
