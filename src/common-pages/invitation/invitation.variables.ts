import theme from '@/style';

export const invitationImcomeIcon = require('@assets/icons/common/common.webp');
export const invitationPeopleIcon = require('@assets/icons/common/common.webp');
export const invitationRecordIcon = require('@assets/icons/common/common.webp');
export const invitationRulesIcon = require('@assets/icons/common/common.webp');

export const invitationCodeCardImg = require('@components/assets/imgs/invitation/invitation-code-card.webp');
export const rightIcon = require('@components/assets/icons/right-icon.webp');

export const defaultHeaderImg = require('@components/assets/icons/default-header.webp');
export const whatsappIcon = require('@components/assets/icons/proxy/whatsapp.webp');
// export const topone = require('@assets/imgs/invitation/topone.webp');
// export const toptwo = require('@assets/imgs/invitation/toptwo.webp');
// export const content = require('@assets/imgs/invitation/content.webp');
// export const bottom = require('@assets/imgs/invitation/bottom.webp');
// export const CardOuterBg = require('@assets/imgs/invitation/card-outer.webp');
export const invitationColors = {
  tableHeader: '#FF6868',
  tableEven: '#FFD5D5',
  tableOdd: '#FFE6E8',
  codeTitle: '#6E350F',
  codeLinear: ['#FFD523', 'rgba(255, 213, 35, 0.00)'],
  line: '#E8EAEE',
  bounsItem: theme.basicColor.primary10,
  disabled: '#DCDCE5',
  ...theme.invitationBaseColors,
};
export const invitationApplyColor = {
  borderColor: '#C3C3C3',
  backgroundColor: '#f4f4f4',
};
export const defaultTableData = [
  [1, 500, 55],
  [3, 500, 155],
  [10, 500, 555],
  [30, 500, 1555],
  [70, 500, 3355],
  [200, 500, 10955],
  [500, 500, 25555],
  [1000, 500, 48555],
  [5000, 500, 355555],
  [10000, 500, 755555],
  [20000, 500, 1555555],
];
