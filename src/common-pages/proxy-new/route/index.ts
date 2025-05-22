import TotalUser from '../child/total-user';
import TotalCommission from '../child/total-commission';
import MyRatio from '../child/my-ratio';
import InvitationRule from '../child/invitation-rule';
export const newProxyRoute = [
  {
    name: 'NewProxyTotalUser',
    component: TotalUser,
    link: 'new-proxy-total-user',
  },
  {
    name: 'NewProxyTotalCommission',
    component: TotalCommission,
    link: 'new-proxy-total-commission',
  },
  {
    name: 'NewProxyMyRatio',
    component: MyRatio,
    link: 'new-proxy-my-ratio',
  },
  {
    name: 'NewProxyInvitationRule',
    component: InvitationRule,
    link: 'new-proxy-invitation-rule',
  },
];
