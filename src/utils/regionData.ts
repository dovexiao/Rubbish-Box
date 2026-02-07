/**
 * 省市区级联数据，与 Taro 参考项目格式一致（value 补齐 6 位）
 */
// @ts-ignore
import { regionData as rawRegionData } from 'element-china-area-data';

function padValue(v: string): string {
  return String(v).padEnd(6, '0');
}

function normalizeItem(item: any): any {
  const value = padValue(item.value);
  const children = item.children?.map(normalizeItem);
  return { ...item, value, ...(children ? { children } : {}) };
}

export const regionData = (rawRegionData || []).map(normalizeItem);

export type PickerColumnItem = {
  label: string;
  value: string;
  children?: PickerColumnItem[];
};

/**
 * 根据选中的 value 数组从级联数据中取出对应的 { label, value } 列表
 */
export function getPickerResultByValues(
  data: PickerColumnItem[],
  values: (string | number)[]
): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  let index = 0;
  function walk(list: PickerColumnItem[]) {
    if (!list || index >= values.length) return;
    const val = String(values[index]);
    for (const item of list) {
      if (String(item.value) === val) {
        result.push({ label: item.label, value: String(item.value) });
        index++;
        if (item.children?.length) walk(item.children);
        break;
      }
    }
  }
  walk(data);
  return result;
}
