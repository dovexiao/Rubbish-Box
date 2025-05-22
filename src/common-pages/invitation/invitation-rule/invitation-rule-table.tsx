import theme from '@/style';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {defaultTableData} from '../invitation.variables';
import {useInnerStyle} from '../invitation.style.hooks';
import Text from '@/components/basic/text';
import {errorLog, toPriceStr} from '@/utils';
import {UserListItem} from '../invitation.type';
import globalStore from '@/services/global.state';

const InvitationRuleTable = () => {
  const {t} = useTranslation();
  const tableHeader = [
    t('invitation.rule.table.invite'),
    t('invitation.rule.table.deposit'),
    t('invitation.rule.table.bonus'),
  ];
  const [userList, setUserList] = useState<UserListItem[]>();
  useEffect(() => {
    globalStore.asyncGetItem('invitationBonusList').then(user => {
      try {
        user && setUserList(JSON.parse(user) as UserListItem[]);
      } catch (e) {
        errorLog('error', e);
      }
    });
  }, []);

  const tableData = useMemo(() => {
    if (!userList || !userList.length) {
      return defaultTableData.map(([invite, deposit, bonus]) => [
        `${invite} ${t('invitation.rule.table.people')}`,
        toPriceStr(deposit, {fixed: 0, thousands: true}),
        toPriceStr(bonus, {fixed: 0, thousands: true}),
      ]);
    }
    return userList.map(item => [
      `${item.inviteNumber} ${t('invitation.rule.table.people')}`,
      toPriceStr(item.depositAmount, {fixed: 0, thousands: true}),
      toPriceStr(item.bonusAmount, {fixed: 0, thousands: true}),
    ]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userList]);

  const {ruleStyle} = useInnerStyle();

  return (
    <View
      style={[
        theme.margin.btml,
        theme.flex.col,
        theme.borderRadius.m,
        theme.overflow.hidden,
        theme.background.mainDark,
      ]}>
      <View
        style={[
          theme.padding.l,
          {backgroundColor: theme.basicColor.primary},
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
        ]}>
        {tableHeader.map((item, index) => (
          <View
            key={index}
            style={[
              ruleStyle.tableItem,
              theme.flex.row,
              theme.flex.centerByCol,
              index === 0
                ? theme.flex.start
                : index === tableHeader.length - 1
                ? theme.flex.end
                : theme.flex.centerByRow,
            ]}>
            <Text color={theme.basicColor.white}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={[theme.flex.col]}>
        {tableData.map((itemCols, index) => (
          <View
            key={index}
            style={[
              ruleStyle.tableDataRow,
              theme.flex.row,
              theme.flex.between,
              theme.flex.centerByCol,
              theme.padding.lrl,

              {
                backgroundColor:
                  index % 2 === 0
                    ? theme.basicColor.primary50
                    : theme.basicColor.primary30,
              },
            ]}>
            {itemCols.map((col, colIndex) => (
              <View
                key={colIndex}
                style={[
                  ruleStyle.tableItem,
                  theme.flex.row,
                  theme.flex.centerByCol,
                  colIndex === 0
                    ? theme.flex.start
                    : colIndex === tableHeader.length - 1
                    ? theme.flex.end
                    : theme.flex.centerByRow,
                ]}>
                <Text size="medium" white blod>
                  {col}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default InvitationRuleTable;
