import React from 'react';
import ErrorPage, {ErrorPageProps} from './error-page';
import Text from '../text';
import theme from '@/style';
import Button from '../button';
import {useTranslation} from 'react-i18next';

const Refresh = ({
  onTryAgain,
  ...otherProps
}: Omit<ErrorPageProps, 'img'> & {
  onTryAgain: () => void;
}) => {
  const {i18n} = useTranslation();
  return (
    <ErrorPage
      {...otherProps}
      img={require('@components/assets/imgs/refresh.webp')}>
      <Text main blod size="medium">
        {i18n.t('error-pages.refresh.label.title')}
      </Text>
      <Text
        accent
        size="medium"
        style={[theme.margin.topl, {marginBottom: theme.paddingSize.l * 2}]}>
        {i18n.t('error-pages.refresh.label.sub-title')}
      </Text>
      <Button
        onPress={onTryAgain}
        title={i18n.t('error-pages.refresh.label.try-again')}
        titleBold
        radius={8}
      />
    </ErrorPage>
  );
};

export default Refresh;
