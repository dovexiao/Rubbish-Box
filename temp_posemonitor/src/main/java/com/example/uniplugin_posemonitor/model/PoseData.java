package com.example.uniplugin_posemonitor.model;

public class PoseData {
    public static final int NUM_KEYPOINTS = 17;
    private static final float GOOD_POSTURE_THRESHOLD = 0.7f;
    private static final float SHOULDER_ANGLE_THRESHOLD = 10.0f;
    private static final float HEAD_ANGLE_THRESHOLD = 15.0f;
    private static final int FRAME_THRESHOLD = 0;

    // 新增姿态检测阈值常量
    private static final float SHOULDER_LEVEL_THRESHOLD = 0.08f; // 放宽肩膀水平阈值
    private static final float HEAD_CENTER_THRESHOLD = 0.15f; // 放宽头部居中阈值
    private static final float HEAD_UP_THRESHOLD = 0.12f; // 放宽头部抬起阈值
    private static final float EARS_ALIGNED_THRESHOLD = 0.18f; // 放宽耳朵对齐阈值
    private static final float KEYPOINT_CONFIDENCE_THRESHOLD = 0.3f; // 降低关键点置信度阈值

    public static class KeyPoint {
        public float x;
        public float y;
        public float confidence;

        public KeyPoint(float x, float y, float confidence) {
            this.x = x;
            this.y = y;
            this.confidence = confidence;
        }
    }

    // MoveNet 关键点索引
    public static final int NOSE = 0;
    public static final int LEFT_EYE = 1;
    public static final int RIGHT_EYE = 2;
    public static final int LEFT_EAR = 3;
    public static final int RIGHT_EAR = 4;
    public static final int LEFT_SHOULDER = 5;
    public static final int RIGHT_SHOULDER = 6;
    public static final int LEFT_ELBOW = 7;
    public static final int RIGHT_ELBOW = 8;
    public static final int LEFT_WRIST = 9;
    public static final int RIGHT_WRIST = 10;
    public static final int LEFT_HIP = 11;
    public static final int RIGHT_HIP = 12;
    public static final int LEFT_KNEE = 13;
    public static final int RIGHT_KNEE = 14;
    public static final int LEFT_ANKLE = 15;
    public static final int RIGHT_ANKLE = 16;

    private KeyPoint[] keypoints;
    private float overallConfidence;
    private String status;
    private int correctFrames = 0;
    private int incorrectFrames = 0;
    private int previewWidth = 0;
    private int previewHeight = 0;

    public PoseData() {
        keypoints = new KeyPoint[NUM_KEYPOINTS];
        overallConfidence = 0.0f;
        status = "unknown";
    }

    public void setKeyPoint(int index, float x, float y, float confidence) {
        if (index >= 0 && index < NUM_KEYPOINTS) {
            keypoints[index] = new KeyPoint(x, y, confidence);
        }
    }

    public KeyPoint getKeyPoint(int index) {
        if (index >= 0 && index < NUM_KEYPOINTS) {
            return keypoints[index];
        }
        return null;
    }

    public float getShoulderAngle() {
        if (keypoints[5] != null && keypoints[6] != null) {
            float dx = keypoints[6].x - keypoints[5].x;
            float dy = keypoints[6].y - keypoints[5].y;
            return (float) Math.toDegrees(Math.atan2(dy, dx));
        }
        return 0.0f;
    }

    public float getHeadAngle() {
        if (keypoints[0] != null && keypoints[1] != null) {
            float dx = keypoints[1].x - keypoints[0].x;
            float dy = keypoints[1].y - keypoints[0].y;
            return (float) Math.toDegrees(Math.atan2(dy, dx));
        }
        return 0.0f;
    }

    public void updateStatus() {
        float shoulderAngle = Math.abs(getShoulderAngle());
        float headAngle = Math.abs(getHeadAngle());

        if (shoulderAngle > SHOULDER_ANGLE_THRESHOLD) {
            status = "shoulders_tilted";
        } else if (headAngle > HEAD_ANGLE_THRESHOLD) {
            status = "head_tilted";
        } else {
            status = "good";
        }
    }

