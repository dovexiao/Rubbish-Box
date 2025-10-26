import theme from '@/style';
import {View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
import {toPriceStr} from '@/utils';
import Button from '@/components/basic/button';
import {invitationColors} from '../invitation.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {InvitationModalShowOption} from '../invitation-record-modal';
import LinearGradient from '@/components/basic/linear-gradient';
export interface InvitationBounsProps {
  inviteTaskUserId?: number;
  bouns?: number;
  reward?: number;
  needInvites?: number;
  needRecharge?: number;
  invitedCount?: number;
  rechargedCount?: number;
  onGoComplete?: () => void;
  onShowRecord?: (options?: InvitationModalShowOption) => void;
}
const InvitationBouns: React.FC<InvitationBounsProps> = ({
  bouns = 1,
  reward = 0,
  invitedCount = 0,
  needInvites = 1,
  needRecharge = 500,
  rechargedCount = 0,
  inviteTaskUserId,
  onGoComplete,
  onShowRecord,
}) => {
  const {homeStyle} = useInnerStyle();
  const {t} = useTranslation();
  const completed = useMemo(() => {
    return rechargedCount >= needInvites && invitedCount >= needInvites;
  }, [needInvites, rechargedCount, invitedCount]);
  return (
    <View
      style={[
        theme.flex.col,
        theme.borderRadius.m,
        theme.margin.topl,
        {backgroundColor: theme.basicColor.newBgInTwo},
      ]}>
      <View
        style={[
          theme.flex.row,
          homeStyle.bounsTitle,
          theme.flex.centerByCol,
          theme.padding.lrl,
          theme.flex.between,
        ]}>
        <Text fontSize={theme.fontSize.l} blod white>
          {t('invitation.home.bouns')} {bouns}
        </Text>
        <Text fontSize={theme.fontSize.l} blod color={theme.fontColor.green}>
          {toPriceStr(reward, {fixed: 0, thousands: true})}
        </Text>
      </View>
      <View
        style={[
          theme.flex.col,
          theme.padding.lrl,
          theme.padding.topl,
          theme.padding.btmxs,
        ]}>
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.padding.lrl,
            homeStyle.bounsUpItem,
            theme.margin.btmxxs,
            theme.flex.centerByCol,
          ]}>
          <Text white>{t('invitation.home.invites')}</Text>
          <Text white blod>
            {needInvites}
          </Text>
        </View>
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.padding.lrl,
            homeStyle.bounsUpItem,
            theme.flex.centerByCol,
          ]}>
          <Text white>{t('invitation.home.recharges')}</Text>
          <Text color={theme.fontColor.white} blod>
            {toPriceStr(needRecharge, {fixed: 0, thousands: true})}
          </Text>
        </View>
      </View>
      <View
        style={[theme.padding.lrl, theme.padding.topxs, theme.padding.btml]}>
        <View
          style={[
            theme.padding.lrl,
            theme.margin.btml,
            theme.flex.row,
            theme.flex.between,
          ]}>
          <NativeTouchableOpacity
            style={[
              theme.flex.col,
              theme.flex.centerByCol,
              homeStyle.statisticItem,
            ]}
            onPress={() =>
              onShowRecord?.({
                bonus: bouns,
                inviteTaskUserId,
                type: 'invite',
              })
            }>
            <View style={[theme.flex.row]}>
              <Text
                fontSize={theme.fontSize.l}
                blod
                color={theme.fontColor.white}>
                {invitedCount}{' '}
              </Text>
              <Text fontSize={theme.fontSize.l} white blod>
                / {needInvites}
              </Text>
            </View>
            <Text white style={[theme.margin.topxxs]}>
              {t('invitation.home.invites')}
            </Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity
            style={[
              theme.flex.col,
              theme.flex.centerByCol,
              homeStyle.statisticItem,
            ]}
            onPress={() =>
              onShowRecord?.({
                bonus: bouns,
                inviteTaskUserId,
                type: 'recharge',
              })
            }>
            <View style={[theme.flex.row]}>
              <Text
                fontSize={theme.fontSize.l}
                blod
                color={theme.fontColor.white}>
                {rechargedCount}{' '}
              </Text>
              <Text fontSize={theme.fontSize.l} white blod>
                / {needInvites}
              </Text>
            </View>
            <Text white style={[theme.margin.topxxs]}>
              {t('invitation.home.deposit')}
            </Text>
          </NativeTouchableOpacity>
        </View>
        <LinearGradient
          colors={theme.basicColor.newButtonLinear}
          style={[{borderRadius: 30, overflow: 'hidden'}]}>
          <Button
            titleBold
            size="middle"
            disabled={completed}
            color={theme.basicColor.newTransparent}
            title={
              completed
                ? t('invitation.home.completed')
                : t('invitation.home.go-complete')
            }
            disabledStyle={[{backgroundColor: invitationColors.disabled}]}
            buttonStyle={[theme.fill.fillW, homeStyle.bonusButton]}
            onPress={onGoComplete}
          />
        </LinearGradient>
      </View>
    </View>
  );
};

export default InvitationBouns;
