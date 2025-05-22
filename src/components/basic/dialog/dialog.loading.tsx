import React from 'react';
import {Dialog} from '@rneui/themed';
import theme from '@style';

const DialogLoading = (props: {isVisible: boolean}) => {
  const isVisible = props.isVisible;
  return (
    <Dialog
      isVisible={isVisible}
      overlayStyle={{
        backgroundColor: theme.basicColor.transparent,
        shadowColor: theme.basicColor.transparent,
      }}>
      <Dialog.Loading />
    </Dialog>
  );
};
export default DialogLoading;
