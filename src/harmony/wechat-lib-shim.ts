type ShareMiniProgramOptions = {
  userName?: string;
  path?: string;
  webpageUrl?: string;
  scene?: number;
  miniProgramType?: number;
  title?: string;
  thumbImageUrl?: string;
};

type AuthResponse = {
  errCode: number;
  code?: string;
};

const unsupportedError = (apiName: string) =>
  new Error(`[wechat-lib-shim] ${apiName} is not supported on Harmony`);

export const registerApp = async (
  _appId?: string,
  _universalLink?: string,
): Promise<boolean> => {
  return false;
};

export const isWXAppInstalled = async (): Promise<boolean> => {
  return false;
};

export const sendAuthRequest = async (
  _scope?: string,
  _state?: string,
): Promise<AuthResponse> => {
  return {
    errCode: -1,
  };
};

export const launchMiniProgram = async (
  _options?: ShareMiniProgramOptions,
): Promise<{ errCode: number }> => {
  throw unsupportedError('launchMiniProgram');
};

export const shareMiniProgram = async (
  _options?: ShareMiniProgramOptions,
): Promise<{ errCode: number }> => {
  throw unsupportedError('shareMiniProgram');
};

export const addListener = () => ({
  remove: () => {},
});

export const once = () => ({
  remove: () => {},
});

export const removeAllListeners = () => {};

const WeChatShim = {
  registerApp,
  isWXAppInstalled,
  sendAuthRequest,
  launchMiniProgram,
  shareMiniProgram,
  addListener,
  once,
  removeAllListeners,
};

export default WeChatShim;
