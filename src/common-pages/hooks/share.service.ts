import {http} from '@utils';

interface IShareInfoData {
  backgroundColor: string;
  backgroundPicture: string;
  content: string;
  inviteCode: string;
  inviteRegisterLinkUrl: string;
}

export function getShareInfo() {
  return http.get<null, IShareInfoData>('app/share/getShareInfo');
}

// 更新邀请码
export function updateInviteCode() {
  return http.post('app/user/update/inviteCode');
}
