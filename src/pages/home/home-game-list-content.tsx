import React from 'react';
import {View} from 'react-native';
import {
  DiceListItem,
  ColorListItem,
  DigitListItem,
  // QuickDigitListItem,
  KeralaListItem,
  MatkaListItem,
} from './home.type';
import HomeDice from './components/dice/home-dice';

import HomeColor from './components/color/home-color';
import HomeDigits from './components/digit/home-digits';
// import HomeQuickDigits from './components/quickdigit/home-quickdigits';

// import HomeColor from './components/home-color';
import HomeKerala from './components/kerala/home-kerala';
// import HomeMatka from './components/matka/home-matka';
// import HomeCar from './components/car/home-car';
// import HomeCasino from './components/dice/home-casino';
// import HomeLive from './components/dice/home-live';
import theme from '@style';

export interface HomeTabListContentProps {
  diceList: DiceListItem[];
  colorList: ColorListItem[];
  digitList: DigitListItem[];
  quickDigitList: DigitListItem[];
  keralaList: KeralaListItem[];
  onMeasure: (index: number, anchor: number) => void;
}

const HomeTabListContent = ({
  onMeasure = () => {},
  diceList = [],
  colorList = [],
  digitList = [],
  // quickDigitList = [],
  keralaList = [], // matkaList = [],
}: HomeTabListContentProps) => {
  const dataContent = [
    {
      name: 'Dice',
      content: <HomeDice diceList={diceList.slice(0, 3)} />,
    },
    {
      name: 'Color',
      content: <HomeColor colorList={colorList.slice(0, 3)} />,
    },
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
      content: <HomeDigits digitList={digitList.slice(0, 3)} />,
    },
    {
      name: 'Kerala',
      content: <HomeKerala keralaList={keralaList.slice(0, 3)} />,
    },
    // {
    //   name: 'Matka',
    //   content: <HomeMatka matkaList={matkaList.slice(0, 2)} />,
    // },
    // {
    //   name: 'Casino',
    //   content: <HomeCasino diceList={diceList.slice(0, 3)} />,
    // },
    // {
    //   name: 'Live',
    //   content: <HomeLive diceList={diceList.slice(0, 3)} />,
    // },
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
