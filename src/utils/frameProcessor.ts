/**
 * 相机帧处理工具
 * 将相机帧转换为 TensorFlow 可处理的格式
 */

import { Frame } from 'react-native-vision-camera';
import * as FileSystem from 'expo-file-system';

/**
 * 从相机帧提取图像数据
 * @param frame - VisionCamera 帧对象
 * @returns base64 编码的 JPEG 图像
 */
export async function extractImageFromFrame(frame: Frame): Promise<string | null> {
  try {
    // VisionCamera 4.x 提供了 toDataURL 方法
    // 如果不可用，需要使用其他方法
    
    // 方法 1: 使用 frame.toString() (部分版本支持)
    if (typeof (frame as any).toDataURL === 'function') {
      return await (frame as any).toDataURL();
    }
    
    // 方法 2: 保存临时文件并读取
    const path = `${FileSystem.cacheDirectory}temp_frame.jpg`;
    
    // 注意：这需要相机配置支持照片捕获
    // 实际使用时可能需要调整
    
    return null;
  } catch (error) {
    console.error('提取帧图像失败:', error);
    return null;
  }
}

/**
 * 将 base64 图像转换为 Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // 移除 data URL 前缀
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * 缩放图像数据
 */
export function resizeImageData(
  data: Uint8Array,
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number
): Uint8Array {
  // 简单的最近邻插值
  const scaleX = width / targetWidth;
  const scaleY = height / targetHeight;
  const result = new Uint8Array(targetWidth * targetHeight * 3);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (srcY * width + srcX) * 3;
      const dstIdx = (y * targetWidth + x) * 3;

      result[dstIdx] = data[srcIdx];       // R
      result[dstIdx + 1] = data[srcIdx + 1]; // G
      result[dstIdx + 2] = data[srcIdx + 2]; // B
    }
  }

  return result;
}

