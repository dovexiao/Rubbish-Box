import React from 'react';
import {Dialog} from '@rneui/themed';
import theme from '@style';

const DialogLoading = (props: {isVisible: boolean}) => {
  const isVisible = props.isVisible;
  return (
    <Dialog
      isVisible={isVisible}
      overlayStyle={{
        backgroundColor: theme.basicColor.transparentP10,
        shadowColor: theme.basicColor.transparentP10,
      }}>
      <Dialog.Loading />
    </Dialog>
  );
};
export default DialogLoading;
