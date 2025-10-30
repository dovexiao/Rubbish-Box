import {create} from 'zustand';

type HomeServiceStore = {
  oldMenuImgUrl: string;
  setOldMenuImgUrl: (url: string) => void;
};

export const useHomeServiceStore = create<HomeServiceStore>(set => ({
  oldMenuImgUrl: '',
  setOldMenuImgUrl: url => set({oldMenuImgUrl: url}),
}));
