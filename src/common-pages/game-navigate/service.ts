import {SafeAny} from '@/types';
import {http, indusWinHttp} from '@/utils';

export interface IUserInfo {
  canWithdrawAmount: number; // 可兑现金额
  createTime: number;
  level: number;
  rechargeAmount: number; // 充值金额
  userBalance: number; // 用户总额
  userPhone: string;
  userId: number;
  updateTime: number;
  lastLoginTime: number;
  // 缺少用户名
  [k: string]: SafeAny;
}

export interface SlotegratorStartParams {
  id: string;
  forFun: string;
}

/** 获取用户信息 */
export function postUserInfo() {
  return http.post<null, IUserInfo>('app/user/info');
}

export function postGetGameStatus(gameId: number) {
  return http.post<any, boolean>(`app/user/game/check/collect/${gameId}`);
}

export function postChangeGameStatus(gameId: number) {
  return http.post<any, any>(`app/user/game/collect/${gameId}`);
}

export function postToOpenGame(gameId: number) {
  return http.post<any, any>(`app/user/game/open/${gameId}`);
}

export function postToCloseGame(gameId: number) {
  return http.post<any, any>(`app/user/game/close/${gameId}`);
}

export function getSlotegratorGameStart(gameId: string) {
  return indusWinHttp.get<SlotegratorStartParams, string>(
    '/iGaming/casino/getGamesStart',
    {
      params: {
        id: gameId,
        forFun: 'false',
      },
    },
  );
}

export function postLiveAuthorize() {
  return indusWinHttp.post<null, {authorize: string}>('iGaming/liveAuthorize');
}

export function getKMAuthorize(tripartiteUniqueness: string) {
  return indusWinHttp.get<
    {tripartiteUniqueness: string},
    {active: boolean; authToken: string}
  >('iGaming/km/authorize', {
    params: {
      tripartiteUniqueness,
    },
  });
}

export function getWSStart(id: string) {
  return indusWinHttp.get<{id: string}, string>('/iGaming/ws/getGamesStart', {
    params: {id},
  });
}

export function getPGStart(id: string) {
  return indusWinHttp.get<{id: string}, string>('/iGaming/pg/getGamesStart', {
    params: {
      id: id,
    },
  });
}
export function getNoahPGStart(id: string) {
  return indusWinHttp.get<{id: string}, string>(
    '/iGaming/noah/pg/GetUserSession',
    {
      params: {
        id: id,
      },
    },
  );
}
export function getYGGStart(id: string) {
  return indusWinHttp.post<{id: string}, string>(
    `/iGaming/ata/login/game/${id}`,
  );
}

export function getJILIStart(id: string) {
  return indusWinHttp.post<{id: string}, string>(
    `/iGaming/jl/singleWallet/LoginWithoutRedirect/${id}`,
  );
}

export function getCQ9Start(id: string) {
  return indusWinHttp.post<{id: string}, string>(
    `/iGaming/cq9/game/link/${id}`,
  );
}

export function getFCStart(id: string) {
  return indusWinHttp.post<{id: string}, string>(`/iGaming/fc/login/${id}`);
}

export function getT1Start(id: string) {
  return indusWinHttp.post<{id: string}, string>(`/iGaming/t1/login/${id}`);
}

export function getAWCStart(id: string) {
  return indusWinHttp.post<{id: string}, string>(`/iGaming/sexy/login/${id}`);
}
