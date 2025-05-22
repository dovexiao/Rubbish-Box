import {View} from 'react-native';
import SortFilter, {SortType} from '@/components/business/filter/sort-filter';
import theme from '@/style';
import i18n from '@/i18n';
import React from 'react';
import DateInlineFilter from '@/components/business/filter/date-inline-filter';

export interface CommissionDetailUserFilterProps {
  commissionSort: SortType;
  dateRange?: string[] | null;
  onCommissionSortChange: (sort: SortType) => void;
  onDateRangeChange: (dateRange?: string[] | null) => void;
}

const CommissionDetailUserFilter: React.FC<CommissionDetailUserFilterProps> = ({
  commissionSort,
  dateRange,
  onCommissionSortChange,
  onDateRangeChange,
}) => {
  return (
    <View style={[theme.flex.row, theme.flex.between]}>
      <SortFilter
        style={[theme.background.background, theme.borderRadius.xs]}
        title={i18n.t('proxy.filter.commission')}
        required
        sort={commissionSort}
        onSortChange={onCommissionSortChange}
      />
      <DateInlineFilter
        dateRange={dateRange}
        requiredInit={false}
        onDateRangeChanged={onDateRangeChange}
      />
    </View>
  );
};

export default CommissionDetailUserFilter;
