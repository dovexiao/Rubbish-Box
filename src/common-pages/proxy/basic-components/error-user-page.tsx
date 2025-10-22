import ErrorPage, {
  ErrorPageProps,
} from '@/components/basic/error-pages/error-page';
import {useInnerStyle} from '../proxy.hooks';
import React from 'react';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import theme from '@/style';

export interface ErrorInvitePageProps extends Omit<ErrorPageProps, 'img'> {
  content: string;
  buttonTitle?: string;
  onClick?: () => void;
}

const ErrorInvitePage: React.FC<ErrorInvitePageProps> = ({
  content,
  buttonTitle,
  onClick,
  ...otherProps
}) => {
  const {
    size: {screenWidth, designWidth},
  } = useInnerStyle();
  return (
    <ErrorPage
      img={require('@components/assets/imgs/empty.webp')}
      {...otherProps}>
      <Text white size="medium" style={[theme.font.center, theme.margin.btml]}>
        {content}
      </Text>
      {/*{buttonTitle && (*/}
      {/*  <Button*/}
      {/*    type="linear-primary"*/}
      {/*    size="large"*/}
      {/*    titleBold*/}
      {/*    width={(174 * screenWidth) / designWidth}*/}
      {/*    buttonStyle={{width: (174 * screenWidth) / designWidth}}*/}
      {/*    title={buttonTitle}*/}
      {/*    onPress={onClick}*/}
      {/*  />*/}
      {/*)}*/}
    </ErrorPage>
  );
};

export default ErrorInvitePage;