    public String getStatus() {
        return status;
    }

    public boolean isGoodPosture() {
        return status.equals("good");
    }

    /**
     * 检查是否检测到人
     */
    public boolean isPersonDetected() {
        return !status.equals("no_person");
    }

    /**
     * 检查是否正在检测中
     */
    public boolean isDetecting() {
        return status.equals("detecting");
    }

    public float getOverallConfidence() {
        return overallConfidence;
    }

    public void setOverallConfidence(float confidence) {
        this.overallConfidence = confidence;
    }

    // 镜像处理：将所有关键点的 x 坐标做 1-x 变换
    public void mirrorKeypoints() {
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            if (keypoints[i] != null) {
                keypoints[i].x = 1.0f - keypoints[i].x;
            }
        }
    }

    // 关键点转字符串，便于日志输出
    public String keypointsToString() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            if (keypoints[i] != null) {
                sb.append(String.format("[%d](%.2f,%.2f,%.2f) ", i, keypoints[i].x, keypoints[i].y,
                        keypoints[i].confidence));
            }
        }
        return sb.toString();
    }

    public void setPreviewSize(int w, int h) {
        this.previewWidth = w;
        this.previewHeight = h;
        android.util.Log.d("PoseData", "Preview size set to: " + w + "x" + h);
    }

    // H5风格判定：肩膀水平
    public boolean isShouldersLevel() {
        KeyPoint leftShoulder = getKeyPoint(LEFT_SHOULDER);
        KeyPoint rightShoulder = getKeyPoint(RIGHT_SHOULDER);
        if (leftShoulder != null && rightShoulder != null &&
                leftShoulder.confidence > KEYPOINT_CONFIDENCE_THRESHOLD &&
                rightShoulder.confidence > KEYPOINT_CONFIDENCE_THRESHOLD) {
            float threshold = previewHeight * SHOULDER_LEVEL_THRESHOLD;
            float y1 = leftShoulder.y * previewHeight;
            float y2 = rightShoulder.y * previewHeight;
            float diff = Math.abs(y1 - y2);
            android.util.Log.d("PoseData",
                    String.format("Shoulder level check: y1=%.2f, y2=%.2f, diff=%.2f, threshold=%.2f",
                            y1, y2, diff, threshold));
            return diff < threshold;
        }
        android.util.Log.d("PoseData", "Shoulder level check failed: confidence too low");
        return false;
    }

    // 头部居中
    public boolean isHeadCentered() {
        KeyPoint nose = getKeyPoint(NOSE);
        KeyPoint leftShoulder = getKeyPoint(LEFT_SHOULDER);
        KeyPoint rightShoulder = getKeyPoint(RIGHT_SHOULDER);
        if (nose != null && leftShoulder != null && rightShoulder != null &&
                nose.confidence > KEYPOINT_CONFIDENCE_THRESHOLD) {
            float shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2 * previewWidth;
            float noseX = nose.x * previewWidth;
            float threshold = previewWidth * HEAD_CENTER_THRESHOLD;
            float diff = Math.abs(noseX - shoulderMidX);
            android.util.Log.d("PoseData",
                    String.format("Head center check: noseX=%.2f, shoulderMidX=%.2f, diff=%.2f, threshold=%.2f",
                            noseX, shoulderMidX, diff, threshold));
            return diff < threshold;
        }
        android.util.Log.d("PoseData", "Head center check failed: confidence too low");
        return false;
    }

    // 头部抬起
    public boolean isHeadUp() {
        KeyPoint nose = getKeyPoint(NOSE);
        KeyPoint leftShoulder = getKeyPoint(LEFT_SHOULDER);
        KeyPoint rightShoulder = getKeyPoint(RIGHT_SHOULDER);
        if (nose != null && leftShoulder != null && rightShoulder != null &&
                nose.confidence > KEYPOINT_CONFIDENCE_THRESHOLD) {
            float shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2 * previewHeight;
            float noseY = nose.y * previewHeight;
            float shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) * previewWidth;
            float threshold = shoulderWidth * HEAD_UP_THRESHOLD;
            float verticalDistance = shoulderMidY - noseY;
            android.util.Log.d("PoseData",
                    String.format("Head up check: shoulderMidY=%.2f, noseY=%.2f, verticalDistance=%.2f, threshold=%.2f",
                            shoulderMidY, noseY, verticalDistance, threshold));
            return verticalDistance > threshold;
        }
        android.util.Log.d("PoseData", "Head up check failed: confidence too low");
        return false;
    }

    // 耳朵对齐
    public boolean isEarsAligned() {
        KeyPoint leftEar = getKeyPoint(LEFT_EAR);
        KeyPoint rightEar = getKeyPoint(RIGHT_EAR);
        KeyPoint leftShoulder = getKeyPoint(LEFT_SHOULDER);
        KeyPoint rightShoulder = getKeyPoint(RIGHT_SHOULDER);
        if (leftEar != null && rightEar != null && leftShoulder != null && rightShoulder != null
                && leftEar.confidence > KEYPOINT_CONFIDENCE_THRESHOLD &&
                rightEar.confidence > KEYPOINT_CONFIDENCE_THRESHOLD) {
            float earMidX = (leftEar.x + rightEar.x) / 2 * previewWidth;
            float shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2 * previewWidth;
            float threshold = previewWidth * EARS_ALIGNED_THRESHOLD;
            float diff = Math.abs(earMidX - shoulderMidX);
            android.util.Log.d("PoseData",
                    String.format("Ears aligned check: earMidX=%.2f, shoulderMidX=%.2f, diff=%.2f, threshold=%.2f",
                            earMidX, shoulderMidX, diff, threshold));
            return diff < threshold;
        }
        android.util.Log.d("PoseData", "Ears aligned check failed: confidence too low");
        return false;
    }

    public void updateStatusH5Like() {
        // 获取关键点
        KeyPoint nose = getKeyPoint(NOSE);
        KeyPoint leftShoulder = getKeyPoint(LEFT_SHOULDER);
        KeyPoint rightShoulder = getKeyPoint(RIGHT_SHOULDER);
        KeyPoint leftEar = getKeyPoint(LEFT_EAR);
        KeyPoint rightEar = getKeyPoint(RIGHT_EAR);

        // 打印详细的判断值
        android.util.Log.d("PoseMonitorService", "=== 姿势判断详情 ===");

        // 检查关键点置信度
        boolean hasValidPoints = nose != null && leftShoulder != null && rightShoulder != null &&
                nose.confidence > KEYPOINT_CONFIDENCE_THRESHOLD &&
                leftShoulder.confidence > KEYPOINT_CONFIDENCE_THRESHOLD &&
                rightShoulder.confidence > KEYPOINT_CONFIDENCE_THRESHOLD;

        // 额外检查：确保检测到的关键点数量足够
        int validKeypointCount = 0;
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            KeyPoint kp = getKeyPoint(i);
            if (kp != null && kp.confidence > KEYPOINT_CONFIDENCE_THRESHOLD) {
                validKeypointCount++;
            }
        }

        // 如果有效关键点数量太少，认为没有检测到人
        boolean hasEnoughKeypoints = validKeypointCount >= 5; // 至少需要5个有效关键点

        // 检查关键点位置是否合理（防止误检测）
        boolean hasReasonablePositions = true;
        if (nose != null && leftShoulder != null && rightShoulder != null) {
            // 检查鼻子是否在肩膀之间
            float noseX = nose.x;
            float leftShoulderX = leftShoulder.x;
            float rightShoulderX = rightShoulder.x;

            // 确保左肩在左边，右肩在右边
            if (leftShoulderX > rightShoulderX) {
                float temp = leftShoulderX;
                leftShoulderX = rightShoulderX;
                rightShoulderX = temp;
            }

            // 鼻子应该在肩膀之间
            if (noseX < leftShoulderX - 0.1f || noseX > rightShoulderX + 0.1f) {
                hasReasonablePositions = false;
                android.util.Log.d("PoseMonitorService", "鼻子位置不合理: noseX=" + noseX +
                        ", leftShoulderX=" + leftShoulderX + ", rightShoulderX=" + rightShoulderX);
            }
        }

        android.util.Log.d("PoseMonitorService", "有效关键点数量: " + validKeypointCount + "/" + NUM_KEYPOINTS);

        if (!hasValidPoints || !hasEnoughKeypoints || !hasReasonablePositions) {
            android.util.Log.d("PoseMonitorService", "关键点置信度不足或数量不足，未检测到人");
            android.util.Log.d("PoseMonitorService", "nose=" + (nose != null ? nose.confidence : "null") +
                    ", leftShoulder=" + (leftShoulder != null ? leftShoulder.confidence : "null") +
                    ", rightShoulder=" + (rightShoulder != null ? rightShoulder.confidence : "null"));
            android.util.Log.d("PoseMonitorService",
                    "hasValidPoints=" + hasValidPoints + ", hasEnoughKeypoints=" + hasEnoughKeypoints +
                            ", hasReasonablePositions=" + hasReasonablePositions);
            status = "no_person";
            return;
        }

        // 计算肩膀水平度
        float shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        boolean shouldersLevel = shoulderYDiff < SHOULDER_LEVEL_THRESHOLD;

        // 计算头部位置
        float shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        float noseXDiff = Math.abs(nose.x - shoulderMidX);
        boolean headCentered = noseXDiff < HEAD_CENTER_THRESHOLD;

        // 计算头部高度
        float shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
        float headHeight = shoulderMidY - nose.y;
        boolean headUp = headHeight > HEAD_UP_THRESHOLD;

        android.util.Log.d("PoseMonitorService", "肩膀水平度: " + shoulderYDiff + " (阈值: " + SHOULDER_LEVEL_THRESHOLD + ")");
        android.util.Log.d("PoseMonitorService", "头部居中度: " + noseXDiff + " (阈值: " + HEAD_CENTER_THRESHOLD + ")");
        android.util.Log.d("PoseMonitorService", "头部高度: " + headHeight + " (阈值: " + HEAD_UP_THRESHOLD + ")");

        // 打印每个关键点的置信度
        android.util.Log.d("PoseMonitorService", "=== 关键点详情 ===");
        for (int i = 0; i < NUM_KEYPOINTS; i++) {
            KeyPoint kp = getKeyPoint(i);
            if (kp != null) {
                android.util.Log.d("PoseMonitorService",
                        "kp[" + i + "] x=" + kp.x + " y=" + kp.y + " conf=" + kp.confidence);
            }
        }

        // 判断姿势 - 详细状态判断
        android.util.Log.d("PoseMonitorService", "姿态判断结果: shouldersLevel=" + shouldersLevel +
                ", headCentered=" + headCentered + ", headUp=" + headUp);

        if (shouldersLevel && headCentered && headUp) {
            status = "good";
            correctFrames = 1;
            incorrectFrames = 0;
            android.util.Log.d("PoseMonitorService", "姿态良好");
        } else {
            // 判断具体的问题
            if (!shouldersLevel) {
                status = "shoulders_not_level";
                android.util.Log.d("PoseMonitorService", "肩膀不平");
            } else if (!headCentered) {
                status = "head_not_centered";
                android.util.Log.d("PoseMonitorService", "头部不居中");
            } else if (!headUp) {
                status = "head_not_up";
                android.util.Log.d("PoseMonitorService", "头部未抬起");
            } else {
                status = "incorrect";
                android.util.Log.d("PoseMonitorService", "姿态不正确");
            }
            correctFrames = 0;
            incorrectFrames = 1;
        }

        android.util.Log.d("PoseMonitorService",
                "status=" + status + ", correctFrames=" + correctFrames + ", incorrectFrames=" + incorrectFrames);
    }
}