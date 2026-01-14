/**
 * 版本比较工具函数
 */

/**
 * 比较版本号
 * @param version 版本号字符串，如 "1.2.3"
 * @returns 版本比较对象
 */
export function compareVersion(version: string) {
  const parseVersion = (v: string): number[] => {
    return v.split('.').map(Number);
  };

  const current = parseVersion(version);

  return {
    /**
     * 判断当前版本是否早于目标版本
     */
    isBefore: (target: string): boolean => {
      const targetVersion = parseVersion(target);
      for (let i = 0; i < Math.max(current.length, targetVersion.length); i++) {
        const currentPart = current[i] || 0;
        const targetPart = targetVersion[i] || 0;
        if (currentPart < targetPart) return true;
        if (currentPart > targetPart) return false;
      }
      return false;
    },

    /**
     * 判断当前版本是否晚于目标版本
     */
    isAfter: (target: string): boolean => {
      const targetVersion = parseVersion(target);
      for (let i = 0; i < Math.max(current.length, targetVersion.length); i++) {
        const currentPart = current[i] || 0;
        const targetPart = targetVersion[i] || 0;
        if (currentPart > targetPart) return true;
        if (currentPart < targetPart) return false;
      }
      return false;
    },

    /**
     * 判断当前版本是否等于目标版本
     */
    isEqual: (target: string): boolean => {
      const targetVersion = parseVersion(target);
      if (current.length !== targetVersion.length) return false;
      for (let i = 0; i < current.length; i++) {
        if (current[i] !== targetVersion[i]) return false;
      }
      return true;
    },
  };
}

/**
 * 格式化文件大小
 * @param size 字节数
 * @returns 格式化后的文件大小字符串
 */
export function getFilesize(size: number): string {
  if (!size) return '';
  const num = 1024.0; // byte
  if (size < num) return size + 'B';
  if (size < num ** 2) return (size / num).toFixed(1) + 'KB';
  if (size < Math.pow(num, 3)) return (size / num ** 2).toFixed(1) + 'MB';
  if (size < num ** 4) return (size / num ** 3).toFixed(1) + 'GB';
  return (size / num ** 4).toFixed(1) + 'TB';
}

