/* eslint-disable prettier/prettier */
import {LinkingOptions} from '@react-navigation/native';
import {HomeDetail} from './pages/home';
import {mainPageList} from './main-navigation';
import DetailWebView, {GameWebView} from './common-pages/webview';
import Login, {SetPassword, SingUp} from './common-pages/login';
import {BasicObject, NavigatorScreenProps} from './types';
import globalStore from './services/global.state';
import Result from './common-pages/result';
// import Referral from './pages/referral';
import PaidSuccess from './common-pages/paid-success';
import Recharge from './common-pages/recharge';
import Withdraw from './common-pages/withdraw';
import Vip from './common-pages/vip/vip';
import Wallet from './common-pages/wallet/wallet-page';
import Rebate from './common-pages/rebate';
import Bets from './common-pages/bets';
import BetsDetail from './common-pages/bets-detail';
import {NotificationList} from './common-pages/notification';
import NotificationDetail from './common-pages/notification/notification-detail';
import Profile from './common-pages/profile';
import {PromotionDetail} from './common-pages/promotion';
import Promotion from './common-pages/promotion';
import NotificationPage from './common-pages/notification';
import ProxyHome, {
  ProxyRules,
  ProxyCommissionDetail,
  ProxyCommissionDetailUser,
  ProxyTeamReport,
  ProxyTeamReportSearch,
  ProxyNewUser,
} from './common-pages/proxy';
import NewProxyHome from './common-pages/proxy-new';
import Invitation, {
  InvitationApply,
  InvitationRecord,
  InvitationRule,
} from './common-pages/invitation';
import AddBank from './common-pages/add-bank';
import Transactions from './common-pages/transaction';
import Transfer from './common-pages/transfer';
import {
  RechargeRecords,
  WithdrawRecords,
  TransferRecords,
} from './common-pages/records';
import Casino from './common-pages/casino';
import ArticleDetail from './common-pages/article/article-detail';
import AgentFranchise from './common-pages/agent-franchise/agent-franchise';
import InviteFriends from './common-pages/invite-friends/invite-friends';
import VipClub from './common-pages/vip-club/vip-club';
import LuckySpinPage from './common-pages/luckyspin/luckyspin';
import ShoppingPage from './common-pages/welfare/shopping/shopping-page';
import CheckIn from './common-pages/check-in/check-in';
import MyGames from './common-pages/my-games';
import CollectPage from './common-pages/collect';
import InviteActivity from './common-pages/invite-activity/invite-activity';
import PiggyPot from './common-pages/piggy-pot/piggy-pot';
import MineClearance from './common-pages/mine-clearance/mine-clearance';
//新接入route
import {newProxyRoute} from '@/common-pages/proxy-new/route';
import CouponPage from './common-pages/coupon';
import FeedBackPage from './common-pages/feedback';
import FeedBackRecordPage from './common-pages/feedback/record';

type Routes = {
  name: string;
  component: (props: NavigatorScreenProps & BasicObject) => React.JSX.Element;
  link: string;
  headerShown?: boolean;
};

