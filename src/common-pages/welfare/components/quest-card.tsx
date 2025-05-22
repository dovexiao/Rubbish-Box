import React, {useEffect} from 'react';

import {useSettingWindowDimensions} from '@/store/useSettingStore';

import CustomCard from './custom-card';
import Text from '@basicComponents/text';
import theme from '@/style';
import {ScrollView, View} from 'react-native';
// import Switch from '@/components/basic/switch';
// import {useSharedValue} from 'react-native-reanimated';
// import TabReanimated from '@/components/basic/tab/tab-reanimated';
import LazyImage from '@/components/basic/image/lazy-image';
import Button from '@/components/basic/button';
import useWelfareStore, {useWelfareStoreActions} from '@/store/useWelfareStore';
import {ActivityTaskListItem} from '../welfare.service';
import {goToUrl} from '@/common-pages/game-navigate';
// import {useFocusEffect} from '@react-navigation/native';

const QuestCard = () => {
  const {} = useSettingWindowDimensions();
  const activityTaskList = useWelfareStore(state => state.activityTaskList);
  const {getActivityTaskList} = useWelfareStoreActions();
  // const [questType, setQuestType] = useState(0);
  // const isOn = useSharedValue(false);

  useEffect(() => {
    getActivityTaskList(1);
  }, [getActivityTaskList]);

  // useFocusEffect(() => {
  //   getActivityTaskList(questType);
  // });

  // const handleSwitchPress = () => {
  //   isOn.value = !isOn.value;
  // };

  const onPressItem = (item: ActivityTaskListItem) => {
    goToUrl(item?.skipLinks, item?.name);
  };

  const renderQuestItem = (item: ActivityTaskListItem) => {
    return (
      <View
        key={item?.id}
        style={[
          theme.flex.row,
          theme.padding.tbm,
          theme.flex.centerByCol,
          theme.padding.lrl,
          {height: 62},
        ]}>
        <View>
          <LazyImage imageUrl={item?.imageUrl} height={42} width={42} />
        </View>
        <View style={[theme.flex.flex1, theme.flex.centerByRow, {height: 58}]}>
          <Text white fontSize={14} blod>
            {item?.name}({item?.alreadyCompleteCount}/{item?.needCompleteCount})
          </Text>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            {/* <LazyImage imageUrl={item?.imageUrl} height={20} width={20} /> */}
            <Text color={theme.fontColor.white60}>{item?.note}</Text>
          </View>
        </View>
        <Button
          title={item?.buttonText}
          type="linear-primary"
          size="xsmall"
          radius={20}
          onPress={() => {
            onPressItem(item);
          }}
        />
      </View>
    );
  };

  return (
    <CustomCard title="Task">
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.padding.lrl,
          theme.padding.tbs,
        ]}>
        <View style={[theme.flex.flex1]}>
          <Text white style={[theme.font.center]}>
            The task is refreshed at{' '}
            <Text color={'#FFCE09'}>0:00 every day</Text>
          </Text>
        </View>
        {/* <Switch
          value={isOn}
          onPress={handleSwitchPress}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            marginLeft: 8,
            width: 48,
            height: 22,
            padding: 4,
            borderRadius: 20,
          }}
        /> */}
      </View>
      {/* <View
        style={[
          theme.flex.center,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            height: 42,
            borderBottomColor: theme.borderColor.primary50,
            borderBottomWidth: 1,
          },
        ]}>
        <TabReanimated
          tabOptions={[
            {
              title: 'Daily Task',
            },
          ]}
          index={questType}
          onPressItem={setQuestType}
        />
      </View> */}
      <ScrollView style={[theme.flex.flex1, theme.margin.btml]}>
        {activityTaskList?.map(item => {
          return renderQuestItem(item);
        })}
      </ScrollView>
    </CustomCard>
  );
};

export default QuestCard;
