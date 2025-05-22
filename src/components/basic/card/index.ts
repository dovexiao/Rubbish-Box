import CardBase, {CardBaseProps} from './card-base';
import CardImage, {CardImageProps} from './card-image';
import CardTitle, {CardTitleProps, lightLinear} from './card-title';

const Card = Object.assign(CardBase, {
  Image: CardImage,
  Title: CardTitle,
});

export type {CardBaseProps, CardImageProps, CardTitleProps};
export {lightLinear};
export default Card;
