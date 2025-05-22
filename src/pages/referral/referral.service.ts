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
