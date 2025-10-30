/**
 * 姿势评估服务
 * 根据关键点数据判断坐姿是否正确
 */

import {
  KeyPoint,
  KeyPointIndex,
  PostureStatus,
  PoseData,
} from "../types/posture";

// 姿势检测阈值（与原生插件保持一致）
const THRESHOLDS = {
  SHOULDER_LEVEL: 0.08, // 肩膀水平阈值
  HEAD_CENTER: 0.15, // 头部居中阈值
  HEAD_UP: 0.12, // 头部抬起阈值
  KEYPOINT_CONFIDENCE: 0.3, // 关键点置信度阈值
  MIN_VALID_KEYPOINTS: 5, // 最少有效关键点数量
};

export class PostureEvaluator {
  /**
   * 评估姿势
   */
  evaluate(keypoints: KeyPoint[]): PostureStatus {
    // 1. 检查是否检测到足够的关键点
    if (!this.hasEnoughKeypoints(keypoints)) {
      return "no_person";
    }

    // 2. 检查关键关节点是否有效
    const nose = keypoints[KeyPointIndex.NOSE];
    const leftShoulder = keypoints[KeyPointIndex.LEFT_SHOULDER];
    const rightShoulder = keypoints[KeyPointIndex.RIGHT_SHOULDER];

    if (!this.areKeyPointsValid([nose, leftShoulder, rightShoulder])) {
      return "no_person";
    }

    // 3. 检查关键点位置是否合理
    if (!this.hasReasonablePositions(nose, leftShoulder, rightShoulder)) {
      return "no_person";
    }

    // 4. 评估肩膀是否水平
    if (!this.areShouldersLevel(leftShoulder, rightShoulder)) {
      return "shoulders_not_level";
    }

    // 5. 评估头部是否居中
    if (!this.isHeadCentered(nose, leftShoulder, rightShoulder)) {
      return "head_not_centered";
    }

    // 6. 评估头部是否抬起
    if (!this.isHeadUp(nose, leftShoulder, rightShoulder)) {
      return "head_not_up";
    }

    // 所有检查通过
    return "good";
  }

  /**
   * 检查是否有足够的有效关键点
   */
  private hasEnoughKeypoints(keypoints: KeyPoint[]): boolean {
    let validCount = 0;
    for (const kp of keypoints) {
      if (kp && kp.confidence > THRESHOLDS.KEYPOINT_CONFIDENCE) {
        validCount++;
      }
    }
    return validCount >= THRESHOLDS.MIN_VALID_KEYPOINTS;
  }

  /**
   * 检查关键点是否有效
   */
  private areKeyPointsValid(keypoints: (KeyPoint | undefined)[]): boolean {
    return keypoints.every(
      (kp) => kp && kp.confidence > THRESHOLDS.KEYPOINT_CONFIDENCE
    );
  }

  /**
   * 检查关键点位置是否合理
   */
  private hasReasonablePositions(
    nose: KeyPoint,
    leftShoulder: KeyPoint,
    rightShoulder: KeyPoint
  ): boolean {
    // 确保左肩在左边，右肩在右边
    let leftX = leftShoulder.x;
    let rightX = rightShoulder.x;

    if (leftX > rightX) {
      [leftX, rightX] = [rightX, leftX];
    }

    // 鼻子应该在肩膀之间（允许一定偏差）
    const margin = 0.1;
    if (nose.x < leftX - margin || nose.x > rightX + margin) {
      return false;
    }

    // 鼻子应该在肩膀上方
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    if (nose.y >= shoulderMidY) {
      return false;
    }

    return true;
  }

  /**
   * 检查肩膀是否水平
   */
  private areShouldersLevel(
    leftShoulder: KeyPoint,
    rightShoulder: KeyPoint
  ): boolean {
    const yDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    return yDiff < THRESHOLDS.SHOULDER_LEVEL;
  }

  /**
   * 检查头部是否居中
   */
  private isHeadCentered(
    nose: KeyPoint,
    leftShoulder: KeyPoint,
    rightShoulder: KeyPoint
  ): boolean {
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const xDiff = Math.abs(nose.x - shoulderMidX);
    return xDiff < THRESHOLDS.HEAD_CENTER;
  }

  /**
   * 检查头部是否抬起
   */
  private isHeadUp(
    nose: KeyPoint,
    leftShoulder: KeyPoint,
    rightShoulder: KeyPoint
  ): boolean {
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const headHeight = shoulderMidY - nose.y;
    return headHeight > THRESHOLDS.HEAD_UP;
  }

  /**
   * 计算整体置信度
   */
  calculateConfidence(keypoints: KeyPoint[]): number {
    let totalConfidence = 0;
    let validCount = 0;

    for (const kp of keypoints) {
      if (kp && kp.confidence > THRESHOLDS.KEYPOINT_CONFIDENCE) {
        totalConfidence += kp.confidence;
        validCount++;
      }
    }

    return validCount > 0 ? totalConfidence / validCount : 0;
  }

  /**
   * 获取状态描述文本
   */
  getStatusText(status: PostureStatus): string {
    switch (status) {
      case "good":
        return "✅ 坐姿正确，继续保持";
      case "shoulders_not_level":
        return "⚠️ 请保持肩膀放松，不要耸肩";
      case "head_not_centered":
        return "⚠️ 请保持头部居中，不要歪头";
      case "head_not_up":
        return "⚠️ 请抬头挺胸，保持正确坐姿";
      case "no_person":
        return "🔍 未检测到人，请确保在画面中";
      case "detecting":
        return "🔍 正在检测坐姿...";
      default:
        return "🔍 检测中...";
    }
  }

  /**
   * 获取音频提示类型
   */
  getAudioType(status: PostureStatus): string | null {
    switch (status) {
      case "good":
        return "good_posture";
      case "shoulders_not_level":
        return "shoulders_not_level";
      case "head_not_centered":
        return "head_not_centered";
      case "head_not_up":
        return "head_not_up";
      default:
        return null;
    }
  }
}

// 导出单例
export const postureEvaluator = new PostureEvaluator();

