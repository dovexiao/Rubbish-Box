/**
 * 将对象转为 query string，兼容 Taro/antmjs stringify 用法
 * @param obj 需要序列化的对象
 * @param encode 是否对 value 进行 encodeURIComponent，默认 true
 * @returns string
 */
export function stringify(
  obj: Record<string, any>,
  encode: boolean = true,
): string {
  if (!obj || typeof obj !== 'object') return '';
  return Object.keys(obj)
    .map(key => {
      const val = obj[key] ?? '';
      return `${key}=${encode ? encodeURIComponent(String(val)) : String(val)}`;
    })
    .join('&');
}
