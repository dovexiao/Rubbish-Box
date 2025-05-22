import React, {
  ForwardRefRenderFunction,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {ScrollView, View} from 'react-native';
import theme from '@/style';
import Text from '@basicComponents/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {CloseIcon} from '../proxy/svg.variable';
import LazyImage from '@/components/basic/image';
import ErrorInvitePage from '../../common-pages/proxy/basic-components/error-user-page';

import {defaultHeaderImg} from './invitation.variables';
import Drawer, {DrawerRef} from '@/components/basic/drawer/drawer';
import {useTranslation} from 'react-i18next';
import {usePaging} from '../hooks/paging.hooks';
import {getTaskDetailList} from './invitation.service';
import Spin from '@/components/basic/spin';
import dayjs from 'dayjs';
import {overflow} from '@/components/style';
import {useInnerStyle} from './invitation.style.hooks';
const {background, flex, fontColor, fontSize, margin, padding} = theme;
const boxRadius = {
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
};

export type InvitationModalRecordType = 'recharge' | 'invite';

export interface InvitationModalShowOption {
  inviteTaskUserId?: number;
  bonus?: number;
  type?: InvitationModalRecordType;
}

export interface InvitationRecordModalRef {
  show: (options?: InvitationModalShowOption) => void;
}

export interface InvitationRecordModalProps {
  onShare?: () => void;
}

const InvitationRecordModal: ForwardRefRenderFunction<
  InvitationRecordModalRef,
  InvitationRecordModalProps
> = ({onShare}, ref) => {
  const drawerRef = useRef<DrawerRef>(null);
  const {recordModalStyle} = useInnerStyle();
  const [bonus, setBonus] = useState(1);
  const [inviteType, setInviteType] =
    useState<InvitationModalRecordType>('invite');
  const [inviteTaskUserId, setInviteTaskUserId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();
  const {init, reset, resultList, onScroll} = usePaging((pageNo, pageSize) => {
    return getTaskDetailList({
      pageNo,
      pageSize,
      inviteTaskUserId: inviteTaskUserId || 0,
      ...(inviteType === 'recharge'
        ? {
            status: 1,
          }
        : {}),
    });
  });

  useEffect(() => {
    if (!inviteTaskUserId) {
      return;
    }
    reset();
    setLoading(true);
    init().finally(() => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteTaskUserId, inviteType]);

  useImperativeHandle(
    ref,
    () => ({
      show: ({
        bonus: _bonus = 1,
        inviteTaskUserId: _taskId = 0,
        type: _type = 'invite',
      }: InvitationModalShowOption = {}) => {
        setBonus(_bonus || 1);
        setInviteTaskUserId(_taskId);
        setInviteType(_type);
        drawerRef.current?.open();
      },
      close: () => {
        drawerRef.current?.close();
      },
    }),

    [],
  );
  return (
    <Drawer ref={drawerRef} mode="bottom" contentBackgroundColor="#0000">
      <Spin
        loading={loading}
        style={[recordModalStyle.container, theme.background.white, boxRadius]}>
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            recordModalStyle.header,
            theme.padding.btml,
          ]}>
          <Text
            color={'#000'}
            fontWeight={'bold'}
            fontFamily={'fontInter'}
            fontSize={fontSize.m}>
            {t('invitation-record.bonus-detail', {bonus})}
          </Text>
          <NativeTouchableOpacity onPress={() => drawerRef.current?.close()}>
            <CloseIcon width={24} height={24} />
          </NativeTouchableOpacity>
        </View>
        <ScrollView
          style={[background.white, overflow.hidden, flex.col, flex.flex1]}
          onScroll={onScroll}>
          {resultList.length === 0 ? (
            <ErrorInvitePage
              style={[recordModalStyle.error]}
              content={t('invitation-record.noInvitedFriend')}
              buttonTitle={t('invitation-record.invite')}
              onClick={onShare}
            />
          ) : (
            resultList.map((item, index) => (
              <View
                style={[
                  margin.lrl,
                  flex.row,
                  flex.between,
                  flex.centerByCol,
                  recordModalStyle.item,
                ]}
                key={index}>
                <View style={[padding.lrl, padding.tbs]}>
                  <View style={[flex.row, flex.centerByCol]}>
                    <LazyImage
                      imageUrl={defaultHeaderImg}
                      occupancy="#0000"
                      width={24}
                      height={24}
                    />
                    <Text
                      style={[margin.s]}
                      fontSize={12}
                      color={fontColor.main}
                      fontWeight="bold">
                      {item.inviteUserPhone}
                    </Text>
                  </View>
                </View>
                <View style={padding.rightl}>
                  <Text fontSize={12} color={fontColor.main}>
                    {dayjs(item.createTime).format('DD-MM-YYYY HH:mm:ss')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        {resultList.length > 0 && (
          <View
            style={[
              theme.margin.topl,
              recordModalStyle.bottom,
              theme.background.white,
            ]}>
            <NativeTouchableOpacity
              style={[flex.center, recordModalStyle.button]}
              onPress={onShare}>
              <Text color={'#fff'} fontSize={16} fontWeight="bold">
                {t('invitation-record.invite')}
              </Text>
            </NativeTouchableOpacity>
          </View>
        )}
      </Spin>
    </Drawer>
  );
};

export default forwardRef(InvitationRecordModal);
