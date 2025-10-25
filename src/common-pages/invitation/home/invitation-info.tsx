import theme from '@/style';
import {View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import LazyImage from '@/components/basic/image';
import {
  invitationImcomeIcon,
  invitationPeopleIcon,
  invitationRecordIcon,
  invitationRulesIcon,
} from '../invitation.variables';
import React from 'react';
import {useTranslation} from 'react-i18next';
import Text from '@/components/basic/text';
import {toPriceStr} from '@/utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import Button from '@/components/basic/button';
import {UserTotal} from '../invitation.type';

export interface InvitationInfoProps {
  onRule?: () => void;
  onRecord?: () => void;
  onAgency?: () => void;
  userTotal?: UserTotal;
  agent: boolean;
  completeCount: number;
}

const InvitationInfo: React.FC<InvitationInfoProps> = ({
  onRule,
  onRecord,
  onAgency,
  agent,
  completeCount,
  userTotal,
}) => {
  const {homeStyle} = useInnerStyle();
  const {t} = useTranslation();
  return (
    <View
      style={[
        theme.flex.col,
        theme.padding.xxl,
        theme.borderRadius.l,
        theme.border.primary50,
        {backgroundColor: theme.basicColor.newBgInTwo},
      ]}>
      <View style={[theme.flex.col]}>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btml]}>
          <View
            style={[theme.flex.flex1, theme.flex.row, theme.flex.alignStart]}>
            <LazyImage
              imageUrl={invitationImcomeIcon}
              width={45}
              height={45}
              occupancy="#0000"
            />
            <View style={[theme.flex.flex1]}>
              <Text
                fontSize={12}
                color={theme.fontColor.white}
                style={[theme.margin.lefts]}>
                {t('invitation.home.income')}
              </Text>
              <Text
                fontSize={theme.fontSize.l1}
                blod
                white
                style={[theme.margin.lefts]}
                fontFamily="fontInter">
                {toPriceStr(userTotal?.bonusAmountTotal || 0, {
                  thousands: true,
                  fixed: 0,
                })}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: 1,
              height: 46,
              opacity: 0.44,
              backgroundColor: '#dc8e4a',
              marginHorizontal: 2,
            }}
          />
          <View
            style={[
              theme.flex.flex1,
              homeStyle.infoUpSubItemRight,
              theme.flex.row,
            ]}>
            <LazyImage
              imageUrl={invitationPeopleIcon}
              width={45}
              height={45}
              occupancy="#0000"
            />
            <View style={[theme.flex.flex1]}>
              <Text
                fontSize={12}
                color={theme.fontColor.white}
                style={[theme.margin.lefts]}>
                {t('invitation.home.count')}
              </Text>
              <Text
                fontSize={theme.fontSize.l1}
                white
                fontFamily="fontDin"
                style={[theme.margin.lefts, {fontWeight: 700}]}>
                {userTotal?.invitedNumberTotal || 0}
              </Text>
            </View>
          </View>
        </View>
        {!agent && completeCount >= 3 && (
          <View style={[theme.flex.col, theme.margin.topl]}>
            <Button radius={40} type="linear-primary" onPress={onAgency}>
              <View style={[theme.flex.col, theme.flex.center]}>
                <Text
                  color={theme.basicColor.white}
                  blod
                  fontSize={theme.fontSize.m}>
                  {t('invitation.home.join')}
                </Text>
                <Text
                  color={theme.basicColor.white}
                  fontSize={theme.fontSize.xs}>
                  {t('invitation.home.join-tip')}
                </Text>
              </View>
            </Button>
          </View>
        )}
      </View>

      <View style={[theme.flex.row, theme.flex.between]}>
        <NativeTouchableOpacity
          style={[
            theme.flex.row,
            theme.flex.flex1,
            theme.flex.center,
            theme.border.primary50,
            {
              height: 35,
              backgroundColor: '#450602',
              borderRadius: 6,
              marginRight: 8,
            },
          ]}
          onPress={onRecord}>
          <LazyImage
            imageUrl={invitationRecordIcon}
            width={18}
            height={18}
            occupancy="#0000"
          />
          <Text
            color={theme.fontColor.white}
            numberOfLines={1}
            style={{flexShrink: 1, marginLeft: 5}}>
            Invitation record
          </Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          style={[
            theme.flex.row,
            theme.flex.flex1,
            theme.flex.center,
            theme.border.primary50,
            {
              height: 35,
              backgroundColor: '#450602',
              borderRadius: 6,
            },
          ]}
          onPress={onRule}>
          <LazyImage
            imageUrl={invitationRulesIcon}
            width={18}
            height={18}
            occupancy="#0000"
          />
          <Text
            color={theme.fontColor.white}
            numberOfLines={1}
            style={{flexShrink: 1, marginLeft: 5}}>
            {t('invitation.home.activity-rules')}
          </Text>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default InvitationInfo;
