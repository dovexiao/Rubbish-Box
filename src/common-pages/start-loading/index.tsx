import React from 'react';
import {Dialog} from '@rneui/themed';
import Text from '@basicComponents/text';
import theme from '@/style';
import {View} from 'react-native';
import globalStore from '@/services/global.state';
import {takeUntil} from 'rxjs';

/** 这是一个加载页 */

const StartLoadingWeb = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const sub = globalStore.startLoadingStatus
      .pipe(takeUntil(globalStore.appDistory))
      .subscribe(bool => {
        setLoading(bool);
      });
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return (
    <Dialog
      isVisible={loading}
      overlayStyle={[theme.fill.fill, theme.padding.xxl]}>
      <View style={[theme.fill.fill, theme.flex.col]}>
        <View style={[theme.fill.fill, theme.padding.xxl, theme.padding.btml]}>
          <View style={[theme.flex.flex1, theme.flex.center]}>
            <Dialog.Loading />
            <Text main textAlign="center" size="large">
              Loading...
            </Text>
          </View>
        </View>
      </View>
    </Dialog>
  );
};

export default StartLoadingWeb;