const routes: Routes[] = [
  ...newProxyRoute,
  {
    name: 'GameWebView',
    component: GameWebView,
    link: 'game-webview',
  },
  {
    name: 'HomeDetail',
    component: HomeDetail,
    link: 'home-detail',
  },
  {
    name: 'Result',
    component: Result,
    link: 'result',
  },
  {
    name: 'Login',
    component: Login,
    link: 'login',
  },
  {
    name: 'SingUp',
    component: SingUp,
    link: 'sing-up',
  },
  {
    name: 'SetPassword',
    component: SetPassword,
    link: 'set-password',
  },
  {
    name: 'WebView',
    component: DetailWebView,
    link: 'webview',
  },
  // {
  //   name: 'Referral',
  //   component: Referral,
  //   link: 'referral',
  // },
  {
    name: 'PaidSuccess',
    component: PaidSuccess,
    link: 'paid-success',
  },
  {
    name: 'Recharge',
    component: Recharge,
    link: 'recharge',
  },
  {
    name: 'Withdraw',
    component: Withdraw,
    link: 'withdraw',
  },
  {
    name: 'AddBank',
    component: AddBank,
    link: 'add-bank',
  },
  {
    name: 'Vip',
    component: Vip,
    link: 'vip',
  },
  {
    name: 'Wallet',
    component: Wallet,
    link: 'Wallet',
  },
  {
    name: 'Rebate',
    component: Rebate,
    link: 'rebate',
  },
  {
    name: 'Bets',
    component: Bets,
    link: 'bets',
  },
  {
    name: 'BetsDetail',
    component: BetsDetail,
    link: 'bets-detail',
  },
  {
    name: 'NotificationList',
    component: NotificationList,
    link: 'notification-list',
  },
  {
    name: 'NotificationDetail',
    component: NotificationDetail,
    link: 'notification-detail',
  },
  {
    name: 'NewProxyHome',
    component: NewProxyHome,
    link: 'new-proxy-home',
  },
  {
    name: 'ProxyHome',
    component: ProxyHome,
    link: 'proxy-home',
  },
  {
    name: 'ProxyRules',
    component: ProxyRules,
    link: 'proxy-rules',
  },
  {
    name: 'ProxyCommissionDetail',
    component: ProxyCommissionDetail,
    link: 'proxy-commission-detail',
  },
  {
    name: 'ProxyCommissionDetailUser',
    component: ProxyCommissionDetailUser,
    link: 'proxy-commission-detail-user',
  },
  {
    name: 'ProxyTeamReport',
    component: ProxyTeamReport,
    link: 'proxy-team-report',
  },
  {
    name: 'ProxyTeamReportSearch',
    component: ProxyTeamReportSearch,
    link: 'proxy-team-report-search',
  },
  {
    name: 'ProxyNewUser',
    component: ProxyNewUser,
    link: 'proxy-new-user',
  },
  {
    name: 'Invitation',
    component: Invitation,
    link: 'invitation',
  },
  {
    name: 'InvitationApply',
    component: InvitationApply,
    link: 'invitation-apply',
  },
  {
    name: 'InvitationRecord',
    component: InvitationRecord,
    link: 'invitation-record',
  },
  {
    name: 'InvitationRule',
    component: InvitationRule,
    link: 'invitation-rule',
  },
  {
    name: 'Transactions',
    component: Transactions,
    link: 'transactions',
  },
  {
    name: 'Transfer',
    component: Transfer,
    link: 'transfer',
  },
  {
    name: 'RechargeRecords',
    component: RechargeRecords,
    link: 'recharge-records',
  },
  {
    name: 'WithdrawRecords',
    component: WithdrawRecords,
    link: 'withdraw-records',
  },
  {
    name: 'TransferRecords',
    component: TransferRecords,
    link: 'transfer-records',
  },
  {
    name: 'Profile',
    component: Profile,
    link: 'profile',
  },
  {
    name: 'PromotionDetail',
    component: PromotionDetail,
    link: 'promotion-detail',
  },
  {
    name: 'Casino',
    component: Casino,
    link: 'live-casino',
  },
  {
    name: 'ArticleDetail',
    component: ArticleDetail,
    link: 'article-detail',
  },
  {
    name: 'AgentFranchise',
    component: AgentFranchise,
    link: 'agent-franchise',
  },
  {
    name: 'InviteFriends',
    component: InviteFriends,
    link: 'invite-friends',
  },
  {
    name: 'VipClub',
    component: VipClub,
    link: 'vip-club',
  },
  {
    name: 'LuckySpinPage',
    component: LuckySpinPage,
    link: 'luckyspin-page',
  },
  {
    name: 'ShoppingPage',
    component: ShoppingPage,
    link: 'shopping-page',
  },
  {
    name: 'CheckIn',
    component: CheckIn,
    link: 'check-in',
  },
  {
    name: 'InviteActivity',
    component: InviteActivity,
    link: 'invite-activity',
  },
  {
    name: 'MyGames',
    component: MyGames,
    link: 'my-games',
  },
  {
    name: 'CollectPage',
    component: CollectPage,
    link: 'collect-page',
  },
  {
    name: 'PiggyPot',
    component: PiggyPot,
    link: 'piggy-pot',
  },
  {
    name: 'MineClearance',
    component: MineClearance,
    link: 'mine-clearance',
  },
  {
    name: 'CouponPage',
    component: CouponPage,
    link: 'coupon-page',
  },
  {
    name: 'FeedBackPage',
    component: FeedBackPage,
    link: 'feedback-page',
  },
  {
    name: 'FeedBackRecordPage',
    component: FeedBackRecordPage,
    link: 'feedback-record-page',
  },
  // Promotion
  {
    name: 'Promotion',
    component: Promotion,
    link: 'home-Promotion',
  },
  {
    name: 'Notification',
    component: NotificationPage,
    link: 'notification',
  },
];

const linking: LinkingOptions<{}> = {
  prefixes: ['https://playpick3.com', 'playpick3://'],
  config: {
    screens: {
      Index: {
        screens: mainPageList.reduce((data, item) => {
          data[item.name] = item.link;
          return data;
        }, {} as {[k: string]: string}),
      },
      ...Object.values(routes).reduce((data, route) => {
        data[route.name] = route.link;
        return data;
      }, {} as {[k: string]: string}),
    },
  },
};

globalStore.setItem('linking', linking);

export {routes, linking};
