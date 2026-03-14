import AppIcon from '@/components/AppIcon';
import React, { RefObject } from 'react';
import { View, Text } from 'react-native';
import dayjs from 'dayjs';
import Flex from '@/components/Flex';
import { DAY_OF_WEEK, INVITE_STATUS } from '@/constants';
import { styles } from '../recordStyle';
import { DetailsProp } from '../type';

export const WeChatCoverImage = ({
  shareContentRef,
  details,
  style,
}: {
  shareContentRef: RefObject<any>;
  details: DetailsProp;
  style: any;
}) => {
  return (
    <View
      ref={shareContentRef}
      style={{
        width: 425,
        height: 339,
        backgroundColor: '#f7f7fb',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      <View style={styles.contentBoxShare}>
        <Flex
          direction={'row'}
          justify={'between'}
          style={[{ width: '100%' }, styles.pl48, styles.pr32]}
        >
          <Text style={styles.rowText1}>尊敬的贵宾</Text>
          <Text
            style={
              details?.status === 1
                ? [styles.tagBox, styles.color1]
                : details?.status === 2
                ? [styles.tagBox, styles.color2]
                : details?.status === 10
                ? [styles.tagBox, styles.color10]
                : [styles.tagBox, styles.color20]
            }
          >
            {INVITE_STATUS[details?.status as keyof typeof INVITE_STATUS]}
          </Text>
        </Flex>
        <Text style={styles.inviteCode}>{details?.code}</Text>
        <Text style={styles.popTime}>使用时间:</Text>
        <Flex
          direction="row"
          justify={'between'}
          align="center"
          style={styles.timeBox}
        >
          <Flex direction="column" justify="between" style={{ marginLeft: 10 }}>
            <Flex direction="row" align="center">
              <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                {`${dayjs(details?.startTime).format('MM')}月${dayjs(
                  details?.startTime,
                ).format('DD')}日`}
              </Text>
              <Text style={[styles.dateText, styles.mb8]}>
                {
                  DAY_OF_WEEK[
                    dayjs(details?.startTime).day() as keyof typeof DAY_OF_WEEK
                  ]
                }
              </Text>
            </Flex>
            <Text style={styles.dateTime}>{`${dayjs(details?.startTime).format(
              'HH',
            )}：${dayjs(details?.startTime).format('mm')}`}</Text>
          </Flex>
          <AppIcon name={'arrows1'} size={40} color="#333333"></AppIcon>
          <Flex direction="column" justify="between" style={{ marginLeft: 10 }}>
            <Flex direction="row" align="center">
              <Text style={[styles.dateText, styles.mr12, styles.mb8]}>
                {`${dayjs(details?.endTime).format('MM')}月${dayjs(
                  details?.endTime,
                ).format('DD')}日`}
              </Text>
              <Text style={[styles.dateText, styles.mb8]}>
                {
                  DAY_OF_WEEK[
                    dayjs(details?.endTime).day() as keyof typeof DAY_OF_WEEK
                  ]
                }
              </Text>
            </Flex>
            <Text style={styles.dateTime}>{`${dayjs(details?.endTime).format(
              'HH',
            )}：${dayjs(details?.endTime).format('mm')}`}</Text>
          </Flex>
        </Flex>
        <Flex direction="row" justify="center" align="center">
          <Text style={styles.dateText}>使用次数：</Text>
          <Text style={styles.dateText}>
            {details?.noLimit ? '不限' : details?.limitTime}
          </Text>
        </Flex>
      </View>
    </View>
  );
};
