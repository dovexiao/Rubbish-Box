import Text from '@basicComponents/text';
import LazyImage, {ImageUrlType} from '@basicComponents/image';
import {ModalOptions, useModal} from '@basicComponents/modal';
import theme from '@style';
import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {designToDp} from '@components/utils';

const {borderRadiusSize, font, margin, padding} = theme;

export interface CardModalOptions {
  icon?: ImageUrlType;
  title: string;
  content: string;
}

const titleIconSize = 16;
export function useCardModal(options: ModalOptions = {backDropClose: true}) {
  const {...modalOptions} = options;
  const [cardInfo, setCardInfo] = useState<CardModalOptions>({
    title: '',
    content: '',
  });
  const {title, icon, content} = cardInfo;

  const {renderModal, show} = useModal(
    <View style={[styles.card, padding.l, theme.flex.col]}>
      <View style={[theme.flex.centerByCol, theme.flex.row]}>
        {icon && (
          <LazyImage
            occupancy={'transparent'}
            imageUrl={icon}
            width={titleIconSize}
            height={titleIconSize}
          />
        )}
        <Text style={[margin.lefts, font.l, font.main]}>{title}</Text>
      </View>
      <Text style={[font.accent, font.m, font.main, margin.topl, font.accent]}>
        {content}
      </Text>
    </View>,
    {...modalOptions, overlayStyle: {borderRadius: borderRadiusSize.m}},
  );
  const handleShow = useCallback(
    (showOptions: CardModalOptions) => {
      setCardInfo(showOptions);
      show();
    },
    [show],
  );
  return {renderModal, show: handleShow};
}

const styles = StyleSheet.create({
  card: {
    width: designToDp(304),
  },
});
