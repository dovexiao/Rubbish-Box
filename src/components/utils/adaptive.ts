import {Dimensions} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const DESIGN_WIDTH = 375;
export function designToDp(designSize: number) {
  const width = Dimensions.get('window').width;
  return (designSize / DESIGN_WIDTH) * (width > 500 ? 500 : width);
}
export const imageScale = 74 / 375;

export const gutterLetter = (str: string, fontSize?: number) => {
  const brand = DeviceInfo.getBrand();
  const charWidth = (fontSize || 15) * 0.6;
  const spaceWidth = fontSize || 15;
  const marginWidth = brand === 'Xiaomi' ? 15 : 5;
  const strArr = str.split(' ');
  if (strArr.length > 1) {
    let sunLength: number = 0;
    strArr.map(item => {
      sunLength += item.length * charWidth;
    });
    return sunLength + (strArr.length - 1) * spaceWidth + marginWidth;
  } else {
    return str.length * charWidth + marginWidth;
  }
};
export const isXiaomiDevice = () => {
  const brand = DeviceInfo.getBrand().toLowerCase();
  // const manufacturer = DeviceInfo.getManufacturer();
  const model = DeviceInfo.getModel().toLowerCase();
  return (
    brand.includes('xiaomi') ||
    // manufacturer.includes('xiaomi') ||
    brand.includes('redmi') ||
    // manufacturer.includes('redmi') ||
    brand.includes('poco') ||
    // manufacturer.includes('poco') ||
    model.includes('mi ') ||
    model.includes('redmi') ||
    model.includes('poco')
  );
};
