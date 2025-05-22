import {View} from 'react-native';
import LazyImage from '@/components/basic/image';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import React, {useEffect} from 'react';
import theme from '@/style';
import i18n from '@/i18n';
import {useInnerStyle} from '../proxy.hooks';
import Text from '@basicComponents/text';
import {down} from '../proxy.variable';
import {
  FilterModalOption,
  useFilterModal,
} from '@/components/basic/filter-modal';

export interface TeamReportFilterProps {
  onGrade: (grade: number) => void;
  grade: number;
  date?: string;
  onDate?: (date: string) => void;
}

const gradeFilter: FilterModalOption[] = [
  {
    title: i18n.t('proxy.all'),
    value: '0',
  },
  {
    title: i18n.t('proxy.tier', {number: ' 1'}),
    value: '1',
  },
  {
    title: i18n.t('proxy.tier', {number: ' 2'}),
    value: '2',
  },
  {
    title: i18n.t('proxy.tier', {number: ' 3'}),
    value: '3',
  },
  {
    title: i18n.t('proxy.tier', {number: ' 4'}),
    value: '4',
  },
];

const ProxyTeamReportFilter: React.FC<TeamReportFilterProps> = ({
  onGrade,
  grade,
  date,
}) => {
  const {teamReportStyle} = useInnerStyle();

  const gradeTitle = gradeFilter.find(g => grade + '' === g.value)?.title;

  const {show, renderModal, currentValue} = useFilterModal(
    i18n.t('proxy.team.grade'),
    gradeFilter,
  );

  useEffect(() => {
    if (currentValue != null) {
      onGrade?.(+currentValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return (
    <View>
      <View
        style={[theme.padding.topl, theme.flex.col, theme.background.white]}>
        <View style={[theme.padding.l, theme.flex.row, theme.flex.between]}>
          <NativeTouchableOpacity onPress={() => show(grade + '')}>
            <View
              style={[
                theme.padding.lrs,
                theme.flex.row,
                theme.flex.between,
                teamReportStyle.filterItem,
                theme.flex.centerByCol,
                theme.borderRadius.xs,
              ]}>
              <Text fontSize={theme.fontSize.s} main>
                {i18n.t('proxy.team.grade')}: {gradeTitle}
              </Text>
              <LazyImage
                occupancy="#0000"
                imageUrl={down}
                width={theme.iconSize.xs}
                height={theme.iconSize.xs}
              />
            </View>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity>
            <View
              style={[
                theme.padding.lrs,
                theme.flex.row,
                theme.flex.between,
                teamReportStyle.filterItem,
                theme.flex.centerByCol,
                theme.borderRadius.xs,
              ]}>
              <View style={[theme.flex.row, theme.flex.centerByCol]}>
                <Text main fontSize={theme.fontSize.s}>
                  {i18n.t('proxy.team.date')}
                </Text>
                <Text
                  secAccent={!date}
                  main={!!date}
                  fontSize={theme.fontSize.s}
                  style={[theme.margin.leftxxs]}>
                  {date ? date : i18n.t('proxy.team.time')}
                </Text>
              </View>
              <LazyImage
                occupancy="#0000"
                imageUrl={down}
                width={theme.iconSize.xs}
                height={theme.iconSize.xs}
              />
            </View>
          </NativeTouchableOpacity>
        </View>
      </View>
      {renderModal}
    </View>
  );
};

export default ProxyTeamReportFilter;
