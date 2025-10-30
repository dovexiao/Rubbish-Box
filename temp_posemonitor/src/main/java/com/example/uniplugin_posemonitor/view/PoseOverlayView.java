package com.example.uniplugin_posemonitor.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import com.example.uniplugin_posemonitor.model.PoseData;

public class PoseOverlayView extends View {
    private static final String TAG = "PoseOverlayView";
    private PoseData poseData;
    private Paint paint;
    private int previewWidth = 0;
    private int previewHeight = 0;

    public PoseOverlayView(Context context) {
        super(context);
        init();
    }

    public PoseOverlayView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    private void init() {
        paint = new Paint();
        paint.setAntiAlias(true);
    }

    public void setPoseData(PoseData data) {
        this.poseData = data;
        invalidate();
    }

    public void setPreviewSize(int width, int height) {
        if (this.previewWidth != width || this.previewHeight != height) {
            this.previewWidth = width;
            this.previewHeight = height;
            requestLayout();
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (poseData == null || previewWidth <= 0 || previewHeight <= 0) {
            return;
        }

        try {
            // 1. 绘制所有关键点（红色圆点）
            paint.setColor(Color.RED);
            paint.setStyle(Paint.Style.FILL);
            for (int i = 0; i < PoseData.NUM_KEYPOINTS; i++) {
                PoseData.KeyPoint kp = poseData.getKeyPoint(i);
                if (kp != null && kp.confidence > 0.1f) {
                    float x = kp.x * getWidth();
                    float y = kp.y * getHeight();
                    canvas.drawCircle(x, y, 10f, paint);
                }
            }

            // 2. 绘制骨架连线（黄色）
            paint.setColor(Color.YELLOW);
            paint.setStrokeWidth(5f);
            // 头部
            drawLine(canvas, PoseData.NOSE, PoseData.LEFT_EYE);
            drawLine(canvas, PoseData.NOSE, PoseData.RIGHT_EYE);
            drawLine(canvas, PoseData.LEFT_EYE, PoseData.LEFT_EAR);
            drawLine(canvas, PoseData.RIGHT_EYE, PoseData.RIGHT_EAR);
            // 躯干
            drawLine(canvas, PoseData.LEFT_SHOULDER, PoseData.RIGHT_SHOULDER);
            drawLine(canvas, PoseData.LEFT_SHOULDER, PoseData.LEFT_HIP);
            drawLine(canvas, PoseData.RIGHT_SHOULDER, PoseData.RIGHT_HIP);
            // 四肢
            drawLine(canvas, PoseData.LEFT_SHOULDER, PoseData.LEFT_ELBOW);
            drawLine(canvas, PoseData.LEFT_ELBOW, PoseData.LEFT_WRIST);
            drawLine(canvas, PoseData.RIGHT_SHOULDER, PoseData.RIGHT_ELBOW);
            drawLine(canvas, PoseData.RIGHT_ELBOW, PoseData.RIGHT_WRIST);
            drawLine(canvas, PoseData.LEFT_HIP, PoseData.LEFT_KNEE);
            drawLine(canvas, PoseData.LEFT_KNEE, PoseData.LEFT_ANKLE);
            drawLine(canvas, PoseData.RIGHT_HIP, PoseData.RIGHT_KNEE);
            drawLine(canvas, PoseData.RIGHT_KNEE, PoseData.RIGHT_ANKLE);

            // 3. 高亮肩膀连线（红色）
            PoseData.KeyPoint leftShoulder = poseData.getKeyPoint(PoseData.LEFT_SHOULDER);
            PoseData.KeyPoint rightShoulder = poseData.getKeyPoint(PoseData.RIGHT_SHOULDER);
            if (leftShoulder != null && rightShoulder != null &&
                    leftShoulder.confidence > 0.1f && rightShoulder.confidence > 0.1f) {
                paint.setColor(Color.RED);
                paint.setStrokeWidth(6f);
                float x1 = leftShoulder.x * getWidth();
                float y1 = leftShoulder.y * getHeight();
                float x2 = rightShoulder.x * getWidth();
                float y2 = rightShoulder.y * getHeight();
                canvas.drawLine(x1, y1, x2, y2, paint);
            }

            // 4. 高亮头部连线（蓝色，鼻子到两肩中点）
            PoseData.KeyPoint nose = poseData.getKeyPoint(PoseData.NOSE);
            if (nose != null && leftShoulder != null && rightShoulder != null &&
                    nose.confidence > 0.1f) {
                paint.setColor(Color.BLUE);
                paint.setStrokeWidth(6f);
                float xNose = nose.x * getWidth();
                float yNose = nose.y * getHeight();
                float xShoulderMid = (leftShoulder.x + rightShoulder.x) / 2 * getWidth();
                float yShoulderMid = (leftShoulder.y + rightShoulder.y) / 2 * getHeight();
                canvas.drawLine(xNose, yNose, xShoulderMid, yShoulderMid, paint);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error drawing pose overlay", e);
        }
    }

    private void drawLine(Canvas canvas, int point1, int point2) {
        PoseData.KeyPoint kp1 = poseData.getKeyPoint(point1);
        PoseData.KeyPoint kp2 = poseData.getKeyPoint(point2);
        if (kp1 != null && kp2 != null && kp1.confidence > 0.5f && kp2.confidence > 0.5f) {
            float x1 = kp1.x * getWidth();
            float y1 = kp1.y * getHeight();
            float x2 = kp2.x * getWidth();
            float y2 = kp2.y * getHeight();
            canvas.drawLine(x1, y1, x2, y2, paint);
        }
    }
}