import {
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';

export type OnPanResponderMove = (
  e: GestureResponderEvent,
  gestureState: PanResponderGestureState,
) => void;

/**
 * 滑动捕获, 默认捕获向右滑动事件
 * 如果config中的dx,dy都为0,会直接触发
 * @param onPanResponderMove 回调
 */
export const slidePanResponder = (
  onPanResponderMove: OnPanResponderMove,
  {
    dx,
    dy,
  }: {
    /** 横向移动的值, 负值代表向左滑, 正值代表向右滑, 数值代表最小的滑动触发距离, 结合dy完成斜向滑动捕获 */
    dx?: number;
    /** 纵向移动的值, 负值代表向上滑, 正值代表向下滑, 数值代表最小的滑动触发距离, 结合dx完成斜向滑动捕获 */
    dy?: number;
  } = {dx: 0, dy: 0},
) => {
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    // onMoveShouldSetPanResponder: (e, gestureState) => {
    // },
    onPanResponderMove: (e, gestureState) => {
      const dxBool = dx
        ? dx > 0
          ? gestureState.dx > dx
          : gestureState.dx < dx
        : true;
      const dyBool = dy
        ? dy > 0
          ? gestureState.dy > dy
          : gestureState.dy < dy
        : true;
      if (dxBool && dyBool) {
        onPanResponderMove(e, gestureState);
      }
    },
  });
};
