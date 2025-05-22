import LazyImage from '@/components/basic/image';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import React, {useMemo, useRef, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {dateImg, filterImg, sanImg} from './filter.variable';
import dayjs from 'dayjs';
import Text from '@/components/basic/text';
import Picker from './picker';
import {SafeAny} from '@/types';
import {
  FilterModalOption,
  useFilterModal,
} from '@/components/basic/filter-modal';
import i18n from '@/i18n';
import {flex, margin} from '@/components/style';
export type ValidRangeType = {
  startDate?: Date;
  endDate?: Date;
  disabledDates?: Date[];
};

export interface DateInlineFilterProps {
  requiredInit?: boolean;
  dateRange?: string[] | null;
  validRange?: ValidRangeType;
  onDateRangeChanged?: (dateRange?: string[] | null) => void;
}

const daysAgoFilterOptions: FilterModalOption[] = [
  {
    title: i18n.t('filter.today'),
    value: '0',
  },
  {
    title: i18n.t('filter.yesterday'),
    value: '1',
  },
  {
    title: i18n.t('filter.days', {day: 7}),
    value: '7',
  },
  {
    title: i18n.t('filter.days', {day: 15}),
    value: '15',
  },
  {
    title: i18n.t('filter.days', {day: 30}),
    value: '30',
  },
];

const DateInlineFilter: React.FC<DateInlineFilterProps> = props => {
  const {dateRange, onDateRangeChanged, requiredInit, validRange} = props;
  const filterStyle = StyleSheet.create({
    dateInline: {
      height: 28,
    },
    date: {
      width: 70,
    },
    dateText: {
      width: 40,
    },
  });
  const {
    renderModal,
    show,
    currentValue: filteredValue,
  } = useFilterModal(i18n.t('filter.time'), daysAgoFilterOptions, requiredInit);
  const pickerRef = useRef<SafeAny>(null);
  const showTime = useMemo(() => {
    if (!dateRange || dateRange.length < 2) {
      return null;
    }
    const [startDate, endDate] = dateRange;
    const startDateStr = dayjs(startDate, 'YYYYMMDD').format('DD/MM');
    const endDateStr = dayjs(endDate, 'YYYYMMDD').format('DD/MM');
    if (startDateStr === endDateStr) {
      return startDateStr;
    }
    return `${startDateStr}-${endDateStr}`;
  }, [dateRange]);
  const handleOpenPick = () => {
    pickerRef.current.handleOpen();
  };
  const handleConfirm = (range: {startDate: number; endDate: number}) => {
    const {startDate, endDate} = range;
    onDateRangeChanged?.([
      dayjs(startDate).format('YYYYMMDD'),
      dayjs(endDate).format('YYYYMMDD'),
    ]);
  };
  useEffect(() => {
    onDateRangeChanged?.(
      filteredValue != null
        ? [
            dayjs().subtract(+filteredValue, 'day').format('YYYYMMDD'),
            dayjs()
              .subtract(+filteredValue > 0 ? 1 : 0, 'day')
              .format('YYYYMMDD'),
          ]
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredValue]);
  return (
    <View style={[theme.flex.flex, theme.flex.row, theme.flex.between]}>
      <NativeTouchableOpacity onPress={() => show()}>
        <View
          style={[
            theme.background.mainDark,
            filterStyle.dateInline,
            theme.padding.lrs,
            theme.borderRadius.xs,
            theme.flex.row,
            theme.flex.center,
            theme.border.primary50,
          ]}>
          <LazyImage
            imageUrl={filterImg}
            occupancy="#0000"
            width={theme.iconSize.s}
            height={theme.iconSize.s}
          />
          <Text white style={[theme.margin.lrxxs]}>
            {i18n.t('filter.name')}
          </Text>
          <View>
            <LazyImage
              imageUrl={sanImg}
              occupancy="#0000"
              width={theme.iconSize.xs}
              height={theme.iconSize.xs}
            />
          </View>
        </View>
      </NativeTouchableOpacity>
      <NativeTouchableOpacity onPress={handleOpenPick}>
        <View
          style={[
            theme.background.mainDark,
            filterStyle.dateInline,
            theme.padding.lrs,
            theme.borderRadius.xs,
            theme.flex.row,
            theme.flex.centerByCol,
            theme.flex.between,
            theme.margin.leftxxs,
            theme.border.primary50,
          ]}>
          {showTime ? (
            <View style={[theme.overflow.hidden, margin.rightxxs]}>
              <Text
                white
                fontSize={theme.fontSize.m}
                numberOfLines={1}
                ellipsizeMode="tail">
                {showTime}
              </Text>
            </View>
          ) : (
            <View style={[flex.flex, flex.row]}>
              <View style={[margin.lrxxs]}>
                <LazyImage
                  imageUrl={dateImg}
                  occupancy="#0000"
                  width={theme.iconSize.s}
                  height={theme.iconSize.s}
                />
              </View>
              <Text
                white
                fontSize={theme.fontSize.m}
                numberOfLines={1}
                ellipsizeMode="tail">
                All
              </Text>
            </View>
          )}
          <View>
            <LazyImage
              imageUrl={sanImg}
              occupancy="#0000"
              width={theme.iconSize.xs}
              height={theme.iconSize.xs}
            />
          </View>
        </View>
      </NativeTouchableOpacity>
      <Picker
        ref={pickerRef}
        handleConfirm={handleConfirm}
        validRange={validRange}
      />
      {renderModal}
    </View>
  );
};

export default DateInlineFilter;
