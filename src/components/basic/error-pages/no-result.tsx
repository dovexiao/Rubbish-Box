import React from 'react';
import ErrorPage, {ErrorPageProps} from './error-page';
import Text from '../text';
import {useTranslation} from 'react-i18next';

const NoResult = ({...otherProps}: Omit<ErrorPageProps, 'img'>) => {
  const {i18n} = useTranslation();
  return (
    <ErrorPage
      {...otherProps}
      img={require('@components/assets/imgs/no-result.webp')}>
      <Text accent size="medium">
        {i18n.t('error-pages.no-result.label.title')}
      </Text>
    </ErrorPage>
  );
};

export default NoResult;
