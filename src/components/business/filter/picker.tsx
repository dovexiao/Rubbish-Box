import React, {forwardRef, useImperativeHandle} from 'react';
import {View} from 'react-native';
import {DatePickerModal} from 'react-native-paper-dates';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import theme from '@/style';

const Picker = forwardRef((props: any, ref) => {
  const [range, setRange] = React.useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [open, setOpen] = React.useState(false);

  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);
  useImperativeHandle(ref, () => ({
    handleOpen: () => setOpen(true),
    range,
  }));
  const onConfirm = React.useCallback(
    ({startDate, endDate}: any) => {
      setOpen(false);
      setRange({startDate, endDate});
      props.handleConfirm({startDate, endDate});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setOpen, setRange],
  );

  return (
    <SafeAreaProvider>
      <View style={[theme.flex.flex1, theme.flex.center]}>
        <DatePickerModal
          locale="en"
          mode="range"
          visible={open}
          onDismiss={onDismiss}
          startDate={range.startDate}
          endDate={range.endDate}
          onConfirm={onConfirm}
          validRange={
            props.validRange ? props.validRange : {endDate: new Date()}
          }
        />
      </View>
    </SafeAreaProvider>
  );
});

export default Picker;
