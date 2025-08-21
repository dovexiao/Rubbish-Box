import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {View, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import Text from '@/components/basic/text';
import LazyImage from '@/components/basic/image';
import React from 'react';
import LinearGradient from '@/components/basic/linear-gradient';
import {useTranslation} from 'react-i18next';
import ShareButton from './share-btn';
import {toPriceStr} from '@/utils';
const copyIcon = require('@components/assets/icons/bets/copy.webp');
export interface BetsCardType {
  status: 0 | 1 | 2;
  cover: string | number;
  tag?: string;
  title?: string;
  id?: string;
  time?: string;
  hasShare?: boolean;
  hasAward?: boolean;
  rightEle?: React.ReactElement | null;
  payment?: number;
  result?: number;
  reward?: number;
  canGoDetail?: boolean;
  content?: React.ReactElement | string;
  onShare?: () => void;
  onCopy?: () => void;
  goDetail?: () => void;
  style?: StyleProp<ViewStyle>;
}

const DATA_MAP = {
  1: {
    text: 'won',
    bg: theme.linearGradientColor.wonLinearGradient,
    color: theme.fontColor.wonFontColor,
  },
  0: {
    text: 'noWin',
    bg: theme.linearGradientColor.noWinLinearGradient,
    color: theme.fontColor.noWinFontColor,
  },
  2: {
    text: 'toBe',
    bg: theme.linearGradientColor.toDrawnLinearGradient,
    color: theme.fontColor.toDrawnFontColor,
  },
  3: {
    text: 'noWin',
    bg: theme.linearGradientColor.toDrawnLinearGradient,
    color: theme.fontColor.toDrawnFontColor,
  },
};

const BetsCard = (props: BetsCardType) => {
  const {
    status,
    id = '',
    onCopy,
    cover,
    title,
    tag,
    content = '',
    rightEle,
    payment = 0,
    time,
    reward = 0,
    canGoDetail = true,
    hasShare = false,
    onShare,
    style = {},
    hasAward = false,
    goDetail = () => {},
  } = props;
  const {i18n} = useTranslation();

  const Ele = canGoDetail ? NativeTouchableOpacity : View;

  return (
    <Ele
      onPress={goDetail}
      style={[
        theme.borderRadius.m,
        theme.padding.l,
        theme.margin.topl,
        style,
        {backgroundColor: theme.basicColor.newBgInOne},
      ]}>
      <LinearGradient
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          theme.borderRadius.l,
          theme.padding.lrl,
          theme.padding.tbs,
        ]}
        colors={DATA_MAP[status]?.bg || '#FFB728'}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <View style={[theme.flex.flex1]}>
          <Text numberOfLines={1} color={DATA_MAP[status]?.color}>
            {i18n.t(`bets-page.status.${DATA_MAP[status].text}`)}
          </Text>
        </View>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text color={theme.fontColor.white} style={[theme.margin.rights]}>
            {i18n.t('label.id')}
          </Text>
          <Text color={theme.fontColor.white}>{id}</Text>
          <NativeTouchableOpacity onPress={onCopy} style={[theme.margin.lefts]}>
            <LazyImage
              imageUrl={copyIcon}
              width={14}
              height={14}
              occupancy="transparent"
            />
          </NativeTouchableOpacity>
        </View>
      </LinearGradient>
      <View style={[theme.flex.row, theme.flex.centerByCol, theme.margin.topl]}>
        <View
          style={[
            theme.flex.row,
            theme.flex.flex1,
            theme.flex.centerByCol,
            theme.margin.rightxxl,
          ]}>
          <View style={styles.cover}>
            <LazyImage
              imageUrl={cover}
              width={48}
              height={48}
              occupancy="transparent"
            />
          </View>
          <View style={[theme.flex.flex1, theme.margin.leftl]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              {tag && (
                <View style={[styles.tag]}>
                  <Text
                    fontSize={10}
                    color={theme.basicColor.white}
                    fontFamily="fontDin">
                    {tag}
                  </Text>
                </View>
              )}
              <View style={[theme.flex.flex1]}>
                <Text
                  white
                  size="medium"
                  fontFamily="fontInterBold"
                  numberOfLines={1}>
                  {title}
                </Text>
              </View>
            </View>
            {React.isValidElement(content) ? (
              content
            ) : content ? (
              <Text white fontFamily="fontDin" style={[theme.margin.topxxs]}>
                {content}
              </Text>
            ) : null}
          </View>
        </View>
        {rightEle ? (
          rightEle
        ) : (
          <View style={[theme.flex.alignEnd]}>
            <Text color={theme.fontColor.white} style={[theme.margin.btmxxs]}>
              {i18n.t('label.payment')}
            </Text>
            <Text
              size="medium"
              color={theme.fontColor.green}
              fontFamily="fontInter"
              blod>
              {toPriceStr(payment, {fixed: 2})}
            </Text>

            {/* <Price textProps={{size: 'medium'}} price={payment} /> */}
          </View>
        )}
      </View>
      <View style={styles.line} />
      <View style={styles.item}>
        <Text color={theme.fontColor.white}>
          {i18n.t('bets-page.label.bettingTime')}
        </Text>
        <Text color={theme.fontColor.white}>{time}</Text>
      </View>
      <View style={styles.item}>
        <Text color={theme.fontColor.white}>
          {i18n.t('bets-page.label.result')}
        </Text>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          <Text white>
            {i18n
              .t(`bets-page.status.${DATA_MAP[status].text}`)
              .toLowerCase()
              .replace(/^\w/, (c: string) => c.toUpperCase())}
          </Text>
          {status !== 2 && (
            <Text
              fontFamily="fontInter"
              blod
              size="medium"
              color={theme.fontColor.green}>
              {' '}
              {toPriceStr(reward, {fixed: 2})}
            </Text>

            // <Price
            //   prefix=" "
            //   textProps={{size: 'medium', color: theme.basicColor.primary}}
            //   price={reward}
            // />
          )}
        </View>
      </View>
      {hasShare && (
        <View style={styles.item}>
          <Text color={theme.fontColor.accent}>
            {i18n.t('bets-page.label.share')}
          </Text>
          <ShareButton onShare={onShare} hasAward={hasAward} />
        </View>
      )}
    </Ele>
  );
};

const styles = StyleSheet.create({
  borderRadius: {
    borderRadius: 20,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tag: {
    // backgroundColor: '#EA1200',
    paddingVertical: 2,
    borderRadius: 2,
    paddingHorizontal: 3,
    marginRight: 4,
  },
  line: {
    height: 1,
    marginTop: 12,
    backgroundColor: theme.basicColor.primary10,
  },
  item: {
    marginTop: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: theme.backgroundColor.main,
  },
});

export default BetsCard;
