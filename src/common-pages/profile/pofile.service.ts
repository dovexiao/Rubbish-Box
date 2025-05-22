import {SafeAny} from '@/types';
import {http} from '@utils';
interface fileList {
  file: any;
}
/** 图片上传 */
export const uploadProfilePhoto = (data: fileList) => {
  return http({
    method: 'POST',
    url: '/app/user/uploadProfilePhoto',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  });
};
/** 修改个人信息 */
export const updateProfile = (userName: string, userAvatar: string) => {
  let url = '/app/user/updateInfo?';
  if (userName) {
    url = url + 'userName=' + userName;
  }
  if (userAvatar && userName) {
    url = url + '&userAvatar=' + userAvatar;
  }
  if (userAvatar && !userName) {
    url = url + 'userAvatar=' + userAvatar;
  }
  return http({
    method: 'POST',
    url,
  });
};
// user/uploadProfilePhotoBase64
export const uploadProfilePhotoBase64 = (data: SafeAny) => {
  return http({
    method: 'POST',
    url: '/app/user/uploadProfilePhotoBase64',
    data,
  });
};
/** 获取默认头像 */
export const getDefaultAvatar = () => {
  return http({
    method: 'POST',
    url: '/app/user/getDefaultAvatar',
  });
};
