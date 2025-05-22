import React from 'react';
import ErrorPage, {ErrorPageProps} from './error-page';
import Text from '../text';
import {useTranslation} from 'react-i18next';
import theme from '@/style';

const NoData = ({...otherProps}: Omit<ErrorPageProps, 'img'>) => {
  const {i18n} = useTranslation();
  return (
    <ErrorPage
      {...otherProps}
      style={[theme.borderRadius.l]}
      img={require('@components/assets/imgs/empty.webp')}
      imgStyle={{marginTop: 100}}>
      <Text white size="medium">
        {i18n.t('error-pages.no-data.label.title')}
      </Text>
    </ErrorPage>
  );
};

export default NoData;
