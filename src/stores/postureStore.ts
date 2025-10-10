import { create } from 'zustand';

type PostureStatus = 'good' | 'head_not_centered' | 'head_not_up' | 'shoulders_not_level' | 'detecting' | 'no_person';

interface PostureState {
  nowStatus: PostureStatus;
  goodTime: number;
  headTiltTime: number;
  headDownTime: number;
  shoulderTiltTime: number;
  
  // 操作方法
  setStatus: (status: PostureStatus) => void;
  incrementGoodTime: (seconds: number) => void;
  incrementHeadTiltTime: (seconds: number) => void;
  incrementHeadDownTime: (seconds: number) => void;
  incrementShoulderTiltTime: (seconds: number) => void;
  resetTimes: () => void;
}

export const usePostureStore = create<PostureState>((set) => ({
  nowStatus: 'detecting',
  goodTime: 0,
  headTiltTime: 0,
  headDownTime: 0,
  shoulderTiltTime: 0,
  
  setStatus: (status) => set({ nowStatus: status }),
  
  incrementGoodTime: (seconds) => 
    set((state) => ({ goodTime: state.goodTime + seconds })),
  
  incrementHeadTiltTime: (seconds) => 
    set((state) => ({ headTiltTime: state.headTiltTime + seconds })),
  
  incrementHeadDownTime: (seconds) => 
    set((state) => ({ headDownTime: state.headDownTime + seconds })),
  
  incrementShoulderTiltTime: (seconds) => 
    set((state) => ({ shoulderTiltTime: state.shoulderTiltTime + seconds })),
  
  resetTimes: () => set({ 
    goodTime: 0,
    headTiltTime: 0,
    headDownTime: 0,
    shoulderTiltTime: 0
  }),
}));