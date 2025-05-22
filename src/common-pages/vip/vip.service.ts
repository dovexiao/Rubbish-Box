import {http} from '@/utils';

export function postReceiveBox(userId: number, level: number) {
  return http.post('app/membershipCard/getReceiveRewards', {
    userId,
    level: level + 1,
  });
}
