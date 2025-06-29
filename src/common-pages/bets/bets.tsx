import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import BetsList from './bets-list';
import BetsTab from './bets-tab';
import {TabView} from '@rneui/themed';
import globalStore from '@/services/global.state';
import {useRoute} from '@react-navigation/native';
import {BasicObject} from '@/types';
import {LazyImageLGBackground} from '@basicComponents/image';
import {DatePickerItem} from '@/components/basic/date-picker';
import {NOW_DATE} from '@/constants';

const Bets = () => {
  const {tag} = (useRoute().params as BasicObject) || {};
  const {i18n} = useTranslation();
  const [active, setActive] = React.useState(0);
  const [activeTag, setActiveTag] = React.useState(
    globalStore.packageId === 5 ? tag || 'Color' : tag || 'Kerala',
  );
  const [currentDate, setCurrentDate] = React.useState(NOW_DATE);

  const MENU = [
    {
      title: i18n.t('other.all'),
      value: 'ALL',
    },
    {
      title: i18n.t('other.toBeDrawn'),
      value: 'UNKNOWN',
    },
    {
      title: i18n.t('other.drawn'),
      value: 'KNOWN',
    },
    {
      title: i18n.t('other.won'),
      value: 'WON',
    },
  ];

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideAmount
        hideServer
        title={i18n.t('me.bottom.myBets')}
      />
      <BetsTab
        currentDate={currentDate}
        onSelectDate={setCurrentDate}
        filterValue={activeTag}
        menu={MENU}
        active={active}
        changeActive={setActive}
        onChangeFilter={setActiveTag}
      />
      <DatePickerItem value={currentDate} onChange={setCurrentDate} />
      <TabView
        containerStyle={[theme.overflow.hidden]}
        value={active}
        onChange={setActive}
        animationConfig={{
          duration: 200,
          useNativeDriver: true,
        }}
        animationType="timing"
        disableTransition>
        {MENU.map((item, index) => {
          return (
            <TabView.Item
              key={index}
              style={[theme.flex.flex1, {backgroundColor: 'transparent'}]}>
              <BetsList
                isActive={active === index}
                game={activeTag}
                status={item.value}
                currentDate={currentDate}
              />
            </TabView.Item>
          );
        })}
      </TabView>
    </LazyImageLGBackground>
  );
};

export default Bets;
