import {
  postChangeGameStatus,
  postGetGameStatus,
  postToCloseGame,
  postToOpenGame,
} from '@/common-pages/game-navigate';
import {create} from 'zustand';

type CollectStoreState = {
  openGameId: number;
  collectStatus: number; //0no collect  1collect

  openGameReport: () => void; //open game report and get game collect status
  changeGameCollectStatus: () => void;
  closeGameReport: () => void;
};

const useCollectStore = create<CollectStoreState>()((set, get) => ({
  openGameId: 0,
  collectStatus: 0,

  openGameReport: async () => {
    postToOpenGame(get().openGameId);
    const isCollect = await postGetGameStatus(get().openGameId);
    set({collectStatus: isCollect ? 1 : 0});
  },
  changeGameCollectStatus: async () => {
    try {
      await postChangeGameStatus(get().openGameId);
      set({collectStatus: get().collectStatus === 0 ? 1 : 0});
    } catch (error) {
      set({collectStatus: get().collectStatus});
    }
  },
  closeGameReport: async () => {
    postToCloseGame(get().openGameId);
    set({openGameId: 0, collectStatus: 0});
  },
}));

export default useCollectStore;
