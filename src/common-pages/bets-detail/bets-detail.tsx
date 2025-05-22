import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View, ScrollView} from 'react-native';
import {BetsListItem} from '../bets';
import {BasicObject} from '@/types';
import globalStore from '@/services/global.state';
import Clipboard from '@react-native-clipboard/clipboard';
import TableTitle from './components/table-title';
import KeralaTable from './components/kerala/table';
import DiceResult from './components/dice/dice-result';
import DiceTable from './components/dice/table';
import ScratchTable from './components/scratch/table';
import SattaTable from './components/satta/table';
import DigitTable from './components/digit/table';
import DigitResult from './components/digit/digit-result';
import ColorTable from './components/color/table';
import ColorResult from './components/color/color-result';
import KeralaResult from './components/kerala/kerala-result';
import SataResult from './components/satta/satta-result';
// import Drawer from '@/components/basic/drawer';
// import SharePanel from '@/components/business/share-panel/share-panel';
import {DrawerRef} from '@/components/basic/drawer/drawer';
// import {shareToChat, shareToThird} from '../bets/bets.service';
import Spin from '@/components/basic/spin';
// import Text from '@/components/basic/text';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@/components/basic/image';
const BetsDetail = () => {
  const {info, game} = useRoute().params as BasicObject;
  const [currentInfo] = React.useState<BasicObject>(
    info ? JSON.parse(info) : {},
  );
  // const [loading, setLoading] = React.useState(false);
  const {i18n} = useTranslation();

  const panelRef = React.useRef<DrawerRef>(null);
  const onCopy = (id: string) => {
    Clipboard.setString(id);
    globalStore.globalSucessTotal(i18n.t('copy-success'));
  };

  const Result = React.useMemo(() => {
    switch (game) {
      case 'Kerala':
        return currentInfo.bonusStatus === 0 ? (
          <KeralaResult info={currentInfo} />
        ) : null;
      case 'Dice':
        return currentInfo.openStatus === 2 ? (
          <DiceResult info={currentInfo} />
        ) : null;
      case '3 Digit':
        return currentInfo.wonCode ? <DigitResult info={currentInfo} /> : null;
      case 'Color':
        return currentInfo.openStatus === 2 ? (
          <ColorResult info={currentInfo} />
        ) : null;
      case 'Satta Matka':
        return 1 ? <SataResult info={currentInfo} /> : null;
      default:
        return null;
    }
  }, [game, currentInfo]);

  const Table = React.useMemo(() => {
    switch (game) {
      case 'Kerala':
        return <KeralaTable list={currentInfo.userWonList} />;
      case '3 Digit':
        return <DigitTable list={currentInfo.codeLists} />;
      case 'Color':
        return <ColorTable list={currentInfo.subsetList} />;
      case 'Dice':
        return <DiceTable list={currentInfo.typeList} />;
      case 'Satta Matka':
        return <SattaTable list={currentInfo.userDigits} />;
      case 'Scratch off':
        return (
          <ScratchTable
            list={currentInfo.orderList}
            payment={currentInfo.orderPrice}
          />
        );
      default:
        return null;
    }
  }, [game, currentInfo]);

  const status = React.useMemo(() => {
    const {shareGameDto = {}} = currentInfo || {};
    const {gameCode} = shareGameDto;
    if (gameCode === 'kerala') {
      // Kerala
      if (currentInfo.bonusStatus === 0) {
        return currentInfo.wonAmount > 0 ? 1 : 0;
      }
      return currentInfo.bonusStatus;
    }
    if (gameCode === 'pick3') {
      // 3 Digit
      if (currentInfo.wonCode) {
        // 已开奖
        return currentInfo.winAmount > 0 ? 1 : 0;
      }
      return 2;
    }
    if (gameCode === 'color') {
      // color
      if (currentInfo.openStatus === 1) {
        // 未开奖
        return 2;
      } else {
        return currentInfo.awardAmount > 0 ? 1 : 0;
      }
    }
    if (gameCode === 'matka') {
      if (currentInfo.openStatus === 1) {
        return 2;
      }
      return currentInfo.wonAmount > 0 ? 1 : 0;
    }
    if (gameCode === 'dice') {
      // dice
      if (currentInfo.openStatus === 1) {
        // 未开奖
        return 2;
      } else {
        return currentInfo.totalAwardAmount > 0 ? 1 : 0;
      }
    }
    if (
      currentInfo.orderStatus !== undefined &&
      currentInfo.openStatus !== undefined
    ) {
      // 1=中奖 0=未中奖 2=未使用
      // scratch
      if (currentInfo.openStatus === 2) {
        // 未开奖
        return 2;
      }
      return currentInfo.orderStatus;
    }
    return currentInfo.orderStatus;
  }, [currentInfo]);

  const hasShare = React.useMemo(() => {
    return false;
    // if (currentInfo?.shareGameDto?.gameCode === 'kerala') {
    //   return status === 1;
    // }
    // if (currentInfo?.shareGameDto === undefined) {
    //   return false;
    // }
    // return status === 1 || status === 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInfo, status]);

  // const shareToIM = () => {
  //   let data = {};
  //   setLoading(true);
  //   switch (game) {
  //     case 'Kerala':
  //     case '3 Digit':
  //     case 'Satta Matka':
  //       data = {
  //         gameCode: currentInfo?.shareGameDto?.gameCode,
  //         yearMonth: currentInfo?.shareGameDto?.yearMonth,
  //         orderGroup: currentInfo?.shareGameDto?.orderGroup,
  //       };
  //       break;
  //     case 'Color':
  //     case 'Dice':
  //       data = {
  //         gameCode: currentInfo?.shareGameDto?.gameCode,
  //         issNo: currentInfo?.shareGameDto?.issNo,
  //       };
  //       break;
  //     case 'Scratch off':
  //       data = {
  //         gameCode: currentInfo?.shareGameDto?.gameCode,
  //         startTime: currentInfo?.shareGameDto?.startTime,
  //         orderNo: currentInfo?.shareGameDto?.orderNo,
  //       };
  //       break;
  //   }
  //   shareToChat(data).then(() => {
  //     setLoading(false);
  //     if (currentInfo?.shareAward) {
  //       onRefresh && onRefresh();
  //       setCurrentInfo(
  //         Object.assign({}, currentInfo, {
  //           shareAward: 0,
  //         }),
  //       );
  //     }
  //     globalStore.globalSucessTotal(
  //       i18n.t('bets-share.label.shareSuccess'),
  //       currentInfo?.shareAward ? (
  //         <View style={[theme.margin.tops]}>
  //           <Text
  //             color={theme.basicColor.white}
  //             size="medium"
  //             textAlign="center">
  //             {i18n.t('bets-share.label.receiving')}
  //           </Text>
  //           <Text
  //             textAlign="center"
  //             size="medium"
  //             color={theme.basicColor.white}>
  //             <Text
  //               fontFamily="fontInterBold"
  //               color={theme.backgroundColor.second}
  //               size="medium">
  //               {toPriceStr(1, {
  //                 fixed: 0,
  //                 showCurrency: true,
  //               })}
  //             </Text>{' '}
  //             {i18n.t('bets-share.label.reward')}
  //           </Text>
  //         </View>
  //       ) : (
  //         ''
  //       ),
  //     );
  //   });
  // };

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideAmount
        hideServer
        title={i18n.t('bets-detail.label.orderDetail')}
      />
      <Spin loading={false} style={theme.flex.flex1}>
        <ScrollView stickyHeaderIndices={[Result ? 2 : 1]}>
          <BetsListItem
            style={[theme.margin.l]}
            info={currentInfo}
            hideShare
            canGoDetail={false}
            onCopy={onCopy}
          />
          {Result}
          <View style={[]}>
            <TableTitle
              hasShare={hasShare}
              onShare={() => panelRef.current?.open()}
            />
            <View
              style={[
                theme.margin.lrl,
                theme.margin.btml,
                theme.borderRadius.m,
                theme.overflow.hidden,
                theme.background.mainDark,
              ]}>
              {Table}
            </View>
          </View>
        </ScrollView>
      </Spin>
      {/* <Drawer mode="bottom" ref={panelRef} contentBackgroundColor="transparent">
        <SharePanel
          hasReward={Boolean(currentInfo.shareAward)}
          onClose={() => panelRef.current?.close()}
          onItemPress={pt => {
            panelRef.current?.close();
            shareToThird(pt, currentInfo, shareToIM);
          }}
        />
      </Drawer> */}
    </LazyImageLGBackground>
  );
};

// const styles = StyleSheet.create({
//   detailContainer: {
//     borderRadius: 0,
//     marginTop: 0,
//     marginBottom: 12,
//   },
// });

export default BetsDetail;
