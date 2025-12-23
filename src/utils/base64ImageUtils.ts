/**
 * Base64 图片工具类
 * 用于检测和处理 base64 编码的图片
 */

/**
 * 检查值是否为有效的非空字符串
 * @param value 待检查的值
 * @returns 如果是有效的非空字符串返回 true，否则返回 false
 */
const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * 检查值是否为有效的非空数组
 * @param value 待检查的值
 * @returns 如果是有效的非空数组返回 true，否则返回 false
 */
const isValidArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * 从数组中获取第一个元素并转换为字符串
 * @param array 数组
 * @returns 如果数组有效且第一个元素是字符串则返回该字符串，否则返回 null
 */
const getFirstStringFromArray = (array: unknown): string | null => {
  if (!isValidArray(array)) {
    return null;
  }
  const firstElement = array[0];
  return isValidString(firstElement) ? firstElement : null;
};

/**
 * 检测字符串是否是 base64 编码的图片
 * @param content 待检测的内容（unknown 类型）
 * @returns 如果是 base64 图片返回 true，否则返回 false
 */
export const isBase64String = (content: unknown): boolean => {
  if (!isValidString(content)) {
    return false;
  }

  // base64 图片通常很长（至少几百个字符）
  if (content.length < 100) {
    return false;
  }

  // 移除可能的空白字符（换行、空格等）
  const cleaned = content.replace(/\s+/g, '');

  // base64 字符集：A-Z, a-z, 0-9, +, /, =
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;

  // 如果清理后的内容长度足够且符合 base64 模式
  if (cleaned.length >= 100 && base64Pattern.test(cleaned)) {
    // 进一步验证：base64 字符串中 = 应该只在末尾（填充字符）
    const equalsCount = (cleaned.match(/=/g) || []).length;
    const lastEqualsIndex = cleaned.lastIndexOf('=');
    const hasValidPadding =
      equalsCount === 0 ||
      (equalsCount <= 2 && lastEqualsIndex >= cleaned.length - 2);

    return hasValidPadding;
  }

  return false;
};

/**
 * 检查数组是否有内容（第一个元素存在且为字符串）
 * @param array 待检查的数组
 * @returns 如果数组有内容且第一个元素是字符串返回 true，否则返回 false
 */
export const hasValidContent = (array: unknown): boolean => {
  const firstString = getFirstStringFromArray(array);
  return firstString !== null;
};

/**
 * 检查是否不是 base64 图片或内容为空
 * @param isBase64Image 是否为 base64 图片的标志
 * @param content 内容数组
 * @returns 如果不是 base64 图片或内容为空返回 true，否则返回 false
 */
export const isNotBase64OrEmpty = (
  isBase64Image: boolean,
  content: unknown,
): boolean => {
  return !isBase64Image || !hasValidContent(content);
};

/**
 * 获取 base64 图片的 URI
 * @param content base64 编码的图片内容（unknown 类型）
 * @returns 如果内容有效则返回 data URI，否则返回 null
 */
export const getBase64ImageUri = (content: unknown): string | null => {
  if (!isValidString(content)) {
    return null;
  }

  // 如果已经包含 data URI 前缀，直接使用
  if (content.startsWith('data:image/')) {
    return content;
  }

  // 否则添加默认的 data URI 前缀（假设是 JPEG）
  return `data:image/jpeg;base64,${content}`;
};

/**
 * 检测内容是否是 base64 图片并获取其 URI
 * @param content 待检测的内容（unknown 类型）
 * @returns 如果是 base64 图片则返回 URI，否则返回 null
 */
export const detectAndGetBase64ImageUri = (content: unknown): string | null => {
  if (!isValidString(content)) {
    return null;
  }

  if (isBase64String(content)) {
    return getBase64ImageUri(content);
  }

  return null;
};

/**
 * 从字符串或数组中检测是否是 base64 图片
 * @param content 内容（可以是字符串或数组）
 * @returns 如果是 base64 图片返回 true，否则返回 false
 */
export const isBase64ImageFromArray = (content: unknown): boolean => {
  // 如果是字符串，直接检测
  if (isValidString(content)) {
    return isBase64String(content);
  }
  
  // 如果是数组，获取第一个元素
  const firstString = getFirstStringFromArray(content);
  return firstString !== null ? isBase64String(firstString) : false;
};

/**
 * 从字符串或数组中获取 base64 图片的 URI（自动处理所有判定）
 * 内部包含所有必要的判定逻辑，可以直接调用
 * @param content 内容（可以是字符串或数组）
 * @returns 如果是 base64 图片则返回 URI，否则返回 null
 */
export const getBase64ImageUriFromArray = (content: unknown): string | null => {
  // 如果是字符串，直接处理
  if (isValidString(content)) {
    // 内部进行 base64 检测，只有是 base64 图片才返回 URI
    return detectAndGetBase64ImageUri(content);
  }
  
  // 如果是数组，获取第一个元素
  if (isValidArray(content)) {
    const firstElement = content[0];
    if (isValidString(firstElement)) {
      // 内部进行 base64 检测，只有是 base64 图片才返回 URI
      return detectAndGetBase64ImageUri(firstElement);
    }
  }
  
  // 其他情况返回 null
  return null;
};

