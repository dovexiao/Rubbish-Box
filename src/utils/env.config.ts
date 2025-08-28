import {Platform} from 'react-native';
import RNConfig from 'react-native-config';

const IS_WEB = Platform.OS === 'web';

const ENV_CONFIG = (IS_WEB ? process.env : RNConfig) as {
  REACT_APP_ENV: 'dev' | 'prod';
  REACT_APP_API_BASE_URL: string;
  REACT_APP_API_INDUSWIN_URL?: string;
  REACT_APP_API_SPORTS_URL?: string;
  REACT_APP_API_H5GAMES_URL?: string;
  REACT_APP_API_RACECAR_URL?: string;
  REACT_APP_API_H5VUE_URL?: string;
  REACT_APP_PACKAGE?: number;
  REACT_APP_API_DOWNLOAD_URL?: string;
  REACT_APP_API_CHANNEL_ID?: string;
  REACT_APP_API_PACKAGE_ID?: string | number;
  REACT_APP_API_CUSTOM_SERVICE_URL?: string;
  REACT_APP_API_DOWNLOAD_CHANNEL_URL?: string;
  REACT_APP_API_LOGO_URL?: string;
  REACT_APP_API_LOGO_URL_V2?: string;
  REACT_APP_API_LAUNCH_SCREEN_URL?: string;
  [k: string]: string | number | undefined;
};

class Config {
  private _codePushKey: string;
  private _baseUrl: string;
  get baseUrl() {
    return this._baseUrl;
  }
  private _induswinUrl: string | undefined;
  get induswinUrl() {
    return this._induswinUrl;
  }
  private _sportsUrl: string;
  get sportsUrl() {
    return this._sportsUrl;
  }
  private _racecarUrl: string;
  get racecarUrl() {
    return this._racecarUrl;
  }
  private _reactH5Url = 'https://h5-games.pages.dev';
  private _vueH5Url = 'https://h5.megadreamlottery.com';
  get reactH5Url() {
    return this._reactH5Url;
  }
  get vueH5Url() {
    return this._vueH5Url;
  }
  get codePushKey() {
    return this._codePushKey;
  }
  private _moengageAppId = 'Q60RICPHDSGXDX7PXH3NCE7K';
  private _packageId: number | undefined = 3;

  get moengageAppId() {
    return this._moengageAppId;
  }

  get downloadUrl() {
    return ENV_CONFIG.REACT_APP_API_DOWNLOAD_URL;
  }
  get downloadChannelUrl() {
    return ENV_CONFIG.REACT_APP_API_DOWNLOAD_CHANNEL_URL;
  }
  get getChannelId() {
    return ENV_CONFIG.REACT_APP_API_CHANNEL_ID;
  }
  get getPackageId() {
    return ENV_CONFIG.REACT_APP_API_PACKAGE_ID;
  }
  get getCustomServiceUrl() {
    return ENV_CONFIG.REACT_APP_API_CUSTOM_SERVICE_URL;
  }
  get getLogo() {
    return ENV_CONFIG.REACT_APP_API_LOGO_URL;
  }
  get getLogoV2() {
    return ENV_CONFIG.REACT_APP_API_LOGO_URL_V2;
  }
  get getLaunchScreen() {
    return ENV_CONFIG.REACT_APP_API_LAUNCH_SCREEN_URL;
  }
  constructor() {
    this._baseUrl = ENV_CONFIG.REACT_APP_API_BASE_URL;
    // this._baseUrl = 'https://api.mega4cx25.com/';
    this._induswinUrl =
      ENV_CONFIG.REACT_APP_API_INDUSWIN_URL ||
      ENV_CONFIG.REACT_APP_API_BASE_URL;
    this._reactH5Url = ENV_CONFIG.REACT_APP_API_H5GAMES_URL || this._reactH5Url;
    this._vueH5Url = ENV_CONFIG.REACT_APP_API_H5VUE_URL || this._vueH5Url;
    this._sportsUrl =
      ENV_CONFIG.REACT_APP_API_SPORTS_URL || ENV_CONFIG.REACT_APP_API_BASE_URL;
    this._racecarUrl =
      ENV_CONFIG.REACT_APP_API_RACECAR_URL || ENV_CONFIG.REACT_APP_API_BASE_URL;
    this._moengageAppId = this._moengageAppId;
    this._packageId = ENV_CONFIG.REACT_APP_PACKAGE;
    this._codePushKey =
      ENV_CONFIG.REACT_APP_ENV === 'prod'
        ? 'wGQgszC-unCjTAoHrUNFqag9WveuTMk8Px9WNF'
        : ENV_CONFIG.REACT_APP_ENV === 'dev'
        ? 'thrIu6I2ol73h8tusOJ8GcbtQd9BXkqgRTTEEp'
        : '';
  }
}

export const envConfig = new Config();
export default envConfig;
