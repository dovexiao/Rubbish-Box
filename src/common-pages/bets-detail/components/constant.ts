import {BasicObject} from '@/types';

const DICES = {
  1: require('@components/assets/imgs/game/dice/1-red.webp'),
  2: require('@components/assets/imgs/game/dice/2-black.webp'),
  3: require('@components/assets/imgs/game/dice/3-black.webp'),
  4: require('@components/assets/imgs/game/dice/4-red.webp'),
  5: require('@components/assets/imgs/game/dice/5-black.webp'),
  6: require('@components/assets/imgs/game/dice/6-black.webp'),
  ball: require('@components/assets/imgs/game/dice/ball.webp'),
  small: require('@components/assets/imgs/game/dice/small.webp'),
  big: require('@components/assets/imgs/game/dice/big.webp'),
  even: require('@components/assets/imgs/game/dice/even.webp'),
  odd: require('@components/assets/imgs/game/dice/odd.webp'),
  any: require('@components/assets/imgs/game/dice/dice-question.webp'),
} as BasicObject;

const DIGIT = {
  Y: require('@components/assets/imgs/game/3d/digit-color-blue.png'),
  Z: require('@components/assets/imgs/game/3d/digit-color-blue.png'),
  A: require('@components/assets/imgs/game/3d/digit-color-red.png'),
  B: require('@components/assets/imgs/game/3d/digit-color-origin.png'),
  C: require('@components/assets/imgs/game/3d/digit-color-blue.png'),
} as BasicObject;

const COLORS = {
  g: require('@components/assets/imgs/game/color/color-green.webp'),
  r: require('@components/assets/imgs/game/color/color-red.webp'),
  v: require('@components/assets/imgs/game/color/color-violet.webp'),
  gv: require('@components/assets/imgs/game/color/color-green-violet.webp'),
  rv: require('@components/assets/imgs/game/color/color-red-violet.webp'),
} as BasicObject;

const LEVELS = {
  '1th': require('@components/assets/imgs/game/kelara/01.webp'),
  '2th': require('@components/assets/imgs/game/kelara/02.webp'),
  '3th': require('@components/assets/imgs/game/kelara/03.webp'),
  '4th': require('@components/assets/imgs/game/kelara/04.webp'),
  '5th': require('@components/assets/imgs/game/kelara/05.webp'),
  '6th': require('@components/assets/imgs/game/kelara/06.webp'),
  '7th': require('@components/assets/imgs/game/kelara/07.webp'),
  '8th': require('@components/assets/imgs/game/kelara/08.webp'),
  '9th': require('@components/assets/imgs/game/kelara/09.webp'),
  '10th': require('@components/assets/imgs/game/kelara/10.webp'),
  '11th': require('@components/assets/imgs/game/kelara/11.webp'),
  cons: require('@components/assets/imgs/game/kelara/cons.webp'),
} as BasicObject;

export {DICES, DIGIT, COLORS, LEVELS};
