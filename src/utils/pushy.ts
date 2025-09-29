import {getStorage, setStorage, StorageEnum} from '@/utils/storage';
const getTodayKey = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};
export const fetchPushy = async () => {
  const today = getTodayKey();
  const showPushy = await getStorage(StorageEnum.showPushyFlag);
  if (showPushy !== today) {
    setStorage(StorageEnum.showPushyFlag, today);
    return true;
  } else {
    return false;
  }
};
