import NavTitle from '@basicComponents/nav-title';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import theme from '@style';
import {goTo, toPriceStr, goToWithLogin} from '@/utils';
import Text from '@basicComponents/text';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {NavTitleProps} from '@basicComponents/nav-title/nav-title';
import WalletWeb from './wallet-web';
import Wallet from './wallet';
import {Subject, takeUntil} from 'rxjs';
import DownloadProgress from './progress';
import {useTranslation} from 'react-i18next';
import useCollectStore from '@/store/useCollectStore';
import {useShallow} from 'zustand/react/shallow';

/** 这个组件的leftNode会显示在客服按钮的右侧, rightNode会显示在钱包的左侧 */
const DetailNavTitle = (
  props: NavTitleProps & {
    hideServer?: boolean;
    showProgress?: boolean;
    showCollect?: boolean;
    showClean?: boolean;
    hideAmount?: boolean;
    rate?: number;
    serverRight?: boolean;
    onPressCollect?: () => void;
    onPressClean?: () => void;
  },
) => {
  const {
    title,
    rate = 0,
    hideServer,
    serverRight = false,
    showProgress = false,
    showCollect = false,
    showClean = false,
    hideAmount,
    leftNode,
    rightNode,
    onPressClean,
    ...otherProps
  } = props;
  const {i18n} = useTranslation();
  const [login, setLogin] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);
  const distory = new Subject<boolean>();
  const {collectStatus, changeGameCollectStatus} = useCollectStore(
    useShallow(state => ({
      collectStatus: state.collectStatus,
      changeGameCollectStatus: state.changeGameCollectStatus,
    })),
  );
  useEffect(() => {
    globalStore.tokenSubject.pipe(takeUntil(distory)).subscribe(token => {
      setLogin(!!token);
    });
    globalStore.amountChanged.pipe(takeUntil(distory)).subscribe(res => {
      setAmount(res.current);
    });
    return () => {
      distory.next(true);
      distory.complete();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // const renderService = (
  //   <NativeTouchableOpacity onPress={goCS}>
  //     <LazyImage
  //       occupancy={'transparent'}
  //       width={theme.iconSize.xl}
  //       height={theme.iconSize.xl}
  //       imageUrl={require('@components/assets/icons/me/mobile.webp')}
  //     />
  //   </NativeTouchableOpacity>
  // );
  return (
    <View style={[theme.fill.fillW, theme.flex.col, styles.zIndexTop]}>
      <NavTitle
        leftNode={
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            {!hideServer && !serverRight}
            {leftNode && (
              <View
                style={[hideServer || serverRight ? null : theme.margin.leftl]}>
                {leftNode}
              </View>
            )}
          </View>
        }
        rightNode={
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            {rightNode && (
              <View
                style={[
                  (hideAmount || !login) && !serverRight
                    ? null
                    : theme.margin.rightl,
                ]}>
                {rightNode}
              </View>
            )}
            {/*{serverRight && (*/}
            {/*  <View style={[hideAmount ? null : theme.margin.rightl]}>*/}
            {/*    {renderService}*/}
            {/*  </View>*/}
            {/*)}*/}
            {!hideAmount && (
              <View style={[theme.position.rel]}>
                <View
                  style={[
                    theme.flex.row,
                    theme.flex.centerByCol,
                    theme.position.abs,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      right: 28,
                      top: globalStore.isWeb ? 18 : 12,
                    },
                  ]}>
                  <View
                    style={[
                      theme.flex.col,
                      theme.flex.alignEnd,
                      theme.margin.rightxxs,
                      globalStore.isAndroid && {
                        width: 130,
                      },
                    ]}>
                    <Text
                      fontSize={theme.fontSize.s}
                      color={otherProps?.titleColor || theme.fontColor.white}>
                      Balance
                    </Text>
                    <Text
                      fontFamily="fontInter"
                      blod
                      size="medium"
                      // fontSize={theme.fontSize.s}
                      color={otherProps?.titleColor || theme.fontColor.white}>
                      {login ? toPriceStr(amount, {suffixUnit: 'K'}) : '-'}
                    </Text>
                  </View>
                </View>
                <NativeTouchableOpacity
                  onPress={() => {
                    globalStore.token
                      ? goToWithLogin('Deposit')
                      : goTo('Login');
                  }}>
                  {globalStore.isWeb ? (
                    <WalletWeb
                      style={[
                        {
                          marginTop: -theme.paddingSize.l,
                        },
                      ]}
                    />
                  ) : (
                    <Wallet
                      style={[
                        {
                          marginTop: -theme.paddingSize.l,
                        },
                      ]}
                    />
                  )}
                </NativeTouchableOpacity>
              </View>
            )}
            {showCollect && (
              <NativeTouchableOpacity
                style={[theme.icon.l]}
                onPress={changeGameCollectStatus}>
                <Image
                  style={theme.icon.l}
                  source={
                    collectStatus === 0
                      ? require('@assets/icons/common/no_collect.webp')
                      : require('@assets/icons/common/collect.webp')
                  }
                />
              </NativeTouchableOpacity>
            )}
            {showClean && (
              <NativeTouchableOpacity
                style={[theme.icon.l]}
                onPress={onPressClean}>
                <Image
                  style={theme.icon.l}
                  source={require('@assets/icons/common/clean.webp')}
                />
              </NativeTouchableOpacity>
            )}
          </View>
        }
        title={title || i18n.t('loading')}
        {...otherProps}
      />
      {showProgress && globalStore.isAndroid && rate > 0 && (
        <DownloadProgress rate={rate} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  zIndexTop: {
    zIndex: 999,
  },
});

export default DetailNavTitle;
