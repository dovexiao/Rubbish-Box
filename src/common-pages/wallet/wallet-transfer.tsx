import theme from '@/style';
import React, {useState, useEffect, useRef} from 'react';
import {View} from 'react-native';
// import AnimatedCircle from './components/animated-circle';
import Text from '@basicComponents/text';
import {useInnerStyle} from './wallet.hooks';
import {goTo} from '@/utils';
// import Button from '@basicComponents/button';
// import {Shadow} from 'react-native-shadow-2';
// import LinearGradient from '@basicComponents/linear-gradient';
import LazyImage from '@/components/basic/image';
import {
  rechargeIcon,
  // transformIcon,
  withdrawIcon,
  transferIcon,
} from './wallet.variable';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
// import {doTransferWallet} from './wallet.service';
import {useTranslation} from 'react-i18next';
import {toLogin} from '@/pages/me/me.variable';
export interface WalletTransferProps {
  login: boolean;
  mainAmount: number;
  thirdAmount: number;
  onRecharge?: () => void;
  onRefreshTransfer?: (loading?: boolean) => void;
}

type WalletStatus = 'not-need' | 'need' | 'doing' | 'completed';

const WalletTransfer: React.FC<WalletTransferProps> = ({
  login,
  // mainAmount,
  thirdAmount,
  onRecharge,
  // onRefreshTransfer,
}) => {
  const {i18n} = useTranslation();
  const [status, setStatus] = useState<WalletStatus>('not-need');
  // const disabled = useMemo(() => status !== 'need', [status]);
  const transferTimeRef = useRef(5);
  const [transferTime, setTransferTime] = useState(5);
  // const walletInfo = useMemo(() => {
  //   const all = Math.max(mainAmount + thirdAmount, 0);
  //   return {
  //     mainAmount: Math.max(mainAmount, 0),
  //     mainProgress: all === 0 ? 0 : (mainAmount / all) * 100,
  //     thirdAmount: Math.max(thirdAmount, 0),
  //     thirdProgress: all === 0 ? 0 : (thirdAmount / all) * 100,
  //   };
  // }, [mainAmount, thirdAmount]);

  useEffect(() => {
    if (status === 'doing' && transferTime > 0) {
      return;
    }
    if (status !== 'need' && thirdAmount > 0) {
      setStatus('need');
    }
    if (status !== 'not-need' && thirdAmount <= 0) {
      setStatus('completed');
    }
  }, [status, thirdAmount, transferTime]);

  React.useEffect(() => {
    const timer = setInterval(function () {
      if (status && transferTimeRef.current >= 0) {
        setTransferTime(transferTimeRef.current);
        transferTimeRef.current--;
      } else {
        clearInterval(timer);
        transferTimeRef.current = 5;
      }
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    };
  }, [status]);

  // const doTransfer = () => {
  //   doTransferWallet().then(() => {
  //     onRefreshTransfer?.(false);
  //   });
  //   setStatus('doing');
  // };

  const {
    transferStyle,
    // transferButtonShadow,
    size: {rechargeIconSize},
  } = useInnerStyle();

  // const renderAnimatedCircle = (
  //   title: string,
  //   progress: number,
  //   money: number,
  //   fillColor?: string,
  // ) => {
  //   return (
  //     <View style={[theme.flex.flex1, theme.flex.center]}>
  //       <AnimatedCircle
  //         fillColor={fillColor}
  //         style={[theme.flex.centerByCol, theme.flex.col]}
  //         progress={progress}>
  //         <View
  //           style={[
  //             theme.flex.row,
  //             theme.flex.alignEnd,
  //             transferStyle.circleTopView,
  //           ]}>
  //           <Text
  //             color={
  //               progress > 0
  //                 ? theme.basicColor.primary
  //                 : theme.fontColor.secAccent
  //             }
  //             fontSize={theme.fontSize.xl}
  //             fontFamily="fontDin"
  //             blod>
  //             {progress}
  //           </Text>
  //           <Text
  //             color={
  //               progress > 0
  //                 ? theme.basicColor.primary
  //                 : theme.fontColor.secAccent
  //             }
  //             fontSize={theme.fontSize.s}
  //             fontFamily="fontDin"
  //             style={[transferStyle.percent, theme.margin.topl]}
  //             blod>
  //             %
  //           </Text>
  //         </View>
  //         <Text
  //           fontFamily="fontDin"
  //           blod
  //           fontSize={theme.fontSize.l}
  //           main
  //           style={[theme.margin.topxxs]}>
  //           {toPriceStr(money, {
  //             fixed: 2,
  //             spacing: true,
  //             thousands: true,
  //           })}
  //         </Text>
  //         <Text
  //           fontSize={theme.fontSize.xs}
  //           second
  //           style={[theme.margin.topxxs]}>
  //           {title}
  //         </Text>
  //       </AnimatedCircle>
  //     </View>
  //   );
  // };

  const toWithdraw = () => {
    if (!login) {
      goTo('Login');
      return;
    }
    // 跳转withdraw
    goTo('Withdraw');
  };

  const toTransfer = () => {
    // 跳转transfer
    if (!login) {
      toLogin();
      return;
    }
    goTo('Transfer');
  };

  // const buttonContent = (
  //   <>
  //     <LazyImage
  //       imageUrl={transformIcon}
  //       occupancy="#0000"
  //       width={theme.iconSize.m}
  //       height={theme.iconSize.m}
  //     />
  //     <Text
  //       fontSize={theme.fontSize.l}
  //       blod
  //       color={theme.basicColor.white}
  //       style={[theme.margin.leftm]}>
  //       {status === 'not-need' || status === 'need'
  //         ? i18n.t('wallet.transfer')
  //         : status === 'doing'
  //         ? i18n.t('wallet.translation', {second: transferTime})
  //         : i18n.t('wallet.transComplete')}
  //     </Text>
  //   </>
  // );
  return (
    <View
      style={[
        transferStyle.container,
        // theme.padding.btml,
        // theme.padding.topxl,
      ]}>
      {/* <View
        style={[
          theme.background.white,
          theme.borderRadius.m,
          theme.padding.tbl,
        ]}>
        <View style={[theme.flex.row]}>
          {renderAnimatedCircle(
            i18n.t('wallet.main'),
            walletInfo.mainProgress,
            walletInfo.mainAmount,
            walletInfo.mainProgress >= 100 ? undefined : theme.basicColor.white,
          )}
          {renderAnimatedCircle(
            i18n.t('wallet.third'),
            walletInfo.thirdProgress,
            walletInfo.thirdAmount,
            walletInfo.thirdProgress <= 0 ? theme.basicColor.white : undefined,
          )}
        </View>
        <View style={[theme.margin.tbm, theme.flex.center]}>
          <Button
            buttonStyle={[transferStyle.button, theme.overflow.hidden]}
            width={transferButtonWidth}
            disabledStyle={[theme.background.grey]}
            disabled={disabled}
            onPress={doTransfer}>
            {disabled ? (
              buttonContent
            ) : (
              <Shadow {...transferButtonShadow}>
                <LinearGradient
                  style={[theme.fill.fill, theme.flex.center, theme.flex.row]}
                  colors={[theme.backgroundColor.main, '#AD0000']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}>
                  {buttonContent}
                </LinearGradient>
              </Shadow>
            )}
          </Button>
        </View>
      </View> */}

      <View
        style={[
          theme.flex.row,
          theme.flex.around,
          theme.background.white,
          theme.borderRadius.m,
          theme.margin.topl,
          theme.padding.tbxxl,
        ]}>
        <NativeTouchableOpacity
          style={[theme.flex.center, transferStyle.bottomNavItem]}
          onPress={onRecharge}>
          <View style={[theme.flex.center]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={rechargeIcon}
              width={rechargeIconSize}
              height={rechargeIconSize}
            />
            <Text style={[theme.font.s, theme.font.second, theme.margin.tops]}>
              {i18n.t('wallet.transferNav.recharge')}
            </Text>
          </View>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          style={[theme.flex.center, transferStyle.bottomNavItem]}
          onPress={toWithdraw}>
          <View style={[theme.flex.center]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={withdrawIcon}
              width={rechargeIconSize}
              height={rechargeIconSize}
            />
            <Text style={[theme.font.s, theme.font.second, theme.margin.tops]}>
              {i18n.t('wallet.transferNav.withdraw')}
            </Text>
          </View>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          style={[theme.flex.center, transferStyle.bottomNavItem]}
          onPress={toTransfer}>
          <View style={[theme.flex.center]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={transferIcon}
              width={rechargeIconSize}
              height={rechargeIconSize}
            />
            <Text style={[theme.font.s, theme.font.second, theme.margin.tops]}>
              {i18n.t('wallet.transferNav.transfer')}
            </Text>
          </View>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default WalletTransfer;
