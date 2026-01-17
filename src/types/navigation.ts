export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  MainTabs: undefined;
  DeviceDetail: { deviceId: string };
  MemberShare: undefined;
  VipInvite: undefined;
  DeviceInfo: undefined;
  WebView: { url?: string; title?: string };
  ForgetPassword: undefined;
  ForgetPasswordSms?: { mobile: string; type: string };
};

export type MainTabParamList = {
  DeviceControl: undefined;
  DeviceGroup: undefined;
  Profile: undefined;
};

