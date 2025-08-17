import React from 'react';
import {View} from 'react-native';
import {
  // DiceListItem,
  // ColorListItem,
  DigitListItem,
  // QuickDigitListItem,
  KeralaListItem,
} from './home.type';
// import HomeDigits from './components/digit/home-digits';
// import HomeWorldDigits from './components/world-digit/home-digits';
// import HomeQuickDigits from './components/quickdigit/home-quickdigits';

// import HomeColor from './components/home-color';
import HomeKerala from './components/kerala/home-kerala';
// import HomeCar from './components/car/home-car';
import theme from '@style';
// import HomeDigitOff from '@/pages/home/components/digit-off/home-digit-off';
import HomeDigitOff from '@/pages/home/components/digit-off/home-digit-off';

export interface HomeTabListContentProps {
  // diceList: DiceListItem[];
  // colorList: ColorListItem[];
  // digitList: DigitListItem[];
  worldDigitList?: DigitListItem[];
  stateList?: DigitListItem[];
  quickDigitList?: DigitListItem[];
  keralaList: KeralaListItem[];
  onMeasure: (index: number, anchor: number) => void;
}

const HomeTabListContent = ({
  onMeasure = () => {},
  // diceList = [],
  // colorList = [],
  // stateList = [],
  keralaList = [],
}: HomeTabListContentProps) => {
  const dataContent = [
    // {
    //   name: 'Quick3Digits',
    //   content: <HomeQuickDigits quickDigitList={quickDigitList.slice(0, 3)} />,
    // },
    // {
    //   name: 'Color',
    //   content: <HomeColor />,
    // },
    {
      name: '3Digits',
      content: <HomeDigitOff />,
    },
    // {
    //   name: 'World3Digits',
    //   content: <HomeWorldDigits digitList={worldDigitList} />,
    // },
    // {
    //   name: 'State Lottery',
    //   content: <HomeState digitList={stateList} />,
    // },
    // {
    //   name: 'Color',
    //   content: <HomeColor colorList={colorList} />,
    //   // content: <HomeColor colorList={colorList.slice(0, 3)} />,
    // },
    // {
    //   name: 'Dice',
    //   // content: <HomeDice diceList={diceList.slice(0, 3)} />,
    //   content: <HomeDice diceList={diceList} />,
    // },
    {
      name: 'Kerala',
      content: <HomeKerala keralaList={keralaList} />,
    },
  ];

  return (
    <View style={[theme.padding.lrl]}>
      {dataContent.map((_, i) => (
        <View
          key={i}
          onLayout={e => {
            onMeasure(i, e.nativeEvent.layout.height);
          }}>
          {_.content}
        </View>
      ))}
    </View>
  );
};

export default HomeTabListContent;
