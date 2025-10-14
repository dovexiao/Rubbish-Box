import theme from '@/style';
import {View} from 'react-native';
import {useInnerStyle} from '../invitation.style.hooks';
import LazyImage from '@/components/basic/image';
import {
  invitationImcomeIcon,
  invitationPeopleIcon,
  invitationRecordIcon,
  invitationRulesIcon,
  rightIcon,
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
        theme.background.newFirst1,
        theme.borderRadius.l,
      ]}>
      <View style={[theme.flex.col, homeStyle.infoUpItem]}>
        <View
          style={[theme.flex.row, theme.flex.centerByCol, theme.margin.btml]}>
          <View
            style={[theme.flex.flex1, theme.flex.row, theme.flex.alignStart]}>
            <LazyImage
              imageUrl={invitationImcomeIcon}
              width={33}
              height={33}
              occupancy="#0000"
            />
            <View style={[theme.flex.flex1]}>
              <Text color={theme.fontColor.white} style={[theme.margin.lefts]}>
                {t('invitation.home.income')}
              </Text>
              <Text
                fontSize={theme.fontSize.xl}
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
              height: 32,
              backgroundColor: theme.basicColor.border,
            }}
          />
          <View
            style={[
              theme.flex.flex1,
              homeStyle.infoUpSubItemRight,
              theme.flex.row,
              theme.padding.leftl,
            ]}>
            <LazyImage
              imageUrl={invitationPeopleIcon}
              width={33}
              height={33}
              occupancy="#0000"
            />
            <View style={[theme.flex.flex1]}>
              <Text color={theme.fontColor.white} style={[theme.margin.lefts]}>
                {t('invitation.home.count')}
              </Text>
              <Text
                fontSize={theme.fontSize.xl}
                white
                blod
                fontFamily="fontDin"
                style={[theme.margin.lefts]}>
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

      <View style={[theme.flex.row, theme.flex.between, theme.margin.topl]}>
        <NativeTouchableOpacity
          style={[theme.flex.row, theme.flex.flex1, theme.flex.centerByCol]}
          onPress={onRecord}>
          <LazyImage
            imageUrl={invitationRecordIcon}
            width={33}
            height={33}
            occupancy="#0000"
          />
          <Text
            color={theme.fontColor.white}
            style={[theme.margin.lrs, homeStyle.infoBottomText]}>
            {t('invitation.home.record')}
          </Text>
          <LazyImage
            imageUrl={rightIcon}
            width={14}
            height={14}
            occupancy="#0000"
          />
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          style={[
            theme.flex.row,
            theme.flex.flex1,
            theme.flex.centerByCol,
            theme.padding.leftl,
          ]}
          onPress={onRule}>
          <LazyImage
            imageUrl={invitationRulesIcon}
            width={33}
            height={33}
            occupancy="#0000"
          />
          <Text
            color={theme.fontColor.white}
            style={[theme.margin.lrs, homeStyle.infoBottomText]}>
            {t('invitation.home.reward-rules')}
          </Text>
          <LazyImage
            imageUrl={rightIcon}
            width={14}
            height={14}
            occupancy="#0000"
          />
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default InvitationInfo;
