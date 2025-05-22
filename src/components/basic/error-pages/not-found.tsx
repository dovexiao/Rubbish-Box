import React from 'react';
import ErrorPage, {ErrorPageProps} from './error-page';
import Text from '../text';
import theme from '@/style';
import {useTranslation} from 'react-i18next';

const NotFound = ({...otherProps}: Omit<ErrorPageProps, 'img'>) => {
  const {i18n} = useTranslation();
  return (
    <ErrorPage
      {...otherProps}
      img={require('@components/assets/imgs/404.webp')}>
      <Text white blod size="medium" style={[theme.padding.btml]}>
        {i18n.t('error-pages.not-found.label.title')}
      </Text>
      <Text white size="medium">
        {i18n.t('error-pages.not-found.label.sub-title')}
      </Text>
    </ErrorPage>
  );
};

export default NotFound;
