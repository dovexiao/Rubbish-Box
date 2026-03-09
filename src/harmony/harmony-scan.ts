import { NativeModules } from 'react-native';
import { IS_HARMONY } from '@/constants';

const HarmonyScanModule = NativeModules.HarmonyScanModule;

export const startHarmonyScan = async (): Promise<string> => {
  if (!IS_HARMONY) return '';
  if (!HarmonyScanModule) {
    throw new Error("模块未就绪：请确保你在 DevEco Studio 中点击了重新运行(Run)以编译最新原生的 ETS 代码, 并且未报错");
  }
  try {
    return await HarmonyScanModule.startScan();
  } catch (error) {
    console.error('Harmony OS Scan Error:', error);
    throw error;
  }
};
